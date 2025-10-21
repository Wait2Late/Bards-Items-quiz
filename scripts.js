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
function createBootsDropdown(element) {
    var _this = this;
    var boots = [
        { id: "3111", name: "Mercury's Treads" },
        { id: "3047", name: "Plated Steelcaps" },
        { id: "3009", name: "Boots of Swiftness" },
        { id: "3171", name: "Crimson Lucidity" }
    ];
    var select = document.createElement("select");
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
    // Event: Change image when a boot is selected
    select.addEventListener("change", function (e) { return __awaiter(_this, void 0, void 0, function () {
        var selectedId, currentPatch, img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    selectedId = e.target.value;
                    element.innerHTML = ""; // Clear previous content
                    element.appendChild(select); // Keep dropdown
                    if (!selectedId) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchCurrentPatch()];
                case 1:
                    currentPatch = _a.sent();
                    img = document.createElement("img");
                    img.src = "https://ddragon.leagueoflegends.com/cdn/".concat(currentPatch, "/img/item/").concat(selectedId, ".png");
                    img.alt = select.selectedOptions[0].textContent || "Boots";
                    element.appendChild(img);
                    element.innerHTML = "<img src=\"".concat(img.src, "\" alt=\"boots\">");
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
    element.innerHTML = "";
    element.appendChild(select);
}
// Usage example (after DOM is loaded):
document.addEventListener("DOMContentLoaded", function () {
    var items = document.querySelectorAll(".item");
    if (items[5]) {
        createBootsDropdown(items[5]);
    }
});
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
        var deadMansPlate = "https://ddragon.leagueoflegends.com/cdn/".concat(data.patchVersion, "/img/item/3742.png");
        items[1].innerHTML = "<img src=\"".concat(deadMansPlate, "\" alt=\"Dead Man's Plate\">");
    }
});
var deadMansPlateItem = {
    id: "3742",
    name: "Dead Man's Plate",
};
