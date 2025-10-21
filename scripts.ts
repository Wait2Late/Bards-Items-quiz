const allVersionsApi = "https://ddragon.leagueoflegends.com/api/versions.json";

let allChampions;
let allItems;

interface IItem {
    id: string;
    name: string;
    damageType: DamageType;
    itemType: ItemType;
    giveHealth: boolean;
}

enum DamageType {
    AD = "Physical",
    AP = "Magical",
}

enum ItemType {
    SelfDefense = "Self-Defense",
    SelfOffsense = "Self-Offense",
    TeamDefense = "Team-Defense",
    TeamOffense = "Team-Offense",
}

const Liandry : IItem = {
    id: "6655",
    name: "Liandry's Torment",
    damageType: DamageType.AP,
    itemType: ItemType.SelfOffsense,
    giveHealth: true,
};



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

