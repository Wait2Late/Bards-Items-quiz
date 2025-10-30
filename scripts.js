var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var allChampions;
var allItems;
// Enriched Bard items cache
var bardEnrichedItems;
var bardEnrichedItemsById;
// Champion wiki data
var championWikiData = [];
// Track selected items across all dropdowns
var selectedItems = new Set();
var allDropdowns = [];
// Track selected champions across all dropdowns
var selectedChampions = new Set();
var allChampionDropdowns = [];
var ItemType;
(function (ItemType) {
    ItemType["SelfDefense"] = "Self-Defense";
    ItemType["SelfOffsense"] = "Self-Offense";
    ItemType["TeamDefense"] = "Team-Defense";
    ItemType["TeamOffense"] = "Team-Offense";
})(ItemType || (ItemType = {}));
var BardItems = [
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
var SelfDefense = BardItems.filter(function (item) { return item.ItemType === ItemType.SelfDefense; });
var SelfOffense = BardItems.filter(function (item) { return item.ItemType === ItemType.SelfOffsense; });
var TeamDefense = BardItems.filter(function (item) { return item.ItemType === ItemType.TeamDefense; });
var TeamOffense = BardItems.filter(function (item) { return item.ItemType === ItemType.TeamOffense; });
function fetchCurrentPatch() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://ddragon.leagueoflegends.com/api/versions.json")];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data[0]];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error fetching patch version:", error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchMerakiChampionData(championName) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions/".concat(championName, ".json"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error fetching champion: ", error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getAllChampionsAndItems() {
    return __awaiter(this, void 0, void 0, function () {
        var patchVersion, allItemsApi, allChampionsApi, _a, itemsResponse, championsResponse, items, champions, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetchCurrentPatch()];
                case 1:
                    patchVersion = _b.sent();
                    if (!patchVersion) {
                        console.error("Failed to get patch version");
                        return [2 /*return*/, null];
                    }
                    allItemsApi = "https://ddragon.leagueoflegends.com/cdn/".concat(patchVersion, "/data/en_US/item.json");
                    allChampionsApi = "https://ddragon.leagueoflegends.com/cdn/".concat(patchVersion, "/data/en_US/champion.json");
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, Promise.all([
                            fetch(allItemsApi),
                            fetch(allChampionsApi)
                        ])];
                case 3:
                    _a = _b.sent(), itemsResponse = _a[0], championsResponse = _a[1];
                    return [4 /*yield*/, itemsResponse.json()];
                case 4:
                    items = _b.sent();
                    return [4 /*yield*/, championsResponse.json()];
                case 5:
                    champions = _b.sent();
                    return [2 /*return*/, { items: items, champions: champions, patchVersion: patchVersion }];
                case 6:
                    error_3 = _b.sent();
                    console.error("Error fetching champions/items:", error_3);
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function createBootsDropdown(element, patchVersion) {
    var boots = [
        { id: "3111", name: "Mercury's Treads" },
        { id: "3047", name: "Plated Steelcaps" },
        { id: "3009", name: "Boots of Swiftness" },
        { id: "3171", name: "Crimson Lucidity" }
    ];
    // Create dropdown
    var select = element.querySelector("select.boots-dropdown");
    if (!select) {
        select = document.createElement("select");
        select.className = "boots-dropdown";
        // Track this dropdown
        allDropdowns.push(select);
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Boots";
        select.appendChild(defaultOption);
        boots.forEach(function (boot) {
            var option = document.createElement("option");
            option.value = boot.id;
            option.textContent = boot.name;
            select.appendChild(option);
        });
        element.appendChild(select); // keep the dropdown in the li
    }
    // Ensure there is an <img> we can update (don’t remove the select)
    var img = element.querySelector("img");
    select.addEventListener("change", function () {
        var _a, _b;
        var previousValue = select.dataset.previousValue;
        var selected = select.value;
        var label = (_b = (_a = select.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "Boots";
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
            img.src = "https://ddragon.leagueoflegends.com/cdn/".concat(patchVersion, "/img/item/").concat(selected, ".png");
        }
        else if (img) {
            // Clear image if user selects the default option again
            img.remove();
            img = null;
        }
    });
}
// Generic dropdown creator for any item category with grouped headers
function createItemDropdown(element, items, patchVersion, label, dropdownClass) {
    var _a;
    if (dropdownClass === void 0) { dropdownClass = "item-dropdown"; }
    // Create dropdown
    var select = element.querySelector("select.".concat(dropdownClass));
    if (!select) {
        select = document.createElement("select");
        select.className = dropdownClass;
        // Track this dropdown
        allDropdowns.push(select);
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select ".concat(label);
        select.appendChild(defaultOption);
        // Group items by ItemType
        var groupedItems_1 = (_a = {},
            _a[ItemType.SelfDefense] = [],
            _a[ItemType.SelfOffsense] = [],
            _a[ItemType.TeamDefense] = [],
            _a[ItemType.TeamOffense] = [],
            _a);
        items.forEach(function (item) {
            groupedItems_1[item.ItemType].push(item);
        });
        // Create optgroups for each category
        Object.entries(groupedItems_1).forEach(function (_a) {
            var category = _a[0], categoryItems = _a[1];
            if (categoryItems.length > 0) {
                var optgroup_1 = document.createElement("optgroup");
                optgroup_1.label = category;
                categoryItems.forEach(function (item) {
                    var option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.name;
                    optgroup_1.appendChild(option);
                });
                select.appendChild(optgroup_1);
            }
        });
        element.appendChild(select);
    }
    // Ensure there is an <img> we can update (don't remove the select)
    var img = element.querySelector("img");
    select.addEventListener("change", function () {
        var _a, _b;
        var previousValue = select.dataset.previousValue;
        var selected = select.value;
        var itemName = (_b = (_a = select.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : label;
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
            img.src = "https://ddragon.leagueoflegends.com/cdn/".concat(patchVersion, "/img/item/").concat(selected, ".png");
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
    allDropdowns.forEach(function (dropdown) {
        var currentValue = dropdown.value;
        // Iterate through all options in the dropdown
        Array.from(dropdown.options).forEach(function (option) {
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
    var summaryContainer = document.querySelector('.summary-container');
    if (!summaryContainer)
        return;
    // Check if all 4 dropdowns (3 item slots + boots) have selections
    var allFilled = allDropdowns.every(function (dropdown) { return dropdown.value !== ""; });
    if (allFilled) {
        summaryContainer.classList.add('visible');
    }
    else {
        summaryContainer.classList.remove('visible');
    }
}
// Reset all item dropdowns (slots 3, 4, 5, and boots) to their default state
function resetAllItemDropdowns() {
    allDropdowns.forEach(function (dropdown) {
        var previousValue = dropdown.dataset.previousValue;
        // Remove from selected items set
        if (previousValue) {
            selectedItems.delete(previousValue);
            delete dropdown.dataset.previousValue;
        }
        // Reset dropdown to default option
        dropdown.value = "";
        // Remove the image from the parent item
        var parentItem = dropdown.closest('.item');
        if (parentItem) {
            var img = parentItem.querySelector('img');
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
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('scraper/champion-wiki-data.json')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error('Failed to load champion-wiki-data.json');
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error loading champion wiki data:', error_4);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// UI-only role label mapping: keep logic using canonical codes, but show BOT for ADC
function displayRole(role) {
    return role === 'ADC' ? 'BOT' : role;
}
/**
 * Creates a dropdown for selecting champions for a specific role
 */
function createChampionDropdown(element, championWikiData, allChampions, patchVersion, slotRole, isEnemyTeam) {
    if (isEnemyTeam === void 0) { isEnemyTeam = false; }
    // Create dropdown
    var select = element.querySelector("select.champion-select");
    if (!select) {
        select = document.createElement("select");
        select.className = "champion-select";
        // Track this dropdown
        allChampionDropdowns.push(select);
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        // Show the role name in the placeholder, e.g., Select TOP / JUNGLE / MID / BOT / SUPPORT (UI-only mapping)
        defaultOption.textContent = "Select ".concat(displayRole(slotRole));
        select.appendChild(defaultOption);
        // Map role names from wiki data to expected format
        var roleMapping_1 = {
            'Top': 'TOP',
            'Jungle': 'JUNGLE',
            'Middle': 'MID',
            'Bottom': 'ADC',
            'Support': 'SUPPORT'
        };
        // Filter champions that can play this specific role
        var championsForRole_1 = [];
        championWikiData.forEach(function (champion) {
            // Check if this champion can play the slot's role
            var canPlayRole = champion.roles.some(function (role) { return roleMapping_1[role] === slotRole; });
            if (!canPlayRole)
                return;
            // For enemy team, exclude Bard from SUPPORT role
            if (isEnemyTeam && slotRole === 'SUPPORT' && champion.name.toLowerCase() === 'bard') {
                return;
            }
            // Find the Data Dragon champion data
            var championData = Object.values(allChampions.data).find(function (champ) {
                var champId = champ.id.toLowerCase();
                var champName = champ.name.toLowerCase();
                var wikiName = champion.name.toLowerCase();
                // Use exact matches only to avoid false positives (e.g., "vi" matching "anivia")
                return champId === wikiName || champName === wikiName;
            });
            if (championData) {
                // Avoid duplicates
                if (!championsForRole_1.some(function (c) { return c.championId === championData.id; })) {
                    championsForRole_1.push({
                        name: champion.name,
                        championId: championData.id
                    });
                }
            }
        });
        // Sort champions alphabetically by name
        championsForRole_1.sort(function (a, b) { return a.name.localeCompare(b.name); });
        // Add all champions as options
        championsForRole_1.forEach(function (champ) {
            var option = document.createElement("option");
            option.value = champ.championId;
            option.textContent = champ.name;
            select.appendChild(option);
        });
        element.appendChild(select);
    }
    // Ensure there is an <img> we can update
    var img = element.querySelector("img");
    select.addEventListener("change", function () {
        var _a, _b;
        var previousValue = select.dataset.previousValue;
        var selected = select.value;
        var championName = (_b = (_a = select.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
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
            img.src = "https://ddragon.leagueoflegends.com/cdn/".concat(patchVersion, "/img/champion/").concat(selected, ".png");
            img.title = championName;
        }
        else if (img) {
            // Clear image if user selects the default option again
            img.src = "";
            img.alt = "";
            img.title = "";
        }
    });
}
/**
 * Update all champion dropdowns to disable champions that are already selected elsewhere.
 */
function updateAllChampionDropdowns() {
    allChampionDropdowns.forEach(function (dropdown) {
        var currentValue = dropdown.value;
        // Iterate through all options in the dropdown
        Array.from(dropdown.options).forEach(function (option) {
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
function assignChampionsToTeam(teamListSelector, championWikiData, allChampions, patchVersion, usedChampions, isEnemyTeam) {
    if (isEnemyTeam === void 0) { isEnemyTeam = false; }
    var teamList = document.querySelector(teamListSelector);
    if (!teamList) {
        console.error("Team list ".concat(teamListSelector, " not found"));
        return;
    }
    var championSlots = teamList.querySelectorAll('li.champion-dropdown');
    championSlots.forEach(function (slot) {
        var slotElement = slot;
        // Get role from class list (e.g., 'top', 'jungle', 'mid', 'adc', 'support', 'bard')
        var roleClass = Array.from(slotElement.classList).find(function (cls) {
            return ['top', 'jungle', 'mid', 'adc', 'support', 'bard'].includes(cls);
        });
        if (!roleClass) {
            console.warn('No role class found for champion slot', slot);
            return;
        }
        // Special case: if the role is 'bard', assign Bard specifically
        if (roleClass === 'bard') {
            var bardData = Object.values(allChampions.data).find(function (champ) {
                return champ.id.toLowerCase() === 'bard';
            });
            if (bardData) {
                var imgElement_1 = slotElement.querySelector('img');
                if (imgElement_1) {
                    imgElement_1.src = "https://ddragon.leagueoflegends.com/cdn/".concat(patchVersion, "/img/champion/").concat(bardData.id, ".png");
                    imgElement_1.alt = bardData.name;
                    imgElement_1.title = "".concat(bardData.name, " (SUPPORT)");
                    // Add Bard to used champions
                    usedChampions.add(bardData.id);
                }
                // Add/update a styled label under Bard icon (looks like dropdown)
                var label = slotElement.querySelector('.champion-label');
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
        var role = roleClass.toUpperCase();
        // Create dropdown for this champion slot (not for bard slot)
        createChampionDropdown(slotElement, championWikiData, allChampions, patchVersion, role, isEnemyTeam);
        // Filter champions that can play this role
        // Map role names to wiki format
        var roleMapping = {
            'TOP': 'Top',
            'JUNGLE': 'Jungle',
            'MID': 'Middle',
            'ADC': 'Bottom',
            'SUPPORT': 'Support'
        };
        var wikiRole = roleMapping[role] || role;
        var availableChampions = championWikiData.filter(function (champion) {
            var hasRole = champion.roles.includes(wikiRole);
            if (!hasRole)
                return false;
            // For enemy team support role, exclude Bard
            if (isEnemyTeam && role === 'SUPPORT' && champion.name.toLowerCase() === 'bard') {
                return false;
            }
            return true;
        });
        if (availableChampions.length === 0) {
            console.warn("No champions found for role: ".concat(role));
            return;
        }
        // Try to find a champion that hasn't been used yet
        var randomChampion;
        var attempts = 0;
        var maxAttempts = 50; // Prevent infinite loop
        var _loop_1 = function () {
            var candidate = availableChampions[Math.floor(Math.random() * availableChampions.length)];
            if (!candidate) {
                attempts++;
                return "continue";
            }
            // Find the champion data to check if it's already used
            var candidateData = Object.values(allChampions.data).find(function (champ) {
                var champId = champ.id.toLowerCase();
                var champName = champ.name.toLowerCase();
                var wikiName = candidate.name.toLowerCase();
                return champId === wikiName || champName === wikiName;
            });
            // If champion data found and not already used, select it
            if (candidateData && !usedChampions.has(candidateData.id)) {
                randomChampion = candidate;
                return "break";
            }
            attempts++;
        };
        while (attempts < maxAttempts) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
        if (!randomChampion) {
            console.warn("Failed to select unique champion for role: ".concat(role, " after ").concat(maxAttempts, " attempts"));
            // Fallback: just pick any available champion
            randomChampion = availableChampions[Math.floor(Math.random() * availableChampions.length)];
        }
        if (!randomChampion) {
            console.warn("Failed to select champion for role: ".concat(role));
            return;
        }
        // Find champion in Data Dragon data
        // Try to match by slug or by name
        var championData = Object.values(allChampions.data).find(function (champ) {
            var champId = champ.id.toLowerCase();
            var champName = champ.name.toLowerCase();
            var wikiName = randomChampion.name.toLowerCase();
            return champId === wikiName || champName === wikiName;
        });
        if (!championData) {
            console.warn("Champion data not found for: ".concat(randomChampion.name));
            return;
        }
        // Set the champion image
        var imgElement = slotElement.querySelector('img');
        if (imgElement) {
            imgElement.src = "https://ddragon.leagueoflegends.com/cdn/".concat(patchVersion, "/img/champion/").concat(championData.id, ".png");
            imgElement.alt = championData.name;
            imgElement.title = "".concat(championData.name, " (").concat(displayRole(role), ")");
            // Add this champion to the used set
            usedChampions.add(championData.id);
        }
        // Update the dropdown to reflect the selected champion
        var selectElement = slotElement.querySelector('select.champion-select');
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
    var enriched = bardEnrichedItemsById === null || bardEnrichedItemsById === void 0 ? void 0 : bardEnrichedItemsById[itemId];
    var tags = enriched === null || enriched === void 0 ? void 0 : enriched.tag;
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
    return __awaiter(this, void 0, void 0, function () {
        var usePatch, _a, url, res, json, itemsById;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(patch !== null && patch !== void 0)) return [3 /*break*/, 1];
                    _a = patch;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, fetchCurrentPatch()];
                case 2:
                    _a = (_b.sent());
                    _b.label = 3;
                case 3:
                    usePatch = _a;
                    url = "https://ddragon.leagueoflegends.com/cdn/".concat(usePatch, "/data/en_US/item.json");
                    return [4 /*yield*/, fetch(url)];
                case 4:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 5:
                    json = _b.sent();
                    itemsById = json.data;
                    return [2 /*return*/, { patch: usePatch, itemsById: itemsById }];
            }
        });
    });
}
function matchBardItems() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, patch, itemsById, enriched, enrichedById;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadItemsById()];
                case 1:
                    _a = _b.sent(), patch = _a.patch, itemsById = _a.itemsById;
                    enriched = BardItems.map(function (bardItemId) {
                        var _a, _b, _c;
                        var dd = itemsById[bardItemId.id]; // may be undefined if id not found
                        return {
                            bardItemId: bardItemId,
                            existsInDDragon: !!dd,
                            tag: (_a = dd === null || dd === void 0 ? void 0 : dd.tags) !== null && _a !== void 0 ? _a : [],
                            stats: (_b = dd === null || dd === void 0 ? void 0 : dd.stats) !== null && _b !== void 0 ? _b : {},
                            officialName: (_c = dd === null || dd === void 0 ? void 0 : dd.name) !== null && _c !== void 0 ? _c : bardItemId.name, // prefer DDragon name if found
                            icon: dd ? "https://ddragon.leagueoflegends.com/cdn/".concat(patch, "/img/item/").concat(bardItemId.id, ".png") : undefined,
                            patch: patch,
                        };
                    });
                    enrichedById = Object.fromEntries(enriched.map(function (e) { return [e.bardItemId.id, e]; }));
                    //   // Example usage:
                    //   const bloodsong = enrichedById["3877"];
                    //   if (bloodsong?.existsInDDragon && bloodsong.icon) {
                    //     // set a variable, update UI, etc.
                    //     console.log("Bloodsong icon:", bloodsong.icon);
                    //   } else {
                    //     console.warn("Bloodsong not found in DDragon");
                    //   }
                    return [2 /*return*/, { patch: patch, enriched: enriched, enrichedById: enrichedById }];
            }
        });
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
    var existingImg = document.querySelector('.champion-dropdown img');
    var patchVersion = ((_a = existingImg === null || existingImg === void 0 ? void 0 : existingImg.src.match(/cdn\/([^/]+)\//)) === null || _a === void 0 ? void 0 : _a[1]) || '15.21.1';
    // Clear all selected champions
    selectedChampions.clear();
    // Reset all champion dropdowns
    allChampionDropdowns.forEach(function (dropdown) {
        var previousValue = dropdown.dataset.previousValue;
        if (previousValue) {
            delete dropdown.dataset.previousValue;
        }
        dropdown.value = "";
        // Clear the image from the parent champion slot
        var parentSlot = dropdown.closest('.champion-dropdown');
        if (parentSlot) {
            var img = parentSlot.querySelector('img');
            if (img) {
                img.src = "";
                img.alt = "";
                img.title = "";
            }
        }
    });
    // Remove any Bard label(s) before regenerating
    document.querySelectorAll('.champion-dropdown .champion-label').forEach(function (el) { return el.remove(); });
    // Track used champions to prevent duplicates across both teams
    var usedChampions = new Set();
    // First assign my team (which includes Bard), then enemy team
    assignChampionsToTeam(".my-team-list", championWikiData, allChampions, patchVersion, usedChampions, false);
    assignChampionsToTeam(".enemy-team-list", championWikiData, allChampions, patchVersion, usedChampions, true);
    // Update the selectedChampions set with the randomly assigned champions
    usedChampions.forEach(function (champId) { return selectedChampions.add(champId); });
    // Update all champion dropdowns to reflect the new selections
    updateAllChampionDropdowns();
    console.log('Generated new teams with champions:', Array.from(usedChampions));
    // Reset all item dropdowns (slots 3, 4, 5, and boots)
    allDropdowns.forEach(function (dropdown) {
        var previousValue = dropdown.dataset.previousValue;
        if (previousValue) {
            selectedItems.delete(previousValue);
            delete dropdown.dataset.previousValue;
        }
        dropdown.value = "";
        // Remove the image from the parent item
        var parentItem = dropdown.closest('.item');
        if (parentItem) {
            var img = parentItem.querySelector('img');
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
function normalizeName(name) {
    // Remove spaces, apostrophes, periods, and convert to lowercase
    return name.replace(/[\s'\.&]/g, '').toLowerCase();
}
function getTeamChampions() {
    var myTeam = [];
    var enemyTeam = [];
    var myTeamSlots = document.querySelectorAll('.my-team-list .champion-dropdown select');
    myTeamSlots.forEach(function (selectElement) {
        var select = selectElement;
        var championId = select.value;
        if (championId) {
            var normalizedId_1 = normalizeName(championId);
            var champion = championWikiData.find(function (c) {
                return normalizeName(c.name) === normalizedId_1;
            });
            if (champion)
                myTeam.push(champion);
        }
    });
    var enemyTeamSlots = document.querySelectorAll('.enemy-team-list .champion-dropdown select');
    enemyTeamSlots.forEach(function (selectElement) {
        var select = selectElement;
        var championId = select.value;
        if (championId) {
            var normalizedId_2 = normalizeName(championId);
            var champion = championWikiData.find(function (c) {
                return normalizeName(c.name) === normalizedId_2;
            });
            if (champion)
                enemyTeam.push(champion);
        }
    });
    return { myTeam: myTeam, enemyTeam: enemyTeam };
}
function suggestItems() {
    var _a = getTeamChampions(), myTeam = _a.myTeam, enemyTeam = _a.enemyTeam;
    console.log("Enemy team", enemyTeam);
    console.log("My team ", myTeam);
    var enemyAp = 0;
    var enemyAd = 0;
    var enemyTank = 0;
    var teamAp = 0;
    var teamAd = 0;
    var teamTank = 0;
    // enemyTeam.forEach((champion) => {
    //     switch (champion.class){
    //         case "Enchanter":
    //             console.log(`Against ${champion.name} (Enchanter), consider Team Defense items.`);
    //             break;
    //         case "Catcher":
    //             console.log(`Against ${champion.name} (Catcher), consider Self Defense items.`);
    //             break;
    //         case "Juggernaut":
    //             console.log(`Against ${champion.name} (Juggernaut), consider Self Offense items.`);
    //             break;
    //         case "Diver":
    //             console.log(`Against ${champion.name} (Diver), consider Team Offense items.`);
    //             break;
    //         case "Burst":
    //             console.log(`Against ${champion.name} (Burst), consider Self Defense items.`);
    //             break;
    //         case "Battlemage":
    //             console.log(`Against ${champion.name} (Battlemage), consider Self Defense items.`);
    //             break;
    //         case "Artillery":
    //             console.log(`Against ${champion.name} (Artillery), consider Team Defense items.`);
    //             break;
    //         case "Assassin":
    //             console.log(`Against ${champion.name} (Assassin), consider Self Defense items.`);
    //             break;
    //         case "Skirmisher":
    //             console.log(`Against ${champion.name} (Skirmisher), consider Self Offense items.`);
    //             break;
    //         case "Vanguard":
    //             console.log(`Against ${champion.name} (Vanguard), consider Team Offense items.`);
    //             break;
    //         case "Warden":
    //             console.log(`Against ${champion.name} (Warden), consider Team Defense items.`);
    //             break;
    //         case "Marksman":
    //             console.log(`Against ${champion.name} (Marksman), consider Self Defense items.`);
    //             break;
    //         case "Specialist":
    //             console.log(`Against ${champion.name} (Specialist), consider Self Offense items.`);
    //             break;
    //         default:
    //             console.log(`Against ${champion.name} (${champion.class}), consider balanced items.`);
    //     }
    // });
    //     myTeam.forEach((champion) => {
    //     switch (champion.class){
    //         case "Enchanter":
    //             break;
    //         case "Catcher":
    //             break;
    //         case "Juggernaut":
    //             break;
    //         case "Diver":
    //             break;
    //         case "Burst":
    //             break;
    //         case "Battlemage":
    //             break;
    //         case "Artillery":
    //             break;
    //         case "Assassin":
    //             break;
    //         case "Skirmisher":
    //             break;
    //         case "Vanguard":
    //             break;
    //         case "Warden":
    //             break;
    //         case "Marksman":
    //             break;
    //         case "Specialist":
    //             break;
    //         default:
    //     }
    // });
}
function setup() {
    // Mark Dead Man's Plate as already selected (core item for Bard)
    selectedItems.add("3742");
    // Load champion roles and assign champions to teams
    loadChampionWikiData().then(function (wikiData) {
        championWikiData = wikiData;
        console.log("Loaded ".concat(championWikiData.length, " champions with wiki data"));
    });
    getAllChampionsAndItems().then(function (data) {
        if (data) {
            allChampions = data.champions;
            allItems = data.items;
            // console.log(data.items.data);
            // console.log(data.champions.data);
            // Assign champions to enemy team once we have both champion data and roles
            // Track used champions to prevent duplicates across both teams
            var usedChampions_1 = new Set();
            if (championWikiData.length > 0) {
                // First assign my team (which includes Bard), then enemy team
                assignChampionsToTeam(".my-team-list", championWikiData, allChampions, data.patchVersion, usedChampions_1, false);
                assignChampionsToTeam(".enemy-team-list", championWikiData, allChampions, data.patchVersion, usedChampions_1, true);
            }
            else {
                // If roles haven't loaded yet, wait for them
                loadChampionWikiData().then(function (wikiData) {
                    championWikiData = wikiData;
                    // First assign my team (which includes Bard), then enemy team
                    assignChampionsToTeam(".my-team-list", championWikiData, allChampions, data.patchVersion, usedChampions_1, false);
                    assignChampionsToTeam(".enemy-team-list", championWikiData, allChampions, data.patchVersion, usedChampions_1, true);
                });
            }
            var items = document.querySelectorAll(".item");
            var bloodsongImg = "https://ddragon.leagueoflegends.com/cdn/".concat(data.patchVersion, "/img/item/3877.png");
            items[0].innerHTML = "<img src=\"".concat(bloodsongImg, "\" alt=\"Bloodsong\">");
            applyHealthBorder(items[0], "3877");
            var deadMansPlateImg = "https://ddragon.leagueoflegends.com/cdn/".concat(data.patchVersion, "/img/item/3742.png");
            items[1].innerHTML = "<img src=\"".concat(deadMansPlateImg, "\" alt=\"Dead Man's Plate\">");
            applyHealthBorder(items[1], "3742");
            // Create dropdown for item slot 3 - All Bard items
            var itemSlot3 = items[2];
            if (itemSlot3) {
                createItemDropdown(itemSlot3, BardItems, data.patchVersion, "Item", "item-dropdown-3");
            }
            // Create dropdown for item slot 4 - All Bard items
            var itemSlot4 = items[3];
            if (itemSlot4) {
                createItemDropdown(itemSlot4, BardItems, data.patchVersion, "Item", "item-dropdown-4");
            }
            // Create dropdown for item slot 5 - All Bard items
            var itemSlot5 = items[4];
            if (itemSlot5) {
                createItemDropdown(itemSlot5, BardItems, data.patchVersion, "Item", "item-dropdown-5");
            }
            // Create dropdown for boots slot
            var bootsSlot = document.querySelector(".item.boots-dropdown");
            if (bootsSlot) {
                createBootsDropdown(bootsSlot, data.patchVersion);
            }
            // Update all dropdowns to disable Dead Man's Plate (pre-selected core item)
            updateAllDropdowns();
        }
        var matchedItems = matchBardItems().then(function (_a) {
            var patch = _a.patch, enriched = _a.enriched, enrichedById = _a.enrichedById;
            bardEnrichedItems = enriched;
            bardEnrichedItemsById = enrichedById;
            // console.log("Current patch:", patch);
            // console.log("Enriched Bard Items:", enriched);
            // console.log("Enriched By ID:", enrichedById);
            // Re-apply health borders now that enriched tags are available
            var listItems = document.querySelectorAll('.items-list .item');
            if (listItems[0])
                applyHealthBorder(listItems[0], "3877");
            if (listItems[1])
                applyHealthBorder(listItems[1], "3742");
            // Apply for current selections in all dropdowns
            allDropdowns.forEach(function (dropdown) {
                var li = dropdown.closest('.item');
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
            suggestItems();
        });
    });
    // Add event listener for the "Generate teams" button
    var newChampionsButton = document.getElementById('new-champions-button');
    if (newChampionsButton) {
        newChampionsButton.addEventListener('click', function () {
            generateNewTeams();
        });
    }
}
setup();
