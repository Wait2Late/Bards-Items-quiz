/**
 * Scraper for League of Legends Wiki
 * Scrapes champion information including roles, class, legacy class, and adaptive type
 * from https://wiki.leagueoflegends.com/en-us/{Champion}
 * 
 * To scrape the wiki use this command line
 * $env:WIKI_LIMIT=0; node scraper-wiki.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');


async function fetchCurrentPatch() {
    try {
        const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error("Error fetching patch version:", error);
        return null;
    }
}

async function getChampionData() {
    const currentPatch = await fetchCurrentPatch();
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentPatch}/data/en_US/champion.json`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching champion data:", error);
        return {};
    }
}

// Convert Data Dragon champion data to list of champions
async function loadChampionList() {
    try {
        const championData = await getChampionData();
        // Convert the champions object to an array with id and name
        return Object.values(championData).map(champ => ({
            id: champ.id,
            name: champ.name,
            key: champ.key
        }));
    } catch (error) {
        console.error('Error loading champion data from Data Dragon:', error);
        return [];
    }
}

// Convert champion id to proper wiki URL format
function formatChampionName(championId) {
    // Data Dragon champion IDs are already in the correct format for most cases
    // Handle special cases that need URL encoding or different formatting
    const specialCases = {
        'MonkeyKing': 'Wukong',
        'Nunu': 'Nunu_%26_Willump',
        'DrMundo': 'Dr._Mundo',
        'MissFortune': 'Miss_Fortune',
        'TwistedFate': 'Twisted_Fate',
        'JarvanIV': 'Jarvan_IV',
        'MasterYi': 'Master_Yi',
        'XinZhao': 'Xin_Zhao',
        'LeeSin': 'Lee_Sin',
        'TahmKench': 'Tahm_Kench',
        'KogMaw': "Kog'Maw",
        'ChoGath': "Cho'Gath",
        'KhaZix': "Kha'Zix",
        'VelKoz': "Vel'Koz",
        'RekSai': "Rek'Sai",
        'KaiSa': "Kai'Sa",
        'Belveth': "Bel'Veth",
        'AurelionSol': 'Aurelion_Sol',
        'RenataGlasc': 'Renata_Glasc'
    };

    if (specialCases[championId]) {
        return specialCases[championId];
    }

    // Return the champion ID as-is for most champions
    return championId;
}

// Scrape a single champion's wiki page
async function scrapeChampionWiki(page, champion) {
    const championName = formatChampionName(champion.id);
    const url = `https://wiki.leagueoflegends.com/en-us/${championName}`;

    console.log(`Scraping ${champion.name} (${champion.id})...`);

    let championData = null;

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Extract champion data from the page
        championData = await page.evaluate(() => {
            const data = {
                roles: [],
                class: null,
                legacyClass: [],
                adaptiveType: null,
                debug: [] // Add debug array to capture logs
            };

            // Extract role from "ROLE(S):" section - try multiple methods
            // Method 1: Look for text containing ROLE(S):
            let roleText = document.body.innerText;
            let roleMatch = roleText.match(/ROLE\(S\):\s*([^\n]+)/i);
            if (roleMatch) {
                data.debug.push(`Found ROLE(S): text: ${roleMatch[1]}`);
            }

            // Method 2: Look for links near ROLE text
            const roleLinks = document.querySelectorAll('a');
            roleLinks.forEach(link => {
                const href = link.getAttribute('href') || '';
                const text = link.textContent.trim();
                
                // Check if this is a role link (Middle, Top, Jungle, Support, Bottom)
                if (href.includes('Category:') && 
                    (text === 'Middle' || text === 'Top' || text === 'Jungle' || text === 'Support' || text === 'Bottom')) {
                if (!data.roles.includes(text)) {
                    data.debug.push(`Found role link: ${text}`);
                    data.roles.push(text);
                }
            }
        });

        // Extract class and legacy class from page text and links
        data.debug.push('Searching for class information in page text...');
        
        // Look for category links that might contain class information
        const allLinks = document.querySelectorAll('a');
        data.debug.push(`Found ${allLinks.length} total links on page`);
        
        // Modern subclass system (these are the specific subclasses)
        const modernSubclasses = ['Juggernaut', 'Diver', 'Assassin', 'Skirmisher', 'Burst', 'Battlemage', 'Artillery', 'Marksman', 'Enchanter', 'Catcher', 'Vanguard', 'Warden', 'Specialist'];
        // Legacy classes (pre-2017)
        const legacyClasses = ['Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank'];
        
        // Search for links containing class-related keywords
        allLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const text = link.textContent.trim();
            
            // Look for category links with class information
            if (href.includes('Category:') && text) {
                // Check for modern subclass (look for "{Subclass} champion" without "Legacy")
                if (text.includes('champion') && !text.includes('Legacy')) {
                    const cleanedText = text.replace(' champion', '').trim();
                    if (modernSubclasses.includes(cleanedText) && !data.class) {
                        data.class = cleanedText;
                        data.debug.push(`Found class in categories: ${data.class}`);
                    }
                }
                
                // Check for legacy classes (look for "{Class} champion (Legacy)")
                if (text.includes('champion') && text.includes('Legacy')) {
                    const cleanedText = text.replace(' champion (Legacy)', '').replace(' champion', '').trim();
                    if (legacyClasses.includes(cleanedText) && !data.legacyClass.includes(cleanedText)) {
                        data.legacyClass.push(cleanedText);
                        data.debug.push(`Found legacy class in categories: ${cleanedText}`);
                    }
                }
            }
        });

        // Also check categories at bottom of page for adaptive type
        if (!data.adaptiveType) {
                data.debug.push('Checking categories for adaptive type...');
                const categoryLinks = document.querySelectorAll('a[href*="Category:"]');
                data.debug.push(`Found ${categoryLinks.length} category links`);
                categoryLinks.forEach(cat => {
                    const text = cat.textContent;
                    if (text.includes('Adaptive')) {
                        // Remove "Adaptive " prefix and " champion" suffix
                        data.adaptiveType = text.replace(/^Adaptive\s+/i, '').replace(' champion', '').trim();
                        data.debug.push(`Found adaptive type in categories: ${data.adaptiveType}`);
                    }
                });
            }

            return data;
        });

        // Print debug logs
        if (championData.debug && championData.debug.length > 0) {
            console.log('  [Debug logs from page]:');
            championData.debug.forEach(log => console.log(`    ${log}`));
        }
        
        // Remove debug from final data
        delete championData.debug;        // Log summary of what was found
        console.log(`  → Roles: ${championData?.roles?.length || 0}, Class: ${championData?.class ? '✓' : '✗'}, Legacy: ${championData?.legacyClass?.length || 0}, ${championData?.adaptiveType ? '✓' : '✗'}\n`);

        return {
            name: champion.name,
            ...championData
        };

    } catch (error) {
        console.error(`Error scraping ${champion.name}:`, error.message);
        console.log(`  → Error occurred, no data extracted\n`);
        return {
            name: champion.name,
            roles: [],
            class: null,
            legacyClass: [],
            adaptiveType: null,
            error: error.message
        };
    }
}

// Main scraper function
async function scrapeAllChampions() {
    console.log('Loading champion list...');
    const champions = await loadChampionList();

    if (champions.length === 0) {
        console.error('No champions found in champion-roles.json');
        return;
    }

    console.log(`Found ${champions.length} champions to scrape`);

    // Get environment variables for rate limiting
    const delay = parseInt(process.env.WIKI_DELAY_MS) || 1000; // Default 1 second between requests
    const concurrency = parseInt(process.env.WIKI_CONCURRENCY) || 1; // Default 1 concurrent request
    const limit = parseInt(process.env.WIKI_LIMIT) || 0; // Default 0 = all champions

    const championsToScrape = limit > 0 ? champions.slice(0, limit) : champions;

    console.log(`Scraping ${championsToScrape.length} champions with ${concurrency} concurrent requests and ${delay}ms delay`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = [];
    
    // Process champions in batches based on concurrency
    for (let i = 0; i < championsToScrape.length; i += concurrency) {
        const batch = championsToScrape.slice(i, i + concurrency);
        
        const batchPromises = batch.map(async (champion) => {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            
            const result = await scrapeChampionWiki(page, champion);
            await page.close();
            
            return result;
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        console.log(`Progress: ${results.length}/${championsToScrape.length} champions scraped`);

        // Delay between batches
        if (i + concurrency < championsToScrape.length) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    await browser.close();

    // Save results to JSON file with each property on its own line but arrays compact
    const outputPath = path.join(__dirname, 'champion-wiki-data.json');
    
    // Start with standard pretty print
    let jsonString = JSON.stringify(results, null, 2);
    
    // Only compact arrays: find array content and put it on one line
    // Match pattern: [\n      "item1",\n      "item2"\n    ]
    // Replace with: ["item1", "item2"]
    jsonString = jsonString.replace(/\[\n\s+(".*?"(?:,\n\s+".*?")*)\n\s+\]/g, (match, content) => {
      const items = content.split(',\n').map(item => item.trim()).join(', ');
      return `[${items}]`;
    });
    
    // Handle empty arrays
    jsonString = jsonString.replace(/\[\n\s+\]/g, '[]');
    
    await fs.writeFile(outputPath, jsonString);

    console.log(`\n✅ Scraping complete! Saved ${results.length} champions to ${outputPath}`);

    // Print summary
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    console.log(`\nSummary:`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);

    if (errorCount > 0) {
        console.log(`\nChampions with errors:`);
        results.filter(r => r.error).forEach(r => {
            console.log(`  - ${r.name} (${r.id}): ${r.error}`);
        });
    }
}

// Run the scraper
scrapeAllChampions().catch(console.error);
