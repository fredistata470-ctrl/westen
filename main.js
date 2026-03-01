// Asset paths — drop files into assets/ folder to activate
const main_menu_bg = "assets/images/main_menu_background.png";
const main_menu_theme = "assets/audio/main_menu_music.mp3";

const screen = document.getElementById("screen");

let currentChapter = 0;

// Return a human-readable label for the chapter at the given story index.
function _getChapterLabel(index) {
    if (typeof STORY_CHAPTERS !== "undefined" && STORY_CHAPTERS[index]) {
        const ch = STORY_CHAPTERS[index];
        if (ch.type === "match") return ch.chapterTitle || ("Chapter " + index);
        return (ch.scene && ch.scene.chapterTitle) || ("Chapter " + index);
    }
    return "Chapter " + index;
}

function init() {
    showBootScreen();
}

function showBootScreen() {
    setScene("MENU");
    screen.innerHTML = "<h1>Click To Start</h1>";
    screen.onclick = () => {
        screen.onclick = null;
        showMainMenu();
    };
}

function showMainMenu() {
    setScene("MENU");
    audioManager.playMenuTheme(main_menu_theme);

    if (main_menu_bg) {
        screen.style.backgroundImage = "url(" + main_menu_bg + ")";
        screen.style.backgroundSize = "cover";
        screen.style.backgroundPosition = "center";
    }

    const hasSaveFile = hasSave();
    let loadBtnLabel = "Load Game";
    if (hasSaveFile) {
        try {
            const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
            const name = (raw && raw.playerName) || "Otto";
            const chIdx = (raw && raw.chapter) || 0;
            loadBtnLabel = name + " \u2014 " + _getChapterLabel(chIdx);
        } catch (_e) { /* use default label */ }
    }

    screen.innerHTML = `
        <h1>Westen &amp; Zhao Champions League</h1>
        <button onclick="startStoryMode()">Story Mode</button>
        <button id="load-story-btn" onclick="loadStoryMode()">${loadBtnLabel}</button>
        <button onclick="startTrainingMode()">Training Mode</button>
        <button onclick="showSettings()">Settings</button>
    `;
    // Disable load button if no save exists
    const loadBtn = document.getElementById("load-story-btn");
    if (loadBtn && !hasSaveFile) {
        loadBtn.disabled = true;
    }
}

function startStoryMode() {
    audioManager.stopMenuTheme();
    screen.style.backgroundImage = "";
    currentChapter = 0;
    saveData.chapter = 0;
    saveData.storyProgress = 0;
    _runChapter();
}

function loadStoryMode() {
    audioManager.stopMenuTheme();
    screen.style.backgroundImage = "";
    if (loadGame()) {
        currentChapter = saveData.chapter;
        _runChapter();
    } else {
        startStoryMode();
    }
}

async function _runChapter() {
    try {
        await loadChapter(currentChapter);
    } catch (error) {
        console.error("Failed to load chapter", error);
        screen.innerHTML = `
            <h2>Could not start game</h2>
            <p>Run this project from the Westen folder using a local server.</p>
            <p>Example: <code>cd /workspace/westen &amp;&amp; python -m http.server 4173</code></p>
            <button onclick="showMainMenu()">Back</button>
        `;
    }
}

function startTrainingMode() {
    audioManager.stopMenuTheme();
    screen.style.backgroundImage = "";
    // Training Mode: direct access to the match engine, no dialogue, no progression
    setScene("MATCH");
    startMatch(null, () => {
        showMainMenu();
    });
}

function showSettings() {
    setScene("SETTINGS");
    screen.innerHTML = `
        <h2>Settings</h2>
        <p>Settings coming soon.</p>
        <button onclick="showMainMenu()">Back to Menu</button>
    `;
}

function nextChapter() {
    const completed = currentChapter;
    currentChapter++;
    // Save progress only after completing Chapter 1 (index 2) and every chapter beyond
    if (completed >= 2) {
        saveData.chapter = currentChapter;
        saveData.storyProgress = currentChapter;
        saveData.playerName = (saveData.player && saveData.player.name) || saveData.playerName || "Otto";
        saveData.timestamp = new Date().toISOString();
        saveGame();
    }
    return loadChapter(currentChapter);
}

window.addEventListener("DOMContentLoaded", init);
