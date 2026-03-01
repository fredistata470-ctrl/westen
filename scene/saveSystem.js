// Save System — expandable story + player progression storage.
// Stores story progress, Otto's stats, and match results to localStorage.
// Training mode does NOT modify story save data.

const SAVE_KEY = "westen_save_v1";

let saveData = {
    // Player identity (display name for save slot)
    playerName: "Otto",

    // Story progress
    chapter: 0,
    storyProgress: 0,

    // Save timestamp (ISO string, set when saveGame() is called)
    timestamp: null,

    // Flat win/loss counters (legacy — also mirrored in record below)
    wins: 0,
    losses: 0,

    // Structured story state
    story: {
        currentChapter: 0,
        currentScene: "prologue",
        completedMatches: []
    },

    // Otto's player profile
    player: {
        name: "Otto",
        overall: 71,
        potential: 91,
        level: 1,
        xp: 0,

        stats: {
            speed: 72,
            shooting: 70,
            passing: 69,
            stamina: 65,
            dribbling: 71,
            insulinControl: 60
        }
    },

    // Match record
    record: {
        wins: 0,
        losses: 0,
        goals: 0
    }
};

// Default shape used when merging partial saves from localStorage
const _defaultSave = () => ({
    playerName: "Otto",
    chapter: 0,
    storyProgress: 0,
    timestamp: null,
    wins: 0,
    losses: 0,
    story: { currentChapter: 0, currentScene: "prologue", completedMatches: [] },
    player: {
        name: "Otto",
        overall: 71,
        potential: 91,
        level: 1,
        xp: 0,
        stats: { speed: 72, shooting: 70, passing: 69, stamina: 65, dribbling: 71, insulinControl: 60 }
    },
    record: { wins: 0, losses: 0, goals: 0 }
});

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
            const defaults = _defaultSave();
            // Deep-merge top-level keys; nested objects are merged without mutating defaults
            saveData = Object.assign({}, defaults, parsed, {
                playerName: parsed.playerName || defaults.playerName,
                timestamp: parsed.timestamp || defaults.timestamp,
                story: Object.assign({}, defaults.story, parsed.story || {}),
                player: Object.assign({}, defaults.player, parsed.player || {}, {
                    stats: Object.assign({}, defaults.player.stats, (parsed.player || {}).stats || {})
                }),
                record: Object.assign({}, defaults.record, parsed.record || {})
            });
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
    saveData = _defaultSave();
}
