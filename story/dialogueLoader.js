let chaptersData = null;

async function loadDialogue() {
    const candidates = [
        "story/chapters.json",
        "./story/chapters.json",
        `${window.location.pathname.replace(/\/$/, "")}/story/chapters.json`
    ];

    for (const path of candidates) {
        try {
            const response = await fetch(path, { cache: "no-store" });
            if (!response.ok) continue;
            chaptersData = await response.json();
            return;
        } catch (_error) {
            // try next candidate
        }
    }

    throw new Error("Unable to load story/chapters.json");
}
