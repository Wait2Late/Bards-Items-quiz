/**
 * Scrape OP.GG for champion roles and their pick rates per role.
 * 
 * How it works:
 * - Opens the champions list page to collect champion slugs
 * - Visits each champion's page (build) and captures JSON responses
 * - Extracts role/pick-rate pairs from network JSON or embedded Next.js data
 * - Saves results to champion-roles.json
 * 
 * Run from scraper folder:
 *   node scraper-opgg-roles.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT_FILE = path.resolve(__dirname, 'champion-roles.json');
const DEBUG_DIR = path.resolve(__dirname, 'debug');

const REGION = 'global'; // alternatives: kr, na, euw, etc.
const TIER = 'platinum_plus'; // iron, bronze, silver, gold, platinum_plus, diamond_plus, master_plus

// Throttling controls
const CONCURRENCY = Number(process.env.OPGG_CONCURRENCY || 1); // 1 = one tab at a time
const PER_CHAMPION_DELAY_MS = Number(process.env.OPGG_DELAY_MS || 1200); // delay between champions
const LIMIT = Number(process.env.OPGG_LIMIT || 0); // 0 = all, otherwise process first N champs

const AllowedRoles = new Set(['TOP','JUNGLE','MID','ADC','SUPPORT']);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).toLowerCase();
  if (/(top|baron)/.test(r)) return 'TOP';
  if (/(jungle|jungler)/.test(r)) return 'JUNGLE';
  if (/(mid|middle)/.test(r)) return 'MID';
  if (/(bot|bottom|adc|carry)/.test(r)) return 'ADC';
  if (/(support|sup|utility)/.test(r)) return 'SUPPORT';
  return role.toUpperCase();
}

function asRate(num) {
  if (num == null) return null;
  const n = typeof num === 'string' ? parseFloat(num.replace(/%/g, '')) : Number(num);
  if (Number.isNaN(n)) return null;
  // Acceptable values:
  // - 0..1 already normalized
  // - 0..100 percentage -> divide by 100
  if (n <= 1) return +n.toFixed(4);
  if (n <= 100) return +(n / 100).toFixed(4);
  return null; // out of range, likely not a rate
}

// Deeply search any JSON object for arrays of role/pick-rate pairs
function findRolePickRatesDeep(value, found = []) {
  try {
    if (!value || typeof value !== 'object') return found;

    // Direct object with role/position + pick fields
    if (!Array.isArray(value)) {
      const keys = Object.keys(value);
      const hasPos = keys.some(k => /^(role|position|lane|pos)$/i.test(k));
      const pickKey = keys.find(k => /pick[_ ]?rate|play[_ ]?rate|rate|ratio|pick/i.test(k));
      if (hasPos && pickKey) {
        const roleRaw = value.role ?? value.position ?? value.lane ?? value.pos;
        const pickRaw = value[pickKey];
        const role = normalizeRole(roleRaw);
        const pickRate = asRate(pickRaw);
        if (role && AllowedRoles.has(role) && pickRate != null && pickRate > 0 && pickRate <= 1) {
          found.push({ role, pickRate });
        }
      }
    }

    // Arrays of such objects
    if (Array.isArray(value)) {
      // If the array contains role objects, add them all
      const maybeRoleObjects = value.filter(v => v && typeof v === 'object');
      const roleObjs = maybeRoleObjects.filter(v => {
        const keys = Object.keys(v);
        return keys.some(k => /^(role|position|lane|pos)$/i.test(k)) && keys.some(k => /pick[_ ]?rate|play[_ ]?rate|rate|ratio|pick/i.test(k));
      });
      if (roleObjs.length >= 2) {
        roleObjs.forEach(v => {
          const pickKey = Object.keys(v).find(k => /pick[_ ]?rate|play[_ ]?rate|rate|ratio|pick/i.test(k));
          const role = normalizeRole(v.role ?? v.position ?? v.lane ?? v.pos);
          const pickRate = asRate(v[pickKey]);
          if (role && AllowedRoles.has(role) && pickRate != null && pickRate > 0 && pickRate <= 1) {
            found.push({ role, pickRate });
          }
        });
      }
    }
    // Recurse children
    for (const k of Object.keys(value)) {
      const child = value[k];
      if (child && typeof child === 'object') findRolePickRatesDeep(child, found);
    }
  } catch (_) { /* ignore */ }
  return found;
}

// Collect roles even when pick rates are not available (top-level)
function findRolesDeep(value, acc = new Set()) {
  try {
    if (!value || typeof value !== 'object') return acc;
    if (!Array.isArray(value)) {
      const keys = Object.keys(value);
      const hasPos = keys.some(k => /^(role|position|lane|pos|positions)$/i.test(k));
      if (hasPos) {
        const roleRaw = value.role ?? value.position ?? value.lane ?? value.pos;
        const rolesArr = value.positions;
        if (Array.isArray(rolesArr)) {
          for (const r of rolesArr) {
            const nr = normalizeRole(r?.name || r?.code || r);
            if (nr && AllowedRoles.has(nr)) acc.add(nr);
          }
        }
        const nr = normalizeRole(roleRaw);
        if (nr && AllowedRoles.has(nr)) acc.add(nr);
      }
    } else {
      for (const el of value) {
        if (el && typeof el === 'object') {
          const keys = Object.keys(el);
          if (keys.some(k => /^(role|position|lane|pos)$/i.test(k))) {
            const nr = normalizeRole(el.role ?? el.position ?? el.lane ?? el.pos);
            if (nr && AllowedRoles.has(nr)) acc.add(nr);
          }
        }
      }
    }
    for (const k of Object.keys(value)) {
      const child = value[k];
      if (child && typeof child === 'object') findRolesDeep(child, acc);
    }
  } catch (_) {}
  return acc;
}

async function extractFromNextData(page) {
  try {
    const blobs = await page.evaluate(() => {
      const out = [];
      for (const s of Array.from(document.querySelectorAll('script'))) {
        const type = s.getAttribute('type') || '';
        if (type.includes('json') || s.id === '__NEXT_DATA__') {
          const txt = s.textContent || '';
          if (txt && /position|role|pickRate|playRate|ratio/i.test(txt)) {
            out.push(txt);
          }
        }
      }
      return out;
    });
    const all = [];
    for (const txt of blobs) {
      try {
        const json = JSON.parse(txt);
        all.push(json);
      } catch (_) {
        // some next scripts may be non-JSON or concatenated; try loose matching later
      }
    }
    const roles = [];
    all.forEach(obj => findRolePickRatesDeep(obj, roles));
    return roles;
  } catch (_) {
    return [];
  }
}

async function getChampionSlugs(page) {
  // Navigate to champions list
  const listUrl = `https://op.gg/lol/champions?region=${REGION}&tier=${TIER}&position=all`;
  // capture potential API json while loading
  const captured = [];
  const onResp = async (response) => {
    try {
      const req = response.request();
      const type = req.resourceType();
      const url = response.url();
      if (!/(xhr|fetch)/i.test(type)) return;
      if (!/op\.gg|opgg|lol-web-api\.op\.gg|c-lol-web\.op\.gg/i.test(url)) return;
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('application/json')) return;
      const json = await response.json().catch(() => null);
      if (!json) return;
      captured.push({ url, json });
    } catch (_) {}
  };
  page.on('response', onResp);

  await page.goto(listUrl, { waitUntil: 'domcontentloaded' });
  // wait for any client rendering
  await page.waitForSelector('a[href^="/lol/champions/"]', { timeout: 10000 }).catch(() => {});
  await page.waitForNetworkIdle({ idleTime: 1200, timeout: 20000 }).catch(() => {});
  await sleep(1000);

  let slugs = await page.evaluate(() => {
    const aTags = Array.from(document.querySelectorAll('a[href^="/lol/champions/"]'));
    const set = new Set();
    for (const a of aTags) {
      const href = a.getAttribute('href') || '';
      const m = href.match(/\/lol\/champions\/([^\/?#]+)\//i);
      if (m && m[1]) set.add(m[1]);
    }
    return Array.from(set);
  });

  // If DOM approach failed, try JSON responses for champion identifiers
  if (!slugs || slugs.length === 0) {
    const guessSlug = (name) => {
      if (!name) return null;
      return String(name).toLowerCase().replace(/[^a-z]/g, '');
    };
    const add = new Set();
    for (const { json } of captured) {
      // Look for arrays of champions with id/name fields
      const stack = [json];
      while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== 'object') continue;
        if (Array.isArray(cur)) {
          if (cur.length > 2 && cur.every(v => v && typeof v === 'object')) {
            for (const c of cur) {
              const candidate = c?.slug || c?.alias || c?.id || c?.code || c?.name || c?.championName;
              const slug = (c?.slug || c?.alias) || guessSlug(candidate);
              if (slug && slug.length >= 3) add.add(slug);
            }
          }
        }
        for (const k of Object.keys(cur)) stack.push(cur[k]);
      }
    }
    slugs = Array.from(add);
  }

  page.off('response', onResp);
  return slugs;
}

async function processChampion(browser, slug) {
  const page = await browser.newPage();
  const url = `https://op.gg/lol/champions/${slug}/build?region=${REGION}&tier=${TIER}`;

  const captured = [];
  const onResponse = async (response) => {
    try {
      const req = response.request();
      const type = req.resourceType();
      const url = response.url();
      if (!/(xhr|fetch)/i.test(type)) return;
      // Focus on OP.GG web API JSON
      if (!/op\.gg|opgg|lol-web-api\.op\.gg|c-lol-web\.op\.gg/i.test(url)) return;
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('application/json')) return;
      const json = await response.json().catch(() => null);
      if (!json) return;
      captured.push({ url, json });
    } catch (_) {}
  };
  page.on('response', onResponse);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // let the page load its data
  await page.waitForNetworkIdle({ idleTime: 1000, timeout: 20000 }).catch(() => {});
  await sleep(800);

  // Try to get champion name from DOM/meta
  const name = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent) return h1.textContent.trim();
    const og = document.querySelector('meta[property="og:title"]');
    if (og) {
      const v = og.getAttribute('content') || '';
      return v.split(' - ')[0].trim();
    }
    // Try title fallback
    return (document.title || '').replace(/\s*-\s*OP\.GG.*/i, '').trim();
  });

  // Prefer roles from captured JSON
  let roles = [];
  for (const { json } of captured) {
    const found = findRolePickRatesDeep(json, []);
    if (found.length) roles.push(...found);
    // if no pick rates found, collect plain roles
    if (!found.length) {
      const set = findRolesDeep(json, new Set());
      if (set.size) roles.push(...Array.from(set).map(r => ({ role: r, pickRate: null })));
    }
  }

  // Debug: save captured JSON for this champion to inspect structure if no roles found
  if (!roles.length) {
    try {
      const debugPath = path.join(DEBUG_DIR, `captured-${slug}.json`);
      fs.writeFileSync(debugPath, JSON.stringify(captured, null, 2), 'utf-8');
    } catch (_) {}
  }

  // Fallback: scrape roles from the DOM heuristically
  if (!roles.length) {
    try {
      const domRoles = await page.evaluate(() => {
        const Allowed = new Set(['TOP','JUNGLE','MID','ADC','SUPPORT']);
        function normRole(t) {
          if (!t) return null;
          const r = String(t).toLowerCase();
          if (/^(top|baron)$/.test(r)) return 'TOP';
          if (/^(jungle|jungler|jng)$/.test(r)) return 'JUNGLE';
          if (/^(middle|mid)$/.test(r)) return 'MID';
          if (/^(bottom|bot|adc|carry)$/.test(r)) return 'ADC';
          if (/^(support|sup|utility)$/.test(r)) return 'SUPPORT';
          return null;
        }
        function asRate(n) {
          if (n == null) return null;
          if (typeof n === 'string') {
            const m = n.match(/([0-9]+(?:\.[0-9]+)?)%/);
            if (m) return parseFloat(m[1]) / 100;
          }
          const v = Number(n);
          if (!Number.isFinite(v)) return null;
          if (v <= 1) return v;
          if (v <= 100) return v / 100;
          return null;
        }

        const result = [];
        const roleLabels = Array.from(document.querySelectorAll('*')).filter(el => {
          const txt = (el.textContent || '').trim();
          const aria = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('alt'))) || '';
          return /^(Top|Jungle|Middle|Mid|Bottom|ADC|Support)$/i.test(txt) || /^(Top|Jungle|Middle|Mid|Bottom|ADC|Support)$/i.test(aria);
        });

        for (const el of roleLabels) {
          const label = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('alt') || '').trim();
          const role = normRole(label);
          if (!role || !Allowed.has(role)) continue;

          // Find nearest container with Pick Rate label or a % figure
          let container = el;
          let rate = null;
          for (let depth = 0; depth < 6 && container && rate == null; depth++) {
            // Prefer elements explicitly mentioning Pick Rate
            const pickEls = Array.from(container.querySelectorAll('*')).filter(x => /Pick\s*Rate/i.test(x.textContent || ''));
            for (const p of pickEls) {
              const pct = (p.nextElementSibling && (p.nextElementSibling.textContent || '')) || '';
              const m = pct.match(/([0-9]+(?:\.[0-9]+)?)%/);
              if (m) { rate = parseFloat(m[1]) / 100; break; }
            }
            if (rate == null) {
              const pctEl = Array.from(container.querySelectorAll('*')).find(x => /([0-9]+(?:\.[0-9]+)?)%/.test(x.textContent || ''));
              if (pctEl) {
                const m = (pctEl.textContent || '').match(/([0-9]+(?:\.[0-9]+)?)%/);
                if (m) rate = parseFloat(m[1]) / 100;
              }
            }
            container = container.parentElement;
          }
          if (rate != null && rate > 0 && rate <= 1) {
            result.push({ role, pickRate: asRate(rate) });
          }
        }
        return result;
      });
      if (domRoles && domRoles.length) roles = domRoles;
    } catch (_) {}
  }

  // Deduplicate roles by best pickRate (but keep role-only entries if no rate exists)
  const bestByRole = new Map();
  for (const r of roles) {
    if (!r || !r.role) continue;
    const prev = bestByRole.get(r.role);
    if (!prev) bestByRole.set(r.role, r);
    else if (prev.pickRate == null && r.pickRate != null) bestByRole.set(r.role, r);
    else if (r.pickRate != null && prev.pickRate != null && r.pickRate > prev.pickRate) bestByRole.set(r.role, r);
  }
  roles = Array.from(bestByRole.values());

  // Fallback to Next.js embedded data
  if (!roles.length) {
    const nextRoles = await extractFromNextData(page);
    if (nextRoles.length) roles = nextRoles;
    else {
      // last-resort: DOM role tabs on champion page
      try {
        const domRoles = await page.evaluate(() => {
          const Allowed = new Set(['TOP','JUNGLE','MID','ADC','SUPPORT']);
          function normRole(t) {
            const r = String(t||'').toLowerCase();
            if (/top|baron/.test(r)) return 'TOP';
            if (/jungle|jungler|jng/.test(r)) return 'JUNGLE';
            if (/mid|middle/.test(r)) return 'MID';
            if (/adc|bottom|bot|carry/.test(r)) return 'ADC';
            if (/support|sup|utility/.test(r)) return 'SUPPORT';
            return null;
          }
          const out = new Set();
          // role switcher/nav
          const labels = Array.from(document.querySelectorAll('nav *, [role="tab"], [class*="role"], [class*="position"], [data-*]'));
          for (const el of labels) {
            const txt = (el.textContent || '').trim();
            const aria = (el.getAttribute && (el.getAttribute('aria-label')||el.getAttribute('title')||el.getAttribute('alt'))) || '';
            const n1 = normRole(txt);
            const n2 = normRole(aria);
            if (n1 && Allowed.has(n1)) out.add(n1);
            if (n2 && Allowed.has(n2)) out.add(n2);
          }
          return Array.from(out).map(r => ({ role: r, pickRate: null }));
        });
        if (domRoles && domRoles.length) roles = domRoles;
      } catch (_) {}
    }
  }

  await page.close();

  return {
    slug,
    name: name || slug,
    roles: roles
      .filter(r => r && r.role)
      .reduce((acc, cur) => {
        // dedupe by role, prefer one with pickRate if available
        const idx = acc.findIndex(x => x.role === cur.role);
        if (idx === -1) acc.push(cur);
        else if (acc[idx].pickRate == null && cur.pickRate != null) acc[idx] = cur;
        return acc;
      }, [])
      .sort((a, b) => (b.pickRate ?? -1) - (a.pickRate ?? -1))
  };
}

(async () => {
  const results = [];
  if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  console.log('Collecting champion slugs from OP.GG...');
    let slugs = await getChampionSlugs(page);
    if (LIMIT > 0 && slugs.length > LIMIT) {
      slugs = slugs.slice(0, LIMIT);
    }
    console.log(`Found ${slugs.length} champion slugs${LIMIT>0?` (limited to first ${LIMIT})`:''}`);
  try { await page.screenshot({ path: path.join(DEBUG_DIR, 'champions-list.png'), fullPage: true }); } catch (_) {}

  // Concurrency-limited processing of all champions
  console.log(`Processing all ${slugs.length} champions with concurrency ${CONCURRENCY} and delay ~${PER_CHAMPION_DELAY_MS}ms...`);
    let index = 0;
    const queue = [...slugs];
    async function worker(id) {
      while (queue.length) {
        const slug = queue.shift();
        const cur = ++index;
        process.stdout.write(` [${cur}/${slugs.length}] ${slug}...`);
        try {
          const data = await processChampion(browser, slug);
          results.push(data);
          process.stdout.write(' done\n');
        } catch (err) {
          process.stdout.write(` error: ${err.message}\n`);
        }
        // Throttle between champions
        const jitter = Math.floor(Math.random() * 250);
        await sleep(PER_CHAMPION_DELAY_MS + jitter);
      }
    }
    const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i+1));
    await Promise.all(workers);

    // Save
    fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Saved ${results.length} champions with roles to ${path.basename(OUT_FILE)}`);

    // Quick summary
  const withAnyRole = results.filter(r => r.roles && r.roles.length);
  console.log(`Champions with at least one role: ${withAnyRole.length}/${results.length}`);

  } catch (e) {
    console.error('Failed:', e);
  } finally {
    await browser.close();
  }
})();
