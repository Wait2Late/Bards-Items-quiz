const allVersionsApi = "https://ddragon.leagueoflegends.com/api/versions.json";

let allChampions;
let allItems;

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

function createBootsDropdown(element: HTMLElement) {
    const boots = [
        { id: "3111", name: "Mercury's Treads" },
        { id: "3047", name: "Plated Steelcaps" },
        { id: "3009", name: "Boots of Swiftness" },
        { id: "3171", name: "Crimson Lucidity" }
    ];

    const select = document.createElement("select");
    select.className = "boots-dropdown";

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

    // Event: Change image when a boot is selected
    select.addEventListener("change", async (e) => {
        const selectedId = (e.target as HTMLSelectElement).value;
        element.innerHTML = ""; // Clear previous content
        element.appendChild(select); // Keep dropdown

        if (selectedId) {
            const currentPatch = await fetchCurrentPatch();
            const img = document.createElement("img");
            img.src = `https://ddragon.leagueoflegends.com/cdn/${currentPatch}/img/item/${selectedId}.png`;
            img.alt = select.selectedOptions[0]!.textContent || "Boots";
            element.appendChild(img);
            element.innerHTML = `<img src="${img.src}" alt="boots">`;
        }
    });

    element.innerHTML = "";
    element.appendChild(select);
}

// Usage example (after DOM is loaded):
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".item");
    if (items[5]) {
        createBootsDropdown(items[5] as HTMLElement);
    }
});

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

        const deadMansPlate = `https://ddragon.leagueoflegends.com/cdn/${data.patchVersion}/img/item/3742.png`;
        items[1]!.innerHTML = `<img src="${deadMansPlate}" alt="Dead Man's Plate">`;


    }
});

interface Item {
    id: string;
    name: string;
}

const deadMansPlateItem : Item = {
    id: "3742",
    name: "Dead Man's Plate",
};

