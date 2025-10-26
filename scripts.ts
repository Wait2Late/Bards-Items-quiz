let allChampions: any;
let allItems: { data: DDragonItemMap } | undefined;
// Enriched Bard items cache
let bardEnrichedItems: any[] | undefined;
let bardEnrichedItemsById: Record<string, any> | undefined;

// Champion roles data
let championRoles: ChampionRole[] = [];

// Track selected items across all dropdowns
const selectedItems = new Set<string>();
const allDropdowns: HTMLSelectElement[] = [];

interface ChampionRole {
    slug: string;
    name: string;
    roles: {
        role: string;
        pickRate: number | null;
    }[];
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
        const selected = select!.value;
        const label = select!.selectedOptions[0]?.textContent ?? "Boots";

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

/**
 * Loads champion roles data from champion-roles.json
 */
async function loadChampionRoles(): Promise<ChampionRole[]> {
    try {
        const response = await fetch('scraper/champion-roles.json');
        if (!response.ok) {
            console.error('Failed to load champion-roles.json');
            return [];
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading champion roles:', error);
        return [];
    }
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
    championRoles: ChampionRole[],
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
            }
            return;
        }
        
        // Convert class to uppercase role (e.g., 'top' -> 'TOP')
        const role = roleClass.toUpperCase();
        
        // Filter champions that can play this role
        let availableChampions = championRoles.filter(champion => {
            const hasRole = champion.roles.some(r => r.role === role);
            if (!hasRole) return false;
            
            // For enemy team support role, exclude Bard
            if (isEnemyTeam && role === 'SUPPORT' && champion.slug.toLowerCase() === 'bard') {
                return false;
            }
            
            return true;
        });
        
        if (availableChampions.length === 0) {
            console.warn(`No champions found for role: ${role}`);
            return;
        }
        
        // Try to find a champion that hasn't been used yet
        let randomChampion: ChampionRole | undefined;
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
                const slug = candidate.slug.toLowerCase();
                
                return champId === slug || champName === slug || champId.includes(slug) || slug.includes(champId);
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
            const slug = randomChampion!.slug.toLowerCase();
            
            return champId === slug || champName === slug || champId.includes(slug) || slug.includes(champId);
        }) as any;
        
        if (!championData) {
            console.warn(`Champion data not found for: ${randomChampion.slug}`);
            return;
        }
        
        // Set the champion image
        const imgElement = slotElement.querySelector('img');
        if (imgElement) {
            imgElement.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${championData.id}.png`;
            imgElement.alt = championData.name;
            imgElement.title = `${championData.name} (${role})`;
            // Add this champion to the used set
            usedChampions.add(championData.id);
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
    if (!allChampions || championRoles.length === 0) {
        console.error('Champion data not loaded yet');
        return;
    }
    
    // Get the current patch version from existing champion images
    const existingImg = document.querySelector('.champion-dropdown img') as HTMLImageElement;
    const patchVersion = existingImg?.src.match(/cdn\/([^/]+)\//)?.[1] || '15.21.1';
    
    // Track used champions to prevent duplicates across both teams
    const usedChampions = new Set<string>();
    
    // First assign my team (which includes Bard), then enemy team
    assignChampionsToTeam(".my-team-list", championRoles, allChampions, patchVersion, usedChampions, false);
    assignChampionsToTeam(".enemy-team-list", championRoles, allChampions, patchVersion, usedChampions, true);
    
    console.log('Generated new teams with champions:', Array.from(usedChampions));
}

function setup() {
    // Mark Dead Man's Plate as already selected (core item for Bard)
    selectedItems.add("3742");
    
    // Load champion roles and assign champions to teams
    loadChampionRoles().then(roles => {
        championRoles = roles;
        console.log(`Loaded ${championRoles.length} champions with role data`);
    });
    
    getAllChampionsAndItems().then(data => {
    if (data) {
        allChampions = data.champions;
        allItems = data.items;

        console.log(data.items.data);
        console.log(data.champions.data);

        // Assign champions to enemy team once we have both champion data and roles
        // Track used champions to prevent duplicates across both teams
        const usedChampions = new Set<string>();
        
        if (championRoles.length > 0) {
            // First assign my team (which includes Bard), then enemy team
            assignChampionsToTeam(".my-team-list", championRoles, allChampions, data.patchVersion, usedChampions, false);
            assignChampionsToTeam(".enemy-team-list", championRoles, allChampions, data.patchVersion, usedChampions, true);
        } else {
            // If roles haven't loaded yet, wait for them
            loadChampionRoles().then(roles => {
                championRoles = roles;
                // First assign my team (which includes Bard), then enemy team
                assignChampionsToTeam(".my-team-list", championRoles, allChampions, data.patchVersion, usedChampions, false);
                assignChampionsToTeam(".enemy-team-list", championRoles, allChampions, data.patchVersion, usedChampions, true);
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

        console.log("Current patch:", patch);
        console.log("Enriched Bard Items:", enriched);
        console.log("Enriched By ID:", enrichedById);

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