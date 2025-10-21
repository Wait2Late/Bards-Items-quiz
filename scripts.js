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
var allVersionsApi = "https://ddragon.leagueoflegends.com/api/versions.json";
var allChampions;
var allItems;
var DamageType;
(function (DamageType) {
    DamageType["AD"] = "Physical";
    DamageType["AP"] = "Magical";
    DamageType["AS"] = "Attack Speed";
    DamageType["None"] = "None";
})(DamageType || (DamageType = {}));
var SustainType;
(function (SustainType) {
    SustainType["Def"] = "Defense";
    SustainType["Mr"] = "Magic Resist";
    SustainType["Both"] = "Def + MR";
    SustainType["None"] = "None";
})(SustainType || (SustainType = {}));
var ItemType;
(function (ItemType) {
    ItemType["SelfDefense"] = "Self-Defense";
    ItemType["SelfOffsense"] = "Self-Offense";
    ItemType["TeamDefense"] = "Team-Defense";
    ItemType["TeamOffense"] = "Team-Offense";
})(ItemType || (ItemType = {}));
var Liandry = {
    id: "6655",
    name: "Liandry's Torment",
    damageType: DamageType.AP,
    itemType: ItemType.SelfOffsense,
    SustainType: SustainType.None,
    giveHealth: true,
};
var bardItems = [
    {
        id: "3742",
        name: "Dead Man's Plate",
        damageType: DamageType.None,
        SustainType: SustainType.Def,
        itemType: ItemType.SelfDefense,
        giveHealth: true,
    },
    {
        id: "3143",
        name: "Randuin's Omen",
        damageType: DamageType.None,
        SustainType: SustainType.Def,
        itemType: ItemType.SelfDefense,
        giveHealth: true,
    },
    {
        id: "4401",
        name: "Force of Nature",
        damageType: DamageType.None,
        SustainType: SustainType.Mr,
        itemType: ItemType.SelfDefense,
        giveHealth: true,
    },
    {
        id: "2504",
        name: "Kaenic Rookern",
        damageType: DamageType.None,
        SustainType: SustainType.Mr,
        itemType: ItemType.SelfDefense,
        giveHealth: true,
    },
    {
        id: "6665",
        name: "Jak'Sho, The Protean",
        damageType: DamageType.None,
        SustainType: SustainType.Both,
        itemType: ItemType.SelfDefense,
        giveHealth: true,
    },
    {
        id: "3091",
        name: "Wit's End",
        damageType: DamageType.AS,
        SustainType: SustainType.Mr,
        itemType: ItemType.SelfOffsense,
        giveHealth: false,
    },
    {
        id: "3157",
        name: "Zhonya's Hourglass",
        damageType: DamageType.AP,
        SustainType: SustainType.Def,
        itemType: ItemType.SelfOffsense,
        giveHealth: false,
    },
    {
        id: "3302",
        name: "Terminus",
        damageType: DamageType.AS,
        SustainType: SustainType.Both,
        itemType: ItemType.SelfOffsense,
        giveHealth: false,
    },
    {
        id: "4633",
        name: "Riftmaker",
        damageType: DamageType.AP,
        SustainType: SustainType.None,
        itemType: ItemType.SelfOffsense,
        giveHealth: true,
    },
    {
        id: "6653",
        name: "Liandry's Torment",
        damageType: DamageType.AP,
        SustainType: SustainType.None,
        itemType: ItemType.SelfOffsense,
        giveHealth: true,
    },
    {
        id: "3087",
        name: "Statikk Shiv",
        damageType: DamageType.AS,
        SustainType: SustainType.None,
        itemType: ItemType.SelfOffsense,
        giveHealth: false,
    },
    {
        id: "4629",
        name: "Cosmic Drive",
        damageType: DamageType.AP,
        SustainType: SustainType.None,
        itemType: ItemType.SelfOffsense,
        giveHealth: true,
    },
    {
        id: "3073",
        name: "Experimental Hexplate",
        damageType: DamageType.AD,
        SustainType: SustainType.None,
        itemType: ItemType.SelfOffsense,
        giveHealth: true,
    },
    {
        id: "3190",
        name: "Locket of the Iron Solari",
        damageType: DamageType.None,
        SustainType: SustainType.Both,
        itemType: ItemType.TeamDefense,
        giveHealth: true,
    },
    {
        id: "3107",
        name: "Redemption",
        damageType: DamageType.None,
        SustainType: SustainType.None,
        itemType: ItemType.TeamDefense,
        giveHealth: true,
    },
    {
        id: "3222",
        name: "Mikael's Blessing",
        damageType: DamageType.None,
        SustainType: SustainType.None,
        itemType: ItemType.TeamDefense,
        giveHealth: true,
    },
    {
        id: "3110",
        name: "Frozen Heart",
        damageType: DamageType.None,
        SustainType: SustainType.Def,
        itemType: ItemType.TeamDefense,
        giveHealth: false,
    },
    {
        id: "3109",
        name: "Knight's Vow",
        damageType: DamageType.None,
        SustainType: SustainType.Def,
        itemType: ItemType.TeamDefense,
        giveHealth: true,
    },
    {
        id: "4005",
        name: "Imperial Mandate",
        damageType: DamageType.AP,
        SustainType: SustainType.None,
        itemType: ItemType.TeamOffense,
        giveHealth: false,
    },
    {
        id: "8020",
        name: "Abyssal Mask",
        damageType: DamageType.None,
        SustainType: SustainType.Mr,
        itemType: ItemType.TeamOffense,
        giveHealth: true,
    },
    {
        id: "4010",
        name: "Bloodletter's Curse",
        damageType: DamageType.AP,
        SustainType: SustainType.None,
        itemType: ItemType.TeamOffense,
        giveHealth: true,
    },
    {
        id: "6695",
        name: "Serpent's Fang",
        damageType: DamageType.AD,
        SustainType: SustainType.None,
        itemType: ItemType.TeamOffense,
        giveHealth: false,
    },
];
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
function getAllChampionsAndItems() {
    return __awaiter(this, void 0, void 0, function () {
        var patchVersion, allItemsApi, allChampionsApi, _a, itemsResponse, championsResponse, items, champions, error_2;
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
                    error_2 = _b.sent();
                    console.error("Error fetching champions/items:", error_2);
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
        var selected = select.value;
        var label = (_b = (_a = select.selectedOptions[0]) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "Boots";
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
getAllChampionsAndItems().then(function (data) {
    if (data) {
        allChampions = data.champions;
        allItems = data.items;
        console.log(data.items);
        console.log(data.champions);
        console.log("Patch Version: ".concat(data.patchVersion));
        var items = document.querySelectorAll(".item");
        var bloodsongImg = "https://ddragon.leagueoflegends.com/cdn/".concat(data.patchVersion, "/img/item/3877.png");
        items[0].innerHTML = "<img src=\"".concat(bloodsongImg, "\" alt=\"Bloodsong\">");
        var deadMansPlateImg = "https://ddragon.leagueoflegends.com/cdn/".concat(data.patchVersion, "/img/item/3742.png");
        items[1].innerHTML = "<img src=\"".concat(deadMansPlateImg, "\" alt=\"Dead Man's Plate\">");
        var bootsSlot = document.querySelector(".item.boots-dropdown");
        if (bootsSlot) {
            createBootsDropdown(bootsSlot, data.patchVersion);
        }
    }
});
