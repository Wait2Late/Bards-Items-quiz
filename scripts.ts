let allChampions: any;
let allItems: { data: DDragonItemMap } | undefined;
// Enriched Bard items cache
let bardEnrichedItems: any[] | undefined;
let bardEnrichedItemsById: Record<string, any> | undefined;

// Champion wiki data
let championWikiData: ChampionWikiData[] = [];

// Track selected items across all dropdowns
const selectedItems = new Set<string>();
const allDropdowns: HTMLSelectElement[] = [];

// Track selected champions across all dropdowns
const selectedChampions = new Set<string>();
const allChampionDropdowns: HTMLSelectElement[] = [];

interface ChampionWikiData {
    name: string;
    roles: string[];
    class: string | null;
    legacyClass: string[];
    adaptiveType: string | null;
}

interface BardItem {
    id: string;
    name: string;
    ItemType: ItemType;
}

type DDragonItem = {
    name: string;
    image?: { full: string };
    tags?: string[];
    stats?: Record<string, number>;
  // ...other fields exist but we don't need them here
};

type DDragonItemMap = Record<string, DDragonItem>;

enum ItemType {
    SelfDefense = "Self-Defense",
    SelfOffsense = "Self-Offense",
    TeamDefense = "Team-Defense",
    TeamOffense = "Team-Offense",
}

const BardItems : BardItem[] = [
    { id: "3742", name: "Dead Man's Plate", ItemType: ItemType.SelfDefense },
    { id: "3143", name: "Randuin's Omen", ItemType: ItemType.SelfDefense },
    { id: "4401", name: "Force of Nature", ItemType: ItemType.SelfDefense },
    { id: "2504", name: "Kaenic Rookern", ItemType: ItemType.SelfDefense },
    { id: "6665", name: "Jak'Sho, The Protean", ItemType: ItemType.SelfDefense },
    { id: "3091", name: "Wit's End", ItemType: ItemType.SelfOffsense },
    { id: "3157", name: "Zhonya's Hourglass", ItemType: ItemType.SelfOffsense },
    { id: "3302", name: "Terminus", ItemType: ItemType.SelfOffsense },
    { id: "4633", name: "Riftmaker", ItemType: ItemType.SelfOffsense },
    { id: "6653", name: "Liandry's Torment", ItemType: ItemType.SelfOffsense  },
    { id: "3087", name: "Statikk Shiv", ItemType: ItemType.SelfOffsense  },
    { id: "4629", name: "Cosmic Drive", ItemType: ItemType.SelfOffsense  },
    { id: "3073", name: "Experimental Hexplate", ItemType: ItemType.SelfOffsense  },
    { id: "3190", name: "Locket of the Iron Solari", ItemType: ItemType.TeamDefense },
    { id: "3107", name: "Redemption", ItemType: ItemType.TeamDefense },
    { id: "3222", name: "Mikael's Blessing", ItemType: ItemType.TeamDefense },
    { id: "3110", name: "Frozen Heart", ItemType: ItemType.TeamDefense },
    { id: "3109", name: "Knight's Vow", ItemType: ItemType.TeamDefense },
    { id: "4005", name: "Imperial Mandate", ItemType: ItemType.TeamOffense },
    { id: "8020", name: "Abyssal Mask", ItemType: ItemType.TeamOffense  },
    { id: "4010", name: "Bloodletter's Curse", ItemType: ItemType.TeamOffense  },
    { id: "6695", name: "Serpent's Fang", ItemType: ItemType.TeamOffense  },
];

const SelfDefense: BardItem[] = BardItems.filter(item => item.ItemType === ItemType.SelfDefense);
const SelfOffense: BardItem[] = BardItems.filter(item => item.ItemType === ItemType.SelfOffsense);
const TeamDefense: BardItem[] = BardItems.filter(item => item.ItemType === ItemType.TeamDefense);
const TeamOffense: BardItem[] = BardItems.filter(item => item.ItemType === ItemType.TeamOffense);

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

async function fetchMerakiChampionData(championName: string) {
    try {
        const response = await fetch(`https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions/${championName}.json`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching champion: ", error);
        return null;
    }
}

async function getAllChampionsAndItems() {
    const patchVersion = await fetchCurrentPatch();
    if (!patchVersion) {
        console.error("Failed to get patch version");
        return null;
    }

    const allItemsApi = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/item.json`;
    const allChampionsApi = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion.json`;

    try {
        const [itemsResponse, championsResponse] = await Promise.all([
            fetch(allItemsApi),
            fetch(allChampionsApi)
        ]);

        const items = await itemsResponse.json();
        const champions = await championsResponse.json();

        return { items, champions, patchVersion};
    } catch (error) {
        console.error("Error fetching champions/items:", error);
        return null;
    }
}

function createBootsDropdown(element: HTMLElement, patchVersion: string) {
    const boots = [
        { id: "3111", name: "Mercury's Treads" },
        { id: "3047", name: "Plated Steelcaps" },
        { id: "3009", name: "Boots of Swiftness" },
        { id: "3171", name: "Crimson Lucidity" }
    ];

    // Create dropdown
    let select = element.querySelector("select.boots-dropdown") as HTMLSelectElement | null;
    if (!select) {
        select = document.createElement("select");
        select.className = "boots-dropdown";
        
        // Track this dropdown
        allDropdowns.push(select);

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Boots";
        select.appendChild(defaultOption);

        boots.forEach(boot => {
            const option = document.createElement("option");
            option.value = boot.id;
            option.textContent = boot.name;
            select!.appendChild(option);
        });

        element.appendChild(select); // keep the dropdown in the li
    }

    // Ensure there is an <img> we can update (don’t remove the select)
    let img = element.querySelector("img") as HTMLImageElement | null;

    select.addEventListener("change", () => {
        const previousValue = select!.dataset.previousValue;
        const selected = select!.value;
        const label = select!.selectedOptions[0]?.textContent ?? "Boots";

        // Remove previous selection from the set
        if (previousValue) {
            selectedItems.delete(previousValue);
        }

        // Add new selection to the set
        if (selected) {
            selectedItems.add(selected);
            select!.dataset.previousValue = selected;
        } else {
            delete select!.dataset.previousValue;
        }

        // Update all dropdowns to disable selected items
        updateAllDropdowns();

        // Check if all item slots are filled to show/hide summary
        updateSummaryVisibility();

        if (selected) {
            if (!img) {
                img = document.createElement("img");
                element.appendChild(img);
            }
            img.alt = label;
            img.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${selected}.png`;
        } else if (img) {
            // Clear image if user selects the default option again
            img.remove();
            img = null;
        }
    });
}

// Generic dropdown creator for any item category with grouped headers
function createItemDropdown(
    element: HTMLElement, 
    items: BardItem[], 
    patchVersion: string, 
    label: string,
    dropdownClass: string = "item-dropdown"
) {
    // Create dropdown
    let select = element.querySelector(`select.${dropdownClass}`) as HTMLSelectElement | null;
    if (!select) {
        select = document.createElement("select");
        select.className = dropdownClass;
        
        // Track this dropdown
        allDropdowns.push(select);

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `Select ${label}`;
        select.appendChild(defaultOption);

        // Group items by ItemType
        const groupedItems: Record<ItemType, BardItem[]> = {
            [ItemType.SelfDefense]: [],
            [ItemType.SelfOffsense]: [],
            [ItemType.TeamDefense]: [],
            [ItemType.TeamOffense]: [],
        };

        items.forEach(item => {
            groupedItems[item.ItemType].push(item);
        });

        // Create optgroups for each category
        Object.entries(groupedItems).forEach(([category, categoryItems]) => {
            if (categoryItems.length > 0) {
                const optgroup = document.createElement("optgroup");
                optgroup.label = category;
                
                categoryItems.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.name;
                    optgroup.appendChild(option);
                });

                select!.appendChild(optgroup);
            }
        });

        element.appendChild(select);
    }

    // Ensure there is an <img> we can update (don't remove the select)
    let img = element.querySelector("img") as HTMLImageElement | null;

    select.addEventListener("change", () => {
        const previousValue = select.dataset.previousValue;
        const selected = select!.value;
        const itemName = select!.selectedOptions[0]?.textContent ?? label;

        // Remove previous selection from the set
        if (previousValue) {
            selectedItems.delete(previousValue);
        }

        // Add new selection to the set
        if (selected) {
            selectedItems.add(selected);
            select.dataset.previousValue = selected;
        } else {
            delete select.dataset.previousValue;
        }

        // Update all dropdowns to disable selected items
        updateAllDropdowns();

        // Check if all item slots are filled to show/hide summary
        updateSummaryVisibility();

        if (selected) {
            if (!img) {
                img = document.createElement("img");
                element.appendChild(img);
            }
            img.alt = itemName;
            img.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${selected}.png`;
            // Toggle health border based on tags
            applyHealthBorder(element, selected);
        } else if (img) {
            // Clear image if user selects the default option again
            img.remove();
            img = null;
            applyHealthBorder(element, undefined);
        }
    });
}

// Update all dropdowns to disable/enable options based on selected items
function updateAllDropdowns() {
    allDropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        
        // Iterate through all options in the dropdown
        Array.from(dropdown.options).forEach(option => {
            if (option.value === "") {
                // Don't disable the default "Select..." option
                option.disabled = false;
            } else if (option.value === currentValue) {
                // Don't disable the currently selected option in this dropdown
                option.disabled = false;
            } else if (selectedItems.has(option.value)) {
                // Disable if selected in another dropdown
                option.disabled = true;
            } else {
                // Enable if not selected anywhere
                option.disabled = false;
            }
        });
    });
}

// Check if all item slots are filled and show/hide summary container accordingly
function updateSummaryVisibility() {
    const summaryContainer = document.querySelector('.summary-container');
    if (!summaryContainer) return;

    // Check if all 4 dropdowns (3 item slots + boots) have selections
    const allFilled = allDropdowns.every(dropdown => dropdown.value !== "");

    if (allFilled) {
        summaryContainer.classList.add('visible');
    } else {
        summaryContainer.classList.remove('visible');
    }
}

// Reset all item dropdowns (slots 3, 4, 5, and boots) to their default state
function resetAllItemDropdowns() {
    allDropdowns.forEach(dropdown => {
        const previousValue = dropdown.dataset.previousValue;
        
        // Remove from selected items set
        if (previousValue) {
            selectedItems.delete(previousValue);
            delete dropdown.dataset.previousValue;
        }
        
        // Reset dropdown to default option
        dropdown.value = "";
        
        // Remove the image from the parent item
        const parentItem = dropdown.closest('.item');
        if (parentItem) {
            const img = parentItem.querySelector('img');
            if (img && !parentItem.classList.contains('core-item')) {
                // Don't remove images from core items (Bloodsong and Dead Man's Plate)
                img.src = "";
                img.alt = "";
            }
            // Remove health border if present (but not from core items)
            if (!parentItem.classList.contains('core-item')) {
                parentItem.classList.remove('health');
            }
        }
    });
    
    // Update all dropdowns to re-enable options
    updateAllDropdowns();
    
    // Hide summary container since items are reset
    updateSummaryVisibility();
}

/**
 * Loads champion wiki data from champion-wiki-data.json
 */
async function loadChampionWikiData(): Promise<ChampionWikiData[]> {
    try {
        const response = await fetch('scraper/champion-wiki-data.json');
        if (!response.ok) {
            console.error('Failed to load champion-wiki-data.json');
            return [];
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading champion wiki data:', error);
        return [];
    }
}

// UI-only role label mapping: keep logic using canonical codes, but show BOT for ADC
function displayRole(role: string): string {
    return role === 'ADC' ? 'BOT' : role;
}

/**
 * Creates a dropdown for selecting champions for a specific role
 */
function createChampionDropdown(
    element: HTMLElement,
    championWikiData: ChampionWikiData[],
    allChampions: any,
    patchVersion: string,
    slotRole: string,
    isEnemyTeam: boolean = false
) {
    // Create dropdown
    let select = element.querySelector("select.champion-select") as HTMLSelectElement | null;
    if (!select) {
        select = document.createElement("select");
        select.className = "champion-select";
        
        // Track this dropdown
        allChampionDropdowns.push(select);

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
    // Show the role name in the placeholder, e.g., Select TOP / JUNGLE / MID / BOT / SUPPORT (UI-only mapping)
    defaultOption.textContent = `Select ${displayRole(slotRole)}`;
        select.appendChild(defaultOption);

        // Map role names from wiki data to expected format
        const roleMapping: Record<string, string> = {
            'Top': 'TOP',
            'Jungle': 'JUNGLE',
            'Middle': 'MID',
            'Bottom': 'ADC',
            'Support': 'SUPPORT'
        };

        // Filter champions that can play this specific role
        const championsForRole: Array<{ name: string; championId: string }> = [];
        
        championWikiData.forEach(champion => {
            // Check if this champion can play the slot's role
            const canPlayRole = champion.roles.some(role => roleMapping[role] === slotRole);
            if (!canPlayRole) return;
            
            // For enemy team, exclude Bard from SUPPORT role
            if (isEnemyTeam && slotRole === 'SUPPORT' && champion.name.toLowerCase() === 'bard') {
                return;
            }

            // Find the Data Dragon champion data
            const championData = Object.values(allChampions.data).find((champ: any) => {
                const champId = champ.id.toLowerCase();
                const champName = champ.name.toLowerCase();
                const wikiName = champion.name.toLowerCase();
                
                // Use exact matches only to avoid false positives (e.g., "vi" matching "anivia")
                return champId === wikiName || champName === wikiName;
            }) as any;

            if (championData) {
                // Avoid duplicates
                if (!championsForRole.some(c => c.championId === championData.id)) {
                    championsForRole.push({
                        name: champion.name,
                        championId: championData.id
                    });
                }
            }
        });

        // Sort champions alphabetically by name
        championsForRole.sort((a, b) => a.name.localeCompare(b.name));

        // Add all champions as options
        championsForRole.forEach(champ => {
            const option = document.createElement("option");
            option.value = champ.championId;
            option.textContent = champ.name;
            select!.appendChild(option);
        });

        element.appendChild(select);
    }

    // Ensure there is an <img> we can update
    let img = element.querySelector("img") as HTMLImageElement | null;

    select.addEventListener("change", () => {
        const previousValue = select!.dataset.previousValue;
        const selected = select!.value;
        const championName = select!.selectedOptions[0]?.textContent ?? "";

        // Remove previous selection from the set
        if (previousValue) {
            selectedChampions.delete(previousValue);
        }

        // Add new selection to the set
        if (selected) {
            selectedChampions.add(selected);
            select!.dataset.previousValue = selected;
        } else {
            delete select!.dataset.previousValue;
        }

        // Update all champion dropdowns to disable selected champions
        updateAllChampionDropdowns();

        // Reset all item dropdowns when a champion is changed
        resetAllItemDropdowns();

        if (selected) {
            if (!img) {
                img = document.createElement("img");
                element.appendChild(img);
            }
            img.alt = championName;
            img.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${selected}.png`;
            img.title = championName;
        } else if (img) {
            // Clear image if user selects the default option again
            img.src = "";
            img.alt = "";
            img.title = "";
        }

        // Update AP/AD/Tank counts after champion selection
        suggestItems();
    });
}

/**
 * Update all champion dropdowns to disable champions that are already selected elsewhere.
 */
function updateAllChampionDropdowns() {
    allChampionDropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        
        // Iterate through all options in the dropdown
        Array.from(dropdown.options).forEach(option => {
            if (option.value === "") {
                // Don't disable the default "Select..." option
                option.disabled = false;
            } else if (option.value === currentValue) {
                // Don't disable the currently selected option in this dropdown
                option.disabled = false;
            } else if (selectedChampions.has(option.value)) {
                // Disable if selected in another dropdown
                option.disabled = true;
            } else {
                // Enable if not selected anywhere
                option.disabled = false;
            }
        });
    });
}

/**
 * Assigns random champions to team slots based on their roles
 * @param teamListSelector - CSS selector for the team list
 * @param championRoles - Array of champion role data
 * @param allChampions - Data Dragon champion data
 * @param patchVersion - Current patch version
 * @param usedChampions - Set of already selected champion IDs to avoid duplicates
 * @param isEnemyTeam - Whether this is the enemy team (to exclude Bard from support)
 */
function assignChampionsToTeam(
    teamListSelector: string,
    championWikiData: ChampionWikiData[],
    allChampions: any,
    patchVersion: string,
    usedChampions: Set<string>,
    isEnemyTeam: boolean = false
): void {
    const teamList = document.querySelector(teamListSelector);
    if (!teamList) {
        console.error(`Team list ${teamListSelector} not found`);
        return;
    }

    const championSlots = teamList.querySelectorAll('li.champion-dropdown');
    
    championSlots.forEach(slot => {
        const slotElement = slot as HTMLElement;
        
        // Get role from class list (e.g., 'top', 'jungle', 'mid', 'adc', 'support', 'bard')
        const roleClass = Array.from(slotElement.classList).find(cls => 
            ['top', 'jungle', 'mid', 'adc', 'support', 'bard'].includes(cls)
        );
        
        if (!roleClass) {
            console.warn('No role class found for champion slot', slot);
            return;
        }
        
        // Special case: if the role is 'bard', assign Bard specifically
        if (roleClass === 'bard') {
            const bardData = Object.values(allChampions.data).find((champ: any) => 
                champ.id.toLowerCase() === 'bard'
            ) as any;
            
            if (bardData) {
                const imgElement = slotElement.querySelector('img');
                if (imgElement) {
                    imgElement.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${bardData.id}.png`;
                    imgElement.alt = bardData.name;
                    imgElement.title = `${bardData.name} (SUPPORT)`;
                    // Add Bard to used champions
                    usedChampions.add(bardData.id);
                }

                // Add/update a styled label under Bard icon (looks like dropdown)
                let label = slotElement.querySelector('.champion-label') as HTMLElement | null;
                if (!label) {
                    label = document.createElement('p');
                    label.className = 'champion-label';
                    slotElement.appendChild(label);
                }
                label.textContent = "You are so cool!";
            }
            return;
        }
        
        // Convert class to uppercase role (e.g., 'top' -> 'TOP')
        const role = roleClass.toUpperCase();
        
        // Create dropdown for this champion slot (not for bard slot)
            createChampionDropdown(slotElement, championWikiData, allChampions, patchVersion, role, isEnemyTeam);
        
        // Filter champions that can play this role
            // Map role names to wiki format
            const roleMapping: Record<string, string> = {
                'TOP': 'Top',
                'JUNGLE': 'Jungle',
                'MID': 'Middle',
                'ADC': 'Bottom',
                'SUPPORT': 'Support'
            };
            const wikiRole = roleMapping[role] || role;
        
            let availableChampions = championWikiData.filter(champion => {
                const hasRole = champion.roles.includes(wikiRole);
            if (!hasRole) return false;
            
            // For enemy team support role, exclude Bard
                if (isEnemyTeam && role === 'SUPPORT' && champion.name.toLowerCase() === 'bard') {
                return false;
            }
            
            return true;
        });
        
        if (availableChampions.length === 0) {
            console.warn(`No champions found for role: ${role}`);
            return;
        }
        
        // Try to find a champion that hasn't been used yet
        let randomChampion: ChampionWikiData | undefined;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop
        
        while (attempts < maxAttempts) {
            const candidate = availableChampions[Math.floor(Math.random() * availableChampions.length)];
            
            if (!candidate) {
                attempts++;
                continue;
            }
            
            // Find the champion data to check if it's already used
            const candidateData = Object.values(allChampions.data).find((champ: any) => {
                const champId = champ.id.toLowerCase();
                const champName = champ.name.toLowerCase();
                 const wikiName = candidate.name.toLowerCase();
                
                 return champId === wikiName || champName === wikiName;
            }) as any;
            
            // If champion data found and not already used, select it
            if (candidateData && !usedChampions.has(candidateData.id)) {
                randomChampion = candidate;
                break;
            }
            
            attempts++;
        }
        
        if (!randomChampion) {
            console.warn(`Failed to select unique champion for role: ${role} after ${maxAttempts} attempts`);
            // Fallback: just pick any available champion
            randomChampion = availableChampions[Math.floor(Math.random() * availableChampions.length)];
        }
        
        if (!randomChampion) {
            console.warn(`Failed to select champion for role: ${role}`);
            return;
        }
        
        // Find champion in Data Dragon data
        // Try to match by slug or by name
        const championData = Object.values(allChampions.data).find((champ: any) => {
            const champId = champ.id.toLowerCase();
            const champName = champ.name.toLowerCase();
            const wikiName = randomChampion!.name.toLowerCase();
            
            return champId === wikiName || champName === wikiName;
        }) as any;
        
        if (!championData) {
            console.warn(`Champion data not found for: ${randomChampion.name}`);
            return;
        }
        
        // Set the champion image
        const imgElement = slotElement.querySelector('img');
        if (imgElement) {
            imgElement.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${championData.id}.png`;
            imgElement.alt = championData.name;
            imgElement.title = `${championData.name} (${displayRole(role)})`;
            // Add this champion to the used set
            usedChampions.add(championData.id);
        }
        
        // Update the dropdown to reflect the selected champion
        const selectElement = slotElement.querySelector('select.champion-select') as HTMLSelectElement | null;
        if (selectElement) {
            selectElement.value = championData.id;
            selectElement.dataset.previousValue = championData.id;
        }
    });
}

// Helper: does an item have the "Health" tag based on enriched data?
function itemHasHealthTag(itemId: string | undefined): boolean {
    if (!itemId) return false;
    const enriched = bardEnrichedItemsById?.[itemId];
    const tags: string[] | undefined = enriched?.tag;
    return Array.isArray(tags) && tags.includes("Health");
}

// Helper: apply/remove green border class for Health-tagged items
function applyHealthBorder(element: HTMLElement, itemId?: string) {
    if (itemHasHealthTag(itemId)) {
        element.classList.add("health");
    } else {
        element.classList.remove("health");
    }
}

// Fetch items.json for a patch and return a by-id map
async function loadItemsById(patch?: string): Promise<{ patch: string; itemsById: DDragonItemMap }> {
    const usePatch = patch ?? (await fetchCurrentPatch());
    const url = `https://ddragon.leagueoflegends.com/cdn/${usePatch}/data/en_US/item.json`;
    const res = await fetch(url);
    const json = await res.json();
    // DDragon shape: { data: { "3877": { ... }, "3742": { ... }, ... } }
    const itemsById = json.data as DDragonItemMap;
    return { patch: usePatch, itemsById };
}

async function matchBardItems() {
    const { patch, itemsById } = await loadItemsById();

  // Enriched array you can render with
    const enriched = BardItems.map(bardItemId => {
    const dd = itemsById[bardItemId.id]; // may be undefined if id not found
    return {
        bardItemId,
        existsInDDragon: !!dd,
        tag: dd?.tags ?? [],
        stats: dd?.stats ?? {},
        officialName: dd?.name ?? bardItemId.name, // prefer DDragon name if found
        icon: dd ? `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${bardItemId.id}.png` : undefined,
        patch,
    };
    });

  // Quick lookup if you prefer O(1) access by id
    const enrichedById: Record<string, (typeof enriched)[number]> =
    Object.fromEntries(enriched.map(e => [e.bardItemId.id, e]));

//   // Example usage:
//   const bloodsong = enrichedById["3877"];
//   if (bloodsong?.existsInDDragon && bloodsong.icon) {
//     // set a variable, update UI, etc.
//     console.log("Bloodsong icon:", bloodsong.icon);
//   } else {
//     console.warn("Bloodsong not found in DDragon");
//   }

    return { patch, enriched, enrichedById };
}

/**
 * Generates new champion teams
 */
function generateNewTeams() {
        if (!allChampions || championWikiData.length === 0) {
        console.error('Champion data not loaded yet');
                return;
    }
    
    // Get the current patch version from existing champion images
    const existingImg = document.querySelector('.champion-dropdown img') as HTMLImageElement;
    const patchVersion = existingImg?.src.match(/cdn\/([^/]+)\//)?.[1] || '15.21.1';
    
    // Clear all selected champions
    selectedChampions.clear();
    
    // Reset all champion dropdowns
    allChampionDropdowns.forEach(dropdown => {
        const previousValue = dropdown.dataset.previousValue;
        if (previousValue) {
            delete dropdown.dataset.previousValue;
        }
        dropdown.value = "";
        
        // Clear the image from the parent champion slot
        const parentSlot = dropdown.closest('.champion-dropdown');
        if (parentSlot) {
            const img = parentSlot.querySelector('img');
            if (img) {
                img.src = "";
                img.alt = "";
                img.title = "";
            }
        }
    });

    // Remove any Bard label(s) before regenerating
    document.querySelectorAll('.champion-dropdown .champion-label').forEach(el => el.remove());
    
    // Track used champions to prevent duplicates across both teams
    const usedChampions = new Set<string>();
    
    // First assign my team (which includes Bard), then enemy team
        assignChampionsToTeam(".my-team-list", championWikiData, allChampions, patchVersion, usedChampions, false);
        assignChampionsToTeam(".enemy-team-list", championWikiData, allChampions, patchVersion, usedChampions, true);
    
    // Update the selectedChampions set with the randomly assigned champions
    usedChampions.forEach(champId => selectedChampions.add(champId));

    // Update all champion dropdowns to reflect the new selections
    updateAllChampionDropdowns();
    
    console.log('Generated new teams with champions:', Array.from(usedChampions));
    
    // Reset all item dropdowns (slots 3, 4, 5, and boots)
    allDropdowns.forEach(dropdown => {
        const previousValue = dropdown.dataset.previousValue;
        if (previousValue) {
            selectedItems.delete(previousValue);
            delete dropdown.dataset.previousValue;
        }
        dropdown.value = "";
        
        // Remove the image from the parent item
        const parentItem = dropdown.closest('.item');
        if (parentItem) {
            const img = parentItem.querySelector('img');
            if (img) {
                img.src = "";
                img.alt = "";
            }
            // Remove health border if present
            parentItem.classList.remove('health');
        }
    });
    
    // Update all dropdowns to re-enable options (only Dead Man's Plate remains selected)
    updateAllDropdowns();
    
    // Hide summary container since items are reset
    updateSummaryVisibility();

    suggestItems();
    
    console.log('Reset all item selections');
}

function normalizeName(name: string): string {
    // Remove spaces, apostrophes, periods, and convert to lowercase
    return name.replace(/[\s'\.&]/g, '').toLowerCase();
}

function getTeamChampions(): {
    myTeam: ChampionWikiData[];
    enemyTeam: ChampionWikiData[];
} {
    const myTeam: ChampionWikiData[] = [];
    const enemyTeam: ChampionWikiData[] = [];

    const myTeamSlots = document.querySelectorAll('.my-team-list .champion-dropdown select')
    myTeamSlots.forEach((selectElement) => {
        const select = selectElement as HTMLSelectElement;
        const championId = select.value;
        if (championId){
            const normalizedId = normalizeName(championId);
            const champion = championWikiData.find(c =>
                normalizeName(c.name) === normalizedId
            );
            if (champion) myTeam.push(champion);
        }
    });

    const enemyTeamSlots = document.querySelectorAll('.enemy-team-list .champion-dropdown select')
    enemyTeamSlots.forEach((selectElement) => {
        const select = selectElement as HTMLSelectElement;
        const championId = select.value;

        if (championId){
            const normalizedId = normalizeName(championId);
            const champion = championWikiData.find(c =>
                normalizeName(c.name) === normalizedId
            );
            if (champion) enemyTeam.push(champion);
        }
    });

    return { myTeam, enemyTeam };
}

function isAdorAp(championWikiData: ChampionWikiData): "AD" | "AP" {
    let dmgType: "AD" | "AP" = championWikiData.adaptiveType === "physical" ? "AD" : "AP" ;

    return dmgType;
}

function suggestItems() {
    const { myTeam, enemyTeam } = getTeamChampions();

    // let controller: string[] = ["Enchanter", "Catcher"];
    // let fighter: string[] = ["Juggernaut", "Diver"];
    // let mage: string[] = ["Burst", "Battlemage", "Artillery"];
    // let slayer: string[] = ["Assassin", "Skirmisher"];
    // let tank: string[] = ["Vanguard", "Warden"];
    // let marksman: string[] = ["Marksman"];
    // let specialist: string[] = ["Specialist"];

    // const newChampionClasses: string[] = {
    //     ...controller,
    //     ...fighter,
    //     ...mage,
    //     ...slayer,
    //     ...tank,
    //     ...marksman,
    //     ...specialist
    // };

    // enemyTeam.forEach((enemyChampion) => {
    //     console.log("Enemy champion:", enemyChampion.name, "Class:", enemyChampion.class);
    //     newChampionClasses.forEach((newChampionClass) => {
    //         switch (newChampionClass){
    //         case "controller":
    //             break;
    //         case "fighter":
    //             if (enemyChampion.class && fighter.includes(enemyChampion.class)){
    //             }
    //             break;
    //         case "mage":
    //             break;
    //         case "slayer":
    //             break;
    //         case "tank":
    //             if (enemyChampion.class && tank.includes(enemyChampion.class)){
    //             }
    //             break;
    //         case "marksman":
    //             break;
    //         case "specialist":
    //             break;
    //         default:
    //         }   
    //     })
    // });

    console.log("Enemy team", enemyTeam);
    console.log("My team ", myTeam);

    let enemyAp: number = 0;
    let enemyAd: number = 0;
    let enemyTank: number = 0;

    let teamAp: number = 0;
    let teamAd: number = 0;
    let teamTank: number = 0;
    
    enemyTeam.forEach((enemyChampion) => {
        switch (enemyChampion.class){
            case "Enchanter":
                console.log(`Against ${enemyChampion.name} (Enchanter), consider Team Defense items.`);      
                break;
            case "Catcher":
                console.log(`Against ${enemyChampion.name} (Catcher), consider Self Defense items.`);
                if (enemyChampion.name === "Morgana" || enemyChampion.name === "Zyra") 
                    isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Juggernaut":
                console.log(`Against ${enemyChampion.name} (Juggernaut), consider Self Offense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                if (enemyChampion.legacyClass.includes("Tank"))
                    enemyTank++;
                break;
            case "Diver":
                console.log(`Against ${enemyChampion.name} (Diver), consider Team Offense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Burst":
                console.log(`Against ${enemyChampion.name} (Burst), consider Self Defense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Battlemage":
                console.log(`Against ${enemyChampion.name} (Battlemage), consider Self Defense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Artillery":
                console.log(`Against ${enemyChampion.name} (Artillery), consider Team Defense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Assassin":
                console.log(`Against ${enemyChampion.name} (Assassin), consider Self Defense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Skirmisher":
                console.log(`Against ${enemyChampion.name} (Skirmisher), consider Self Offense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Vanguard":
                console.log(`Against ${enemyChampion.name} (Vanguard), consider Team Offense items.`);
                enemyTank++;
                if (enemyChampion.name === "Amumu" || 
                    enemyChampion.name === "Sion" || 
                    enemyChampion.name === "Malphite" ||
                    enemyChampion.name === "Gragas" )
                    isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Warden":
                console.log(`Against ${enemyChampion.name} (Warden), consider Team Defense items.`);
                enemyTank++;
                if (enemyChampion.name === "Galio" 
                    || enemyChampion.name === "K'Sante"
                    || enemyChampion.name === "Poppy")
                    isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Marksman":
                console.log(`Against ${enemyChampion.name} (Marksman), consider Self Defense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            case "Specialist":
                console.log(`Against ${enemyChampion.name} (Specialist), consider Self Offense items.`);
                isAdorAp(enemyChampion) === "AD" ? enemyAd++ : enemyAp++;
                break;
            default:
                console.log(`Against ${enemyChampion.name} (${enemyChampion.class}), consider balanced items.`);
        }
    });

    myTeam.forEach((teamChampion) => {
        switch (teamChampion.class){
            case "Enchanter":
                break;
            case "Catcher":
                if (teamChampion.name === "Morgana" || teamChampion.name === "Zyra") 
                    isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Juggernaut":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                if (teamChampion.legacyClass.includes("Tank"))
                    teamTank++;
                break;
            case "Diver":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Burst":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Battlemage":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Artillery":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Assassin":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Skirmisher":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Vanguard":
                teamTank++;
                if (teamChampion.name === "Amumu" ||
                    teamChampion.name === "Sion" || 
                    teamChampion.name === "Malphite" || 
                    teamChampion.name === "Gragas" )
                    isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Warden":
                teamTank++;
                if (teamChampion.name === "Galio" || 
                    teamChampion.name === "K'Sante" || 
                    teamChampion.name === "Poppy")
                    isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Marksman":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            case "Specialist":
                isAdorAp(teamChampion) === "AD" ? teamAd++ : teamAp++;
                break;
            default:
        }
    });
    
    const enemyApCount = document.querySelector(".enemy-ap");
    const enemyAdCount = document.querySelector(".enemy-ad");
    const enemyTankCount = document.querySelector(".enemy-tank");
    
    enemyApCount!.textContent = enemyAp.toString() + " AP";
    enemyAdCount!.textContent = enemyAd.toString() + " AD";
    enemyTankCount!.textContent = enemyTank.toString() + (enemyTank < 2 ? " Tank" : " Tanks");
    
    (enemyApCount as HTMLElement)!.style.color = "rgba(0, 0, 255, 1)";
    (enemyAdCount as HTMLElement)!.style.color = "rgba(243, 146, 0, 1)";

    if (enemyAp + enemyAd > 5) console.error("More than 5 champions detected on enemy team!");

    const teamApCount = document.querySelector(".team-ap");
    const teamAdCount = document.querySelector(".team-ad");
    const teamTankCount = document.querySelector(".team-tank");

    teamApCount!.textContent = teamAp.toString() + " AP";
    teamAdCount!.textContent = teamAd.toString() + " AD";
    teamTankCount!.textContent = teamTank.toString() + (teamTank < 2 ? " Tank" : " Tanks");

    (teamApCount as HTMLElement)!.style.color = "rgba(0, 0, 255, 1)";
    (teamAdCount as HTMLElement)!.style.color = "rgba(243, 146, 0, 1)";
}

function setup() {
    // Mark Dead Man's Plate as already selected (core item for Bard)
    selectedItems.add("3742");
    
    // Load champion roles and assign champions to teams
        loadChampionWikiData().then(wikiData => {
            championWikiData = wikiData;
            console.log(`Loaded ${championWikiData.length} champions with wiki data`);
    });
    
    getAllChampionsAndItems().then(data => {
    if (data) {
        allChampions = data.champions;
        allItems = data.items;

        // console.log(data.items.data);
        // console.log(data.champions.data);

        // Assign champions to enemy team once we have both champion data and roles
        // Track used champions to prevent duplicates across both teams
        const usedChampions = new Set<string>();
        
            if (championWikiData.length > 0) {
            // First assign my team (which includes Bard), then enemy team
                assignChampionsToTeam(".my-team-list", championWikiData, allChampions, data.patchVersion, usedChampions, false);
                assignChampionsToTeam(".enemy-team-list", championWikiData, allChampions, data.patchVersion, usedChampions, true);
        } else {
            // If roles haven't loaded yet, wait for them
                loadChampionWikiData().then(wikiData => {
                    championWikiData = wikiData;
                // First assign my team (which includes Bard), then enemy team
                    assignChampionsToTeam(".my-team-list", championWikiData, allChampions, data.patchVersion, usedChampions, false);
                    assignChampionsToTeam(".enemy-team-list", championWikiData, allChampions, data.patchVersion, usedChampions, true);
            });
        }

        let items = document.querySelectorAll(".item");

        const bloodsongImg = `https://ddragon.leagueoflegends.com/cdn/${data.patchVersion}/img/item/3877.png`;
        items[0]!.innerHTML = `<img src="${bloodsongImg}" alt="Bloodsong">`;
        applyHealthBorder(items[0] as HTMLElement, "3877");

        const deadMansPlateImg = `https://ddragon.leagueoflegends.com/cdn/${data.patchVersion}/img/item/3742.png`;
        items[1]!.innerHTML = `<img src="${deadMansPlateImg}" alt="Dead Man's Plate">`;
        applyHealthBorder(items[1] as HTMLElement, "3742");

        // Create dropdown for item slot 3 - All Bard items
        const itemSlot3 = items[2] as HTMLElement;
        if (itemSlot3) {
            createItemDropdown(itemSlot3, BardItems, data.patchVersion, "Item", "item-dropdown-3");
        }

        // Create dropdown for item slot 4 - All Bard items
        const itemSlot4 = items[3] as HTMLElement;
        if (itemSlot4) {
            createItemDropdown(itemSlot4, BardItems, data.patchVersion, "Item", "item-dropdown-4");
        }

        // Create dropdown for item slot 5 - All Bard items
        const itemSlot5 = items[4] as HTMLElement;
        if (itemSlot5) {
            createItemDropdown(itemSlot5, BardItems, data.patchVersion, "Item", "item-dropdown-5");
        }

        // Create dropdown for boots slot
        const bootsSlot = document.querySelector(".item.boots-dropdown") as HTMLElement | null;
        if (bootsSlot) {
            createBootsDropdown(bootsSlot, data.patchVersion);
        }

            // Update all dropdowns to disable Dead Man's Plate (pre-selected core item)
            updateAllDropdowns();
    }

    const matchedItems = matchBardItems().then(({ patch, enriched, enrichedById }) => {

        bardEnrichedItems = enriched;
        bardEnrichedItemsById = enrichedById;

        // console.log("Current patch:", patch);
        // console.log("Enriched Bard Items:", enriched);
        // console.log("Enriched By ID:", enrichedById);

        // Re-apply health borders now that enriched tags are available
        const listItems = document.querySelectorAll('.items-list .item');
        if (listItems[0]) applyHealthBorder(listItems[0] as HTMLElement, "3877");
        if (listItems[1]) applyHealthBorder(listItems[1] as HTMLElement, "3742");

        // Apply for current selections in all dropdowns
        allDropdowns.forEach((dropdown) => {
            const li = dropdown.closest('.item') as HTMLElement | null;
            if (li) applyHealthBorder(li, dropdown.value || undefined);
        });

        // let items = document.querySelectorAll(".item");
        
        // const bloodsong = enrichedById["3877"];
        // items[0]!.innerHTML = `<img src="${bloodsong?.icon}" alt="Bloodsong">`;
        // console.log("bloodsong: ", bloodsong?.icon);
        
        // const deadMansPlateImg = enrichedById["3742"]?.icon;
        // console.log(deadMansPlateImg);
        // items[1]!.innerHTML = `<img src="${deadMansPlateImg}" alt="Dead Man's Plate">`;

        suggestItems();

    });
});
    
    // Add event listener for the "Generate teams" button
    const newChampionsButton = document.getElementById('new-champions-button');
    if (newChampionsButton) {
        newChampionsButton.addEventListener('click', () => {
            generateNewTeams();
        });
    }
}



setup();