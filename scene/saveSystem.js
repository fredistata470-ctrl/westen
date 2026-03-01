// Save System — basic foundation.
// Stores story progress and match results to localStorage.
// Full stat growth is NOT implemented here; extend later.

const SAVE_KEY = "westen_save_v1";

let saveData = {
    chapter: 0,
    storyProgress: 0,
    wins: 0,
    losses: 0
};

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (_e) {
        console.warn("saveGame: could not write to localStorage", _e);
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            saveData = Object.assign(
                { chapter: 0, storyProgress: 0, wins: 0, losses: 0 },
                parsed
            );
            return true;
        }
    } catch (_e) {
        console.warn("loadGame: could not read from localStorage", _e);
    }
    return false;
}

function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    saveData = { chapter: 0, storyProgress: 0, wins: 0, losses: 0 };
}
