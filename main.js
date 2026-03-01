const screen = document.getElementById("screen");

let currentChapter = 0;

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
    screen.innerHTML = `
        <h1>Westen &amp; Zhao Champions League</h1>
        <button onclick="startStoryMode()">Story Mode</button>
        <button onclick="startTrainingMode()">Training Mode</button>
        <button id="load-story-btn" onclick="loadStoryMode()">Load Story</button>
        <button onclick="showSettings()">Settings</button>
    `;
    // Disable load button if no save exists
    const loadBtn = document.getElementById("load-story-btn");
    if (loadBtn && !hasSave()) {
        loadBtn.disabled = true;
    }
}

function startStoryMode() {
    currentChapter = 0;
    saveData.chapter = 0;
    saveData.storyProgress = 0;
    _runChapter();
}

function loadStoryMode() {
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
    currentChapter++;
    // Save progress after each chapter advance
    saveData.chapter = currentChapter;
    saveData.storyProgress = currentChapter;
    saveGame();
    return loadChapter(currentChapter);
}

window.addEventListener("DOMContentLoaded", init);
