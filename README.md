## Bard's Item Quiz

A small, for-fun project where I learned TypeScript by building an interactive web page that suggests items for Bard based on both teams' champion compositions. It pulls live data from Riot's Data Dragon and a tiny wiki scraper I wrote, then scores items with a simple, explainable rule system.

### How to play
1. Select champions for both teams using the dropdowns. Your team has a special Bard slot. You can also generate new random teams.
2. Choose up to 4 items for Bard (3 regular items + boots). The dropdowns will disable already-selected items.
3. Once all item slots are filled, view the suggested top 3 items for "If winning" and "If losing" scenarios, based on the current champion compositions.

![Quiz demonstration](/assets/Quiz-demonstration.gif)




### Why I built this
- Learn and practice TypeScript with strict settings.
- Explore DOM-driven UI patterns (dropdowns, state, conditional rendering).
- Use real game data (champions, items, images) via public APIs.
- Have fun theorycrafting Bard builds and making the page look nice.

### What it does
- Role-based champion pickers for both teams, with duplicate prevention and a special Bard slot on my team.
- Four item slots (3 items + boots) with shared state so you can’t pick the same item twice.
- Live “If winning / If losing” top-3 suggested items with icons and hover titles.
- Bard splash background and a simple, centered layout.

### Data sources and APIs
- Riot Data Dragon (official static data)
	- Champions list and square icons: `https://ddragon.leagueoflegends.com`
	- Items JSON and item icons by patch version.
	- Full splash background for Bard (non-versioned path).
- Wiki-derived role data (local file): `scraper/champion-wiki-data.json`
	- Collected with a Puppeteer script to map champions → roles, class, and adaptive type.

### Implementation highlights
- TypeScript-first with strict options (noUncheckedIndexedAccess, exactOptionalPropertyTypes, etc.).
- Fetches the current patch once, caches it, and builds all image URLs consistently from it.
- Name normalization and role mapping so wiki names match Data Dragon IDs (e.g., Nunu & Willump).
- Dropdown UX: disables already-selected options across all item selects and champion selects.
- Summary shows only when all item slots are filled.
- Item suggestion engine:
	- Tags per item (Armor, MR, AntiShield, AntiAS, TankBuster, AmpMagic, Frontline, etc.).
	- Weights computed from enemy and team composition (AP/AD counts, tanks, shields, poke, crit, AS, DoT) and whether you’re winning or losing.
	- Scores items by summing tag weights and renders the top 3 for each state.

### Challenges I ran into (and what I learned)
- Patch versioning: item/champion square icons need a patch in the URL; champion splash does not. I fixed image paths by caching the current patch and using the right path for the splash.
- Name mismatches: wiki names don’t always match Data Dragon IDs. I added normalization and fallback matching.
- Shared state between dropdowns: to prevent duplicate selections, I track selected IDs and disable options across all selects.
- Subtle logic bugs: it’s easy to mix up signals (e.g., AntiAS should key off enemy attack speed, not crit). Keeping weights isolated in a function makes fixes straightforward.
- CSS polish: background overlays and dropdown positioning needed a few iterations to avoid overlap and keep things legible.

### Possible next steps
- Tighten types (less `any`), rename a couple of typos, and add an ESLint config.
- Add a lightweight test or two for `computeWeights` and `scoreItems`.
- Enrich tags/weights and add tiny explanations next to suggested items (“Because enemy has 3 AD threats”).
- Optional: small static server script in `package.json` and a watch build for TS.

### Credits and legal
- Uses Riot’s Data Dragon assets and JSON. Bard and all related assets are trademarks of Riot Games, Inc. This project isn’t endorsed by Riot and is for educational/personal use.

---

Built for fun and learning. If you’ve got feedback on the item logic or UI, I’d love to iterate on it.
