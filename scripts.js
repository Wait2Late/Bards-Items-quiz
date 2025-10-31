var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let allChampions;
let allItems;
// Enriched Bard items cache
let bardEnrichedItems;
let bardEnrichedItemsById;
// Champion wiki data
let championWikiData = [];
// Cache the current patch version
let currentPatchVersion = '15.21.1';
// Track selected items across all dropdowns
const selectedItems = new Set();
const allDropdowns = [];
// Track selected champions across all dropdowns
const selectedChampions = new Set();
const allChampionDropdowns = [];
const bardResources = "https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions/Bard.json";
var ItemType;
(function (ItemType) {
    ItemType["SelfDefense"] = "Self-Defense";
    ItemType["SelfOffsense"] = "Self-Offense";
    ItemType["TeamDefense"] = "Team-Defense";
    ItemType["TeamOffense"] = "Team-Offense";
})(ItemType || (ItemType = {}));
const BardItems = [
    { id: "3742", name: "Dead Man's Plate", ItemType: ItemType.SelfDefense },
    { id: "3143", name: "Randuin's Omen", ItemType: ItemType.SelfDefense },
    { id: "4401", name: "Force of Nature", ItemType: ItemType.SelfDefense },
    { id: "2504", name: "Kaenic Rookern", ItemType: ItemType.SelfDefense },
    { id: "6665", name: "Jak'Sho, The Protean", ItemType: ItemType.SelfDefense },
    { id: "3091", name: "Wit's End", ItemType: ItemType.SelfOffsense },
    { id: "3157", name: "Zhonya's Hourglass", ItemType: ItemType.SelfOffsense },
    { id: "3302", name: "Terminus", ItemType: ItemType.SelfOffsense },
    { id: "4633", name: "Riftmaker", ItemType: ItemType.SelfOffsense },
    { id: "6653", name: "Liandry's Torment", ItemType: ItemType.SelfOffsense },
    { id: "3087", name: "Statikk Shiv", ItemType: ItemType.SelfOffsense },
    { id: "4629", name: "Cosmic Drive", ItemType: ItemType.SelfOffsense },
    { id: "3073", name: "Experimental Hexplate", ItemType: ItemType.SelfOffsense },
    { id: "3190", name: "Locket of the Iron Solari", ItemType: ItemType.TeamDefense },
    { id: "3107", name: "Redemption", ItemType: ItemType.TeamDefense },
    { id: "3222", name: "Mikael's Blessing", ItemType: ItemType.TeamDefense },
    { id: "3110", name: "Frozen Heart", ItemType: ItemType.TeamDefense },
    { id: "3109", name: "Knight's Vow", ItemType: ItemType.TeamDefense },
    { id: "4005", name: "Imperial Mandate", ItemType: ItemType.TeamOffense },
    { id: "8020", name: "Abyssal Mask", ItemType: ItemType.TeamOffense },
    { id: "4010", name: "Bloodletter's Curse", ItemType: ItemType.TeamOffense },
    { id: "6695", name: "Serpent's Fang", ItemType: ItemType.TeamOffense },
];
const SelfDefense = BardItems.filter(item => item.ItemType === ItemType.SelfDefense);
const SelfOffense = BardItems.filter(item => item.ItemType === ItemType.SelfOffsense);
const TeamDefense = BardItems.filter(item => item.ItemType === ItemType.TeamDefense);
const TeamOffense = BardItems.filter(item => item.ItemType === ItemType.TeamOffense);
const ITEM_TAGS = {
    "3742": ["Armor", "Peel", "Frontline"], // Dead Man's Plate
    "3143": ["Armor", "AntiCrit", "slow", "Frontline"], // Randuin's Omen
    "4401": ["MR", "AntiDot"], // Force of Nature
    "2504": ["MR", "AntiPoke", "Frontline"], // Kaenic Rookern
    "6665": ["MixedEnemyDmg", "Frontline"], // Jak'Sho The Protean
    "3091": ["MR", "AS", "OnHit", "Tenacity"], // Wit's End
    "3157": ["Stasis", "AP", "Armor"], // Zhonya's Hourglass
    "3302": ["AS", "OnHit", "MixedEnemyDmg"], // Terminus
    "4633": ["AP", "Sustain"], // Riftmaker
    "6653": ["AP", "TankBuster", "DoT"], // Liandry's Torment
    "3087": ["AS", "OnHit", "Waveclear"], // Statikk Shiv
    "4629": ["AP", "MS", "Cdr"], // Cosmic Drive
    "3073": ["Snowball"], // Experimental Hexplate
    "3190": ["AoEShield"], // Locket of the Iron Solari
    "3107": ["AoEHeal"], // Redemption
    "3222": ["Cleanse"], // Mikael's Blessing
    "3110": ["Armor", "AntiAS"], // Frozen Heart
    "3109": ["Armor", "Heal"], // Knight's Vow
    "4005": ["AP"], // Imperial Mandate
    "8020": ["MR", "AmpMagic", "Frontline"], // Abyssal Mask
    "4010": ["AP", "AmpMagic"], // Bloodletter's Curse
    "6695": ["AntiShield"], // Serpent's Fang
};
// async function setBackgroundImage() {
//     try {
//         const response = await fetch(bardResources);
//         const data = await response.json();
//         document.body.style.backgroundImage = data.skins[0].uncenteredSplashPath;
//     } catch (error) {
//         console.error("Error fetching Bard resources: ", error);
//         return;
//     }
// }
// setBackgroundImage();
function fetchCurrentPatch() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("https://ddragon.leagueoflegends.com/api/versions.json");
            const data = yield response.json();
            return data[0];
        }
        catch (error) {
            console.error("Error fetching patch version:", error);
            return null;
        }
    });
}
function fetchMerakiChampionData(championName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions/${championName}.json`);
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error("Error fetching champion: ", error);
            return null;
        }
    });
}
function getAllChampionsAndItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const patchVersion = yield fetchCurrentPatch();
        if (!patchVersion) {
            console.error("Failed to get patch version");
            return null;
        }
        // Cache the patch version globally
        currentPatchVersion = patchVersion;
        const allItemsApi = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/item.json`;
        const allChampionsApi = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion.json`;
        try {
            const [itemsResponse, championsResponse] = yield Promise.all([
                fetch(allItemsApi),
                fetch(allChampionsApi)
            ]);
            const items = yield itemsResponse.json();
            const champions = yield championsResponse.json();
            return { items, champions, patchVersion };
        }
        catch (error) {
            console.error("Error fetching champions/items:", error);
            return null;
        }
    });
}
function createBootsDropdown(element, patchVersion) {
    const boots = [
        { id: "3111", name: "Mercury's Treads" },
        { id: "3047", name: "Plated Steelcaps" },
        { id: "3009", name: "Boots of Swiftness" },
        { id: "3171", name: "Crimson Lucidity" }
    ];
    // Create dropdown
    let select = element.querySelector("select.boots-dropdown");
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
            select.appendChild(option);
        });
        element.appendChild(select); // keep the dropdown in the li
    }
    // Ensure there is an <img> we can update (don’t remove the select)
    let img = element.querySelector("img");
    select.addEventListener("change", () => {
        var _a, _b;
        const previousValue = select.dataset.previousValue;
        const selected = select.value;
        const label = (_b = (_a = select.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "Boots";
        // Remove previous selection from the set
        if (previousValue) {
            selectedItems.delete(previousValue);
        }
        // Add new selection to the set
        if (selected) {
            selectedItems.add(selected);
            select.dataset.previousValue = selected;
        }
        else {
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
            img.alt = label;
            img.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${selected}.png`;
        }
        else if (img) {
            // Clear image if user selects the default option again
            img.remove();
            img = null;
        }
    });
}
// Generic dropdown creator for any item category with grouped headers
function createItemDropdown(element, items, patchVersion, label, dropdownClass = "item-dropdown") {
    // Create dropdown
    let select = element.querySelector(`select.${dropdownClass}`);
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
        const groupedItems = {
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
                select.appendChild(optgroup);
            }
        });
        element.appendChild(select);
    }
    // Ensure there is an <img> we can update (don't remove the select)
    let img = element.querySelector("img");
    select.addEventListener("change", () => {
        var _a, _b;
        const previousValue = select.dataset.previousValue;
        const selected = select.value;
        const itemName = (_b = (_a = select.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : label;
        // Remove previous selection from the set
        if (previousValue) {
            selectedItems.delete(previousValue);
        }
        // Add new selection to the set
        if (selected) {
            selectedItems.add(selected);
            select.dataset.previousValue = selected;
        }
        else {
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
        }
        else if (img) {
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
            }
            else if (option.value === currentValue) {
                // Don't disable the currently selected option in this dropdown
                option.disabled = false;
            }
            else if (selectedItems.has(option.value)) {
                // Disable if selected in another dropdown
                option.disabled = true;
            }
            else {
                // Enable if not selected anywhere
                option.disabled = false;
            }
        });
    });
}
// Check if all item slots are filled and show/hide summary container accordingly
function updateSummaryVisibility() {
    const summaryContainer = document.querySelector('.summary-container');
    if (!summaryContainer)
        return;
    // Check if all 4 dropdowns (3 item slots + boots) have selections
    const allFilled = allDropdowns.every(dropdown => dropdown.value !== "");
    if (allFilled) {
        summaryContainer.classList.add('visible');
    }
    else {
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
function loadChampionWikiData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('scraper/champion-wiki-data.json');
            if (!response.ok) {
                console.error('Failed to load champion-wiki-data.json');
                return [];
            }
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error('Error loading champion wiki data:', error);
            return [];
        }
    });
}
// UI-only role label mapping: keep logic using canonical codes, but show BOT for ADC
function displayRole(role) {
    return role === 'ADC' ? 'BOT' : role;
}
/**
 * Creates a dropdown for selecting champions for a specific role
 */
function createChampionDropdown(element, championWikiData, allChampions, patchVersion, slotRole, isEnemyTeam = false) {
    // Create dropdown
    let select = element.querySelector("select.champion-select");
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
        const roleMapping = {
            'Top': 'TOP',
            'Jungle': 'JUNGLE',
            'Middle': 'MID',
            'Bottom': 'ADC',
            'Support': 'SUPPORT'
        };
        // Filter champions that can play this specific role
        const championsForRole = [];
        championWikiData.forEach(champion => {
            // Check if this champion can play the slot's role
            const canPlayRole = champion.roles.some(role => roleMapping[role] === slotRole);
            if (!canPlayRole)
                return;
            // For enemy team, exclude Bard from SUPPORT role
            if (isEnemyTeam && slotRole === 'SUPPORT' && champion.name.toLowerCase() === 'bard') {
                return;
            }
            // Find the Data Dragon champion data
            const championData = Object.values(allChampions.data).find((champ) => {
                const champId = champ.id.toLowerCase();
                const champName = champ.name.toLowerCase();
                const wikiName = champion.name.toLowerCase();
                // Use exact matches only to avoid false positives (e.g., "vi" matching "anivia")
                return champId === wikiName || champName === wikiName;
            });
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
            select.appendChild(option);
        });
        element.appendChild(select);
    }
    // Ensure there is an <img> we can update
    let img = element.querySelector("img");
    select.addEventListener("change", () => {
        var _a, _b;
        const previousValue = select.dataset.previousValue;
        const selected = select.value;
        const championName = (_b = (_a = select.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
        // Remove previous selection from the set
        if (previousValue) {
            selectedChampions.delete(previousValue);
        }
        // Add new selection to the set
        if (selected) {
            selectedChampions.add(selected);
            select.dataset.previousValue = selected;
        }
        else {
            delete select.dataset.previousValue;
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
        }
        else if (img) {
            // Clear image if user selects the default option again
            img.src = "";
            img.alt = "";
            img.title = "";
        }
        // Update AP/AD/Tank counts after champion selection
        analyzeChampions();
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
            }
            else if (option.value === currentValue) {
                // Don't disable the currently selected option in this dropdown
                option.disabled = false;
            }
            else if (selectedChampions.has(option.value)) {
                // Disable if selected in another dropdown
                option.disabled = true;
            }
            else {
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
function assignChampionsToTeam(teamListSelector, championWikiData, allChampions, patchVersion, usedChampions, isEnemyTeam = false) {
    const teamList = document.querySelector(teamListSelector);
    if (!teamList) {
        console.error(`Team list ${teamListSelector} not found`);
        return;
    }
    const championSlots = teamList.querySelectorAll('li.champion-dropdown');
    championSlots.forEach(slot => {
        const slotElement = slot;
        // Get role from class list (e.g., 'top', 'jungle', 'mid', 'adc', 'support', 'bard')
        const roleClass = Array.from(slotElement.classList).find(cls => ['top', 'jungle', 'mid', 'adc', 'support', 'bard'].includes(cls));
        if (!roleClass) {
            console.warn('No role class found for champion slot', slot);
            return;
        }
        // Special case: if the role is 'bard', assign Bard specifically
        if (roleClass === 'bard') {
            const bardData = Object.values(allChampions.data).find((champ) => champ.id.toLowerCase() === 'bard');
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
                let label = slotElement.querySelector('.champion-label');
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
        const roleMapping = {
            'TOP': 'Top',
            'JUNGLE': 'Jungle',
            'MID': 'Middle',
            'ADC': 'Bottom',
            'SUPPORT': 'Support'
        };
        const wikiRole = roleMapping[role] || role;
        let availableChampions = championWikiData.filter(champion => {
            const hasRole = champion.roles.includes(wikiRole);
            if (!hasRole)
                return false;
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
        let randomChampion;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop
        while (attempts < maxAttempts) {
            const candidate = availableChampions[Math.floor(Math.random() * availableChampions.length)];
            if (!candidate) {
                attempts++;
                continue;
            }
            // Find the champion data to check if it's already used
            const candidateData = Object.values(allChampions.data).find((champ) => {
                const champId = champ.id.toLowerCase();
                const champName = champ.name.toLowerCase();
                const wikiName = candidate.name.toLowerCase();
                return champId === wikiName || champName === wikiName;
            });
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
        const championData = Object.values(allChampions.data).find((champ) => {
            const champId = champ.id.toLowerCase();
            const champName = champ.name.toLowerCase();
            const wikiName = randomChampion.name.toLowerCase();
            return champId === wikiName || champName === wikiName;
        });
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
        const selectElement = slotElement.querySelector('select.champion-select');
        if (selectElement) {
            selectElement.value = championData.id;
            selectElement.dataset.previousValue = championData.id;
        }
    });
}
// Helper: does an item have the "Health" tag based on enriched data?
function itemHasHealthTag(itemId) {
    if (!itemId)
        return false;
    const enriched = bardEnrichedItemsById === null || bardEnrichedItemsById === void 0 ? void 0 : bardEnrichedItemsById[itemId];
    const tags = enriched === null || enriched === void 0 ? void 0 : enriched.tag;
    return Array.isArray(tags) && tags.includes("Health");
}
// Helper: apply/remove green border class for Health-tagged items
function applyHealthBorder(element, itemId) {
    if (itemHasHealthTag(itemId)) {
        element.classList.add("health");
    }
    else {
        element.classList.remove("health");
    }
}
// Fetch items.json for a patch and return a by-id map
function loadItemsById(patch) {
    return __awaiter(this, void 0, void 0, function* () {
        const usePatch = patch !== null && patch !== void 0 ? patch : (yield fetchCurrentPatch());
        const url = `https://ddragon.leagueoflegends.com/cdn/${usePatch}/data/en_US/item.json`;
        const res = yield fetch(url);
        const json = yield res.json();
        // DDragon shape: { data: { "3877": { ... }, "3742": { ... }, ... } }
        const itemsById = json.data;
        return { patch: usePatch, itemsById };
    });
}
function matchBardItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const { patch, itemsById } = yield loadItemsById();
        // Enriched array you can render with
        const enriched = BardItems.map(bardItemId => {
            var _a, _b, _c;
            const dd = itemsById[bardItemId.id]; // may be undefined if id not found
            return {
                bardItemId,
                existsInDDragon: !!dd,
                tag: (_a = dd === null || dd === void 0 ? void 0 : dd.tags) !== null && _a !== void 0 ? _a : [],
                stats: (_b = dd === null || dd === void 0 ? void 0 : dd.stats) !== null && _b !== void 0 ? _b : {},
                officialName: (_c = dd === null || dd === void 0 ? void 0 : dd.name) !== null && _c !== void 0 ? _c : bardItemId.name, // prefer DDragon name if found
                icon: dd ? `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${bardItemId.id}.png` : undefined,
                patch,
            };
        });
        // Quick lookup if you prefer O(1) access by id
        const enrichedById = Object.fromEntries(enriched.map(e => [e.bardItemId.id, e]));
        //   // Example usage:
        //   const bloodsong = enrichedById["3877"];
        //   if (bloodsong?.existsInDDragon && bloodsong.icon) {
        //     // set a variable, update UI, etc.
        //     console.log("Bloodsong icon:", bloodsong.icon);
        //   } else {
        //     console.warn("Bloodsong not found in DDragon");
        //   }
        return { patch, enriched, enrichedById };
    });
}
/**
 * Generates new champion teams
 */
function generateNewTeams() {
    var _a;
    if (!allChampions || championWikiData.length === 0) {
        console.error('Champion data not loaded yet');
        return;
    }
    // Get the current patch version from existing champion images
    const existingImg = document.querySelector('.champion-dropdown img');
    const patchVersion = ((_a = existingImg === null || existingImg === void 0 ? void 0 : existingImg.src.match(/cdn\/([^/]+)\//)) === null || _a === void 0 ? void 0 : _a[1]) || '15.21.1';
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
    const usedChampions = new Set();
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
    analyzeChampions();
    console.log('Reset all item selections');
}
function normalizeName(name) {
    // Remove spaces, apostrophes, periods, and convert to lowercase
    return name.replace(/[\s'\.&]/g, '').toLowerCase();
}
function getTeamChampions() {
    const myTeam = [];
    const enemyTeam = [];
    const myTeamSlots = document.querySelectorAll('.my-team-list .champion-dropdown select');
    myTeamSlots.forEach((selectElement) => {
        const select = selectElement;
        const championId = select.value;
        if (championId) {
            const normalizedId = normalizeName(championId);
            const champion = championWikiData.find(c => normalizeName(c.name) === normalizedId);
            if (champion)
                myTeam.push(champion);
        }
    });
    const enemyTeamSlots = document.querySelectorAll('.enemy-team-list .champion-dropdown select');
    enemyTeamSlots.forEach((selectElement) => {
        const select = selectElement;
        const championId = select.value;
        if (championId) {
            const normalizedId = normalizeName(championId);
            const champion = championWikiData.find(c => normalizeName(c.name) === normalizedId);
            if (champion)
                enemyTeam.push(champion);
        }
    });
    return { myTeam, enemyTeam };
}
function isAdorAp(championWikiData) {
    let dmgType = championWikiData.adaptiveType === "physical" ? "AD" : "AP";
    return dmgType;
}
function getTeamInfo(team) {
    let ap = 0;
    let ad = 0;
    let tank = 0;
    team.forEach((Champion) => {
        switch (Champion.class) {
            case "Enchanter":
                // if (Champion.name === "Soraka" ||
                //     Champion.name === "Nami")
                break;
            case "Catcher":
                if (Champion.name === "Morgana" ||
                    Champion.name === "Zyra" ||
                    Champion.name === "Pyke" ||
                    Champion.name === "Neeko")
                    isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Juggernaut":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                if (Champion.legacyClass.includes("Tank"))
                    tank++;
                break;
            case "Diver":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Burst":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Battlemage":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Artillery":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Assassin":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Skirmisher":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Vanguard":
                // console.log(Champion.name, "class: ", Champion.class); // TODO Fix Nunu & Willump bug
                tank++;
                if (Champion.name === "Amumu" ||
                    Champion.name === "Sion" ||
                    Champion.name === "Malphite" ||
                    Champion.name === "Gragas")
                    isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Warden":
                tank++;
                if (Champion.name === "Galio"
                    || Champion.name === "K'Sante"
                    || Champion.name === "Poppy")
                    isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Marksman":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            case "Specialist":
                isAdorAp(Champion) === "AD" ? ad++ : ap++;
                break;
            default:
                console.log(`Against ${Champion.name} (${Champion.class}), consider balanced items.`);
        }
    });
    return { ap, ad, tank };
}
function analyzeChampions() {
    const { myTeam, enemyTeam } = getTeamChampions();
    console.log("Enemy team", enemyTeam);
    console.log("My team ", myTeam);
    let enemyAp = 0;
    let enemyAd = 0;
    let enemyTank = 0;
    let teamAp = 0;
    let teamAd = 0;
    let teamTank = 0;
    const enemyInfo = getTeamInfo(enemyTeam);
    const teamInfo = getTeamInfo(myTeam);
    ({ ap: enemyAp, ad: enemyAd, tank: enemyTank } = enemyInfo);
    ({ ap: teamAp, ad: teamAd, tank: teamTank } = teamInfo);
    // Style the counts in the UI
    const enemyApCount = document.querySelector(".enemy-ap");
    const enemyAdCount = document.querySelector(".enemy-ad");
    const enemyTankCount = document.querySelector(".enemy-tank");
    enemyApCount.textContent = enemyAp.toString() + " AP";
    enemyAdCount.textContent = enemyAd.toString() + " AD";
    enemyTankCount.textContent = enemyTank.toString() + (enemyTank < 2 ? " Tank" : " Tanks");
    enemyApCount.style.color = "rgba(0, 0, 255, 1)";
    enemyAdCount.style.color = "rgba(243, 146, 0, 1)";
    if (enemyAp + enemyAd > 5)
        console.error("More than 5 champions detected on enemy team!");
    const teamApCount = document.querySelector(".team-ap");
    const teamAdCount = document.querySelector(".team-ad");
    const teamTankCount = document.querySelector(".team-tank");
    teamApCount.textContent = teamAp.toString() + " AP";
    teamAdCount.textContent = teamAd.toString() + " AD";
    teamTankCount.textContent = teamTank.toString() + (teamTank < 2 ? " Tank" : " Tanks");
    teamApCount.style.color = "rgba(0, 0, 255, 1)";
    teamAdCount.style.color = "rgba(243, 146, 0, 1)";
    suggestItems(teamInfo, enemyInfo);
}
function suggestItems(teamInfo, enemyInfo) {
    const { myTeam, enemyTeam } = getTeamChampions();
    // let isWinning: boolean = false;
    let enemyAP = enemyInfo.ap, enemyAD = enemyInfo.ad, enemyTank = enemyInfo.tank;
    let enemyShields = 0, enemyPoke = 0, enemyCrit = 0, enemyAS = 0, enemyDot = 0;
    let teamAP = teamInfo.ap, teamAD = teamInfo.ad, teamTank = teamInfo.tank;
    enemyTeam.forEach((c) => {
        var _a, _b, _c, _d, _e;
        if (((_a = c.class) === null || _a === void 0 ? void 0 : _a.includes("Enchanter")) && c.name !== "Nami" && c.name !== "Soraka")
            enemyShields++;
        if (((_b = c.class) === null || _b === void 0 ? void 0 : _b.includes("Artillery")) || ((_c = c.class) === null || _c === void 0 ? void 0 : _c.includes("Burst")) && c.adaptiveType === "magic")
            enemyPoke++;
        if ((_d = c.class) === null || _d === void 0 ? void 0 : _d.includes("BattleMage"))
            enemyDot++;
        if (((_e = c.class) === null || _e === void 0 ? void 0 : _e.includes("Marksman")) || c.name === "Yasuo" || c.name === "Yone")
            enemyCrit++;
        if (c.name === "Jax" || c.name === "Master Yi" || c.name === "Tryndamere")
            enemyAS++;
    });
    const state = {
        enemyAP, enemyAD, enemyTank,
        enemyShields, enemyPoke, enemyCrit, enemyAS, enemyDot,
        teamAP, teamAD, teamTank, isWinning: false
    };
    const weightsWinning = computeWeights(Object.assign(Object.assign({}, state), { isWinning: true }));
    const weightsLosing = computeWeights(state);
    // Exclude Bloodsong and Dead Man's Plate
    const excludedIds = new Set(["3877", "3742", ...Array.from(selectedItems)]);
    const winningItems = scoreItems(weightsWinning, excludedIds);
    const losingItems = scoreItems(weightsLosing, excludedIds);
    winningItems.forEach(item => {
        console.log(`Winning Item: ${item.name} (Score: ${item.score}) - Reasons: ${item.reasons.join(", ")}`);
    });
    // Render top 3 suggestions for each state
    displaySuggestedItems(winningItems.slice(0, 3), losingItems.slice(0, 3));
}
function computeWeights(state) {
    const w = {};
    const add = (key, value = 1) => { var _a; return (w[key] = ((_a = w[key]) !== null && _a !== void 0 ? _a : 0) + value); };
    if (state.enemyCrit === 0)
        state.enemyCrit = -1;
    if (state.teamAP < 2)
        state.teamAP = -2;
    add("Armor", state.enemyAD);
    add("MR", state.enemyAP);
    add("TankBuster", state.enemyTank);
    add("AntiShield", state.enemyShields);
    add("AntiPoke", state.enemyPoke);
    add("AntiCrit", state.enemyCrit);
    add("AntiAS", state.enemyAS);
    add("AntiDot", state.enemyDot);
    add("AmpMagic", ((state.enemyAP >= 2 ? 2 : 0) + (state.teamAP >= 2 ? 2 : 0)) >= 4 ? 4 : 0);
    add("Frontline", state.teamTank === 0 ? 2 : 0);
    add("MixedEnemyDmg", (state.enemyAD >= 2 && state.enemyAP >= 2) ? 4 : 0);
    if (state.isWinning) {
        add("Frontline", 1);
        add("AP", 1);
        add("AS", 1);
    }
    else {
        add("AS", 2);
        add("AP", 2);
        add("OnHit", 1);
    }
    return w;
}
function scoreItems(weights, excludedIds) {
    const results = [];
    for (const [id, tags] of Object.entries(ITEM_TAGS)) {
        if (excludedIds.has(id))
            continue;
        let score = 0;
        const reasons = [];
        for (const tag of tags) {
            const weight = weights[tag] || 0;
            score += weight;
            reasons.push(`${weight} (+${tag})`);
        }
        if (score > 0) {
            const item = BardItems.find(item => item.id === id);
            results.push({
                id,
                name: (item === null || item === void 0 ? void 0 : item.name) || id,
                score,
                reasons
            });
        }
    }
    results.sort((a, b) => b.score - a.score);
    return results;
}
function displaySuggestedItems(winningItems, losingItems) {
    const patch = currentPatchVersion;
    const renderInto = (listSelector, items) => {
        const list = document.querySelector(listSelector);
        if (!list)
            return;
        [1, 2, 3].forEach((n, idx) => {
            const li = list.querySelector(`.suggested-item-${n}`);
            const img = li === null || li === void 0 ? void 0 : li.querySelector('img');
            const item = items[idx];
            if (!li || !img)
                return;
            if (item) {
                img.src = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${item.id}.png`;
                img.alt = item.name;
                img.title = item.reasons && item.reasons.length > 0
                    ? `${item.name} — ${item.reasons.slice(0, 2).join(', ')}`
                    : item.name;
            }
            else {
                img.src = '';
                img.alt = '';
                img.title = '';
            }
        });
    };
    renderInto('.items-list.if-winning', winningItems);
    renderInto('.items-list.if-losing', losingItems);
}
function setup() {
    // Mark Dead Man's Plate as already selected (core item for Bard)
    selectedItems.add("3742");
    // Load champion roles and assign champions to teams
    loadChampionWikiData().then(wikiData => {
        championWikiData = wikiData;
    });
    getAllChampionsAndItems().then(data => {
        if (data) {
            allChampions = data.champions;
            allItems = data.items;
            // console.log(data.items.data);
            // console.log(data.champions.data);
            // Assign champions to enemy team once we have both champion data and roles
            // Track used champions to prevent duplicates across both teams
            const usedChampions = new Set();
            if (championWikiData.length > 0) {
                // First assign my team (which includes Bard), then enemy team
                assignChampionsToTeam(".my-team-list", championWikiData, allChampions, data.patchVersion, usedChampions, false);
                assignChampionsToTeam(".enemy-team-list", championWikiData, allChampions, data.patchVersion, usedChampions, true);
            }
            else {
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
            items[0].innerHTML = `<img src="${bloodsongImg}" alt="Bloodsong">`;
            applyHealthBorder(items[0], "3877");
            const deadMansPlateImg = `https://ddragon.leagueoflegends.com/cdn/${data.patchVersion}/img/item/3742.png`;
            items[1].innerHTML = `<img src="${deadMansPlateImg}" alt="Dead Man's Plate">`;
            applyHealthBorder(items[1], "3742");
            // Create dropdown for item slot 3 - All Bard items
            const itemSlot3 = items[2];
            if (itemSlot3) {
                createItemDropdown(itemSlot3, BardItems, data.patchVersion, "Item", "item-dropdown-3");
            }
            // Create dropdown for item slot 4 - All Bard items
            const itemSlot4 = items[3];
            if (itemSlot4) {
                createItemDropdown(itemSlot4, BardItems, data.patchVersion, "Item", "item-dropdown-4");
            }
            // Create dropdown for item slot 5 - All Bard items
            const itemSlot5 = items[4];
            if (itemSlot5) {
                createItemDropdown(itemSlot5, BardItems, data.patchVersion, "Item", "item-dropdown-5");
            }
            // Create dropdown for boots slot
            const bootsSlot = document.querySelector(".item.boots-dropdown");
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
            if (listItems[0])
                applyHealthBorder(listItems[0], "3877");
            if (listItems[1])
                applyHealthBorder(listItems[1], "3742");
            // Apply for current selections in all dropdowns
            allDropdowns.forEach((dropdown) => {
                const li = dropdown.closest('.item');
                if (li)
                    applyHealthBorder(li, dropdown.value || undefined);
            });
            // let items = document.querySelectorAll(".item");
            // const bloodsong = enrichedById["3877"];
            // items[0]!.innerHTML = `<img src="${bloodsong?.icon}" alt="Bloodsong">`;
            // console.log("bloodsong: ", bloodsong?.icon);
            // const deadMansPlateImg = enrichedById["3742"]?.icon;
            // console.log(deadMansPlateImg);
            // items[1]!.innerHTML = `<img src="${deadMansPlateImg}" alt="Dead Man's Plate">`;
            analyzeChampions();
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
export {};
//# sourceMappingURL=scripts.js.map