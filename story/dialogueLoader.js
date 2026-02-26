let chaptersData = null;

async function loadDialogue() {
    const response = await fetch("story/chapters.json");
    chaptersData = await response.json();
}
