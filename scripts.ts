const allVersionsApi = "https://ddragon.leagueoflegends.com/api/versions.json";

let allChampions;
let allItems;

let SelfDefense: BardItem[] = [];
let SelfOffense: BardItem[] = [];
let TeamDefense: BardItem[] = [];
let TeamOffense: BardItem[] = [];

interface IItem {
    id: string;
    name: string;
    damageType: DamageType;
    SustainType: SustainType;
    itemType: ItemType;
    giveHealth: boolean;
}

interface BardItem {
    id: string;
    name: string;
    ItemType: ItemType;
}

enum DamageType {
    AD = "Physical",
    AP = "Magical",
    AS = "Attack Speed",
    None = "None",
}

enum SustainType {
    Def = "Defense",
    Mr = "Magic Resist",
    Both = "Def + MR",
    None = "None",
}

enum ItemType {
    SelfDefense = "Self-Defense",
    SelfOffsense = "Self-Offense",
    TeamDefense = "Team-Defense",
    TeamOffense = "Team-Offense",
}

// const bardItems: IItem[] = [
//     {
//         id: "3742",
//         name: "Dead Man's Plate",
//         damageType: DamageType.None,
//         SustainType: SustainType.Def,
//         itemType: ItemType.SelfDefense,
//         giveHealth: true,
//     },
//     {
//         id: "3143",
//         name: "Randuin's Omen",
//         damageType: DamageType.None,
//         SustainType: SustainType.Def,
//         itemType: ItemType.SelfDefense,
//         giveHealth: true,
//     },
//     {
//         id: "4401",
//         name: "Force of Nature",
//         damageType: DamageType.None,
//         SustainType: SustainType.Mr,
//         itemType: ItemType.SelfDefense,
//         giveHealth: true,
//     },
//     {
//         id: "2504",
//         name: "Kaenic Rookern",
//         damageType: DamageType.None,
//         SustainType: SustainType.Mr,
//         itemType: ItemType.SelfDefense,
//         giveHealth: true,
//     },
//     {
//         id: "6665",
//         name: "Jak'Sho, The Protean",
//         damageType: DamageType.None,
//         SustainType: SustainType.Both,
//         itemType: ItemType.SelfDefense,
//         giveHealth: true,
//     },
//     {
//         id: "3091",
//         name: "Wit's End",
//         damageType: DamageType.AS,
//         SustainType: SustainType.Mr,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: false,
//     },
//     {
//         id: "3157",
//         name: "Zhonya's Hourglass",
//         damageType: DamageType.AP,
//         SustainType: SustainType.Def,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: false,
//     },
//     {
//         id: "3302",
//         name: "Terminus",
//         damageType: DamageType.AS,
//         SustainType: SustainType.Both,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: false,
//     },
//     {
//         id: "4633",
//         name: "Riftmaker",
//         damageType: DamageType.AP,
//         SustainType: SustainType.None,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: true,
//     },
//     {
//         id: "6653",
//         name: "Liandry's Torment",
//         damageType: DamageType.AP,
//         SustainType: SustainType.None,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: true,
//     },
//     {
//         id: "3087",
//         name: "Statikk Shiv",
//         damageType: DamageType.AS,
//         SustainType: SustainType.None,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: false,
//     },
//     {
//         id: "4629",
//         name: "Cosmic Drive",
//         damageType: DamageType.AP,
//         SustainType: SustainType.None,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: true,
//     },
//     {
//         id: "3073",
//         name: "Experimental Hexplate",
//         damageType: DamageType.AD,
//         SustainType: SustainType.None,
//         itemType: ItemType.SelfOffsense,
//         giveHealth: true,
//     },
//     {
//         id: "3190",
//         name: "Locket of the Iron Solari",
//         damageType: DamageType.None,
//         SustainType: SustainType.Both,
//         itemType: ItemType.TeamDefense,
//         giveHealth: true,
//     },
//     {
//         id: "3107",
//         name: "Redemption",
//         damageType: DamageType.None,
//         SustainType: SustainType.None,
//         itemType: ItemType.TeamDefense,
//         giveHealth: true,
//     },
//     {
//         id: "3222",
//         name: "Mikael's Blessing",
//         damageType: DamageType.None,
//         SustainType: SustainType.None,
//         itemType: ItemType.TeamDefense,
//         giveHealth: true,
//     },
//     {
//         id: "3110",
//         name: "Frozen Heart",
//         damageType: DamageType.None,
//         SustainType: SustainType.Def,
//         itemType: ItemType.TeamDefense,
//         giveHealth: false,
//     },
//     {
//         id: "3109",
//         name: "Knight's Vow",
//         damageType: DamageType.None,
//         SustainType: SustainType.Def,
//         itemType: ItemType.TeamDefense,
//         giveHealth: true,
//     },
//     {
//         id: "4005",
//         name: "Imperial Mandate",
//         damageType: DamageType.AP,
//         SustainType: SustainType.None,
//         itemType: ItemType.TeamOffense,
//         giveHealth: false,
//     },
//     {
//         id: "8020",
//         name: "Abyssal Mask",
//         damageType: DamageType.None,
//         SustainType: SustainType.Mr,
//         itemType: ItemType.TeamOffense,
//         giveHealth: true,
//     },
//     {
//         id: "4010",
//         name: "Bloodletter's Curse",
//         damageType: DamageType.AP,
//         SustainType: SustainType.None,
//         itemType: ItemType.TeamOffense,
//         giveHealth: true,
//     },
//     {
//         id: "6695",
//         name: "Serpent's Fang",
//         damageType: DamageType.AD,
//         SustainType: SustainType.None,
//         itemType: ItemType.TeamOffense,
//         giveHealth: false,
//     },
// ]

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

getAllChampionsAndItems().then(data => {
    if (data) {
        allChampions = data.champions;
        allItems = data.items;

        console.log(data.items);
        console.log(data.champions);
        console.log(`Patch Version: ${data.patchVersion}`);

        let items = document.querySelectorAll(".item");

        const bloodsongImg = `https://ddragon.leagueoflegends.com/cdn/${data.patchVersion}/img/item/3877.png`;
        items[0]!.innerHTML = `<img src="${bloodsongImg}" alt="Bloodsong">`;

        const deadMansPlateImg = `https://ddragon.leagueoflegends.com/cdn/${data.patchVersion}/img/item/3742.png`;
        items[1]!.innerHTML = `<img src="${deadMansPlateImg}" alt="Dead Man's Plate">`;

        const bootsSlot = document.querySelector(".item.boots-dropdown") as HTMLElement | null;
        if (bootsSlot) {
            createBootsDropdown(bootsSlot, data.patchVersion);
        }

    }
});
