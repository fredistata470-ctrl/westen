// Asset paths — matches actual filenames in assets/ folder
const main_menu_bg = "assets/images/mainmenu background.png";
const main_menu_theme = "assets/audio/main menu music.wav";

const screen = document.getElementById("screen");

let currentChapter = 0;

function init() {
    showBootScreen();
}

function showBootScreen() {
    setScene("MENU");

    if (main_menu_bg) {
        screen.style.backgroundImage = "url(\"" + main_menu_bg + "\")";
        screen.style.backgroundSize = "cover";
        screen.style.backgroundPosition = "center";
    }

    screen.innerHTML = `
        <div class="boot-screen">
            <h1 class="boot-title">Westen &amp; Zhao Champions League</h1>
            <div class="boot-prompt">&#9654; Click anywhere to start</div>
        </div>
    `;

    screen.onclick = () => {
        screen.onclick = null;
        showMainMenu();
    };
}

function showMainMenu() {
    setScene("MENU");
    audioManager.playMenuTheme(main_menu_theme);

    if (main_menu_bg) {
        screen.style.backgroundImage = "url(\"" + main_menu_bg + "\")";
        screen.style.backgroundSize = "cover";
        screen.style.backgroundPosition = "center";
    }

    screen.innerHTML = `
        <div class="main-menu">
            <h1 class="main-menu-title">Westen &amp; Zhao Champions League</h1>
            <div class="main-menu-buttons">
                <button class="menu-btn" onclick="startStoryMode()">Story Mode</button>
                <button class="menu-btn" onclick="startTrainingMode()">Training Mode</button>
                <button class="menu-btn" onclick="showSettings()">Settings</button>
            </div>
        </div>
    `;
}

function startStoryMode() {
    audioManager.fadeOutMenuTheme();
    screen.style.backgroundImage = "";
    currentChapter = 0;
    saveData.chapter = 0;
    saveData.storyProgress = 0;
    _runChapter();
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
    audioManager.fadeOutMenuTheme();
    screen.style.backgroundImage = "";
    showTrainingTeamSelect();
}

function showSettings() {
    audioManager.fadeOutMenuTheme();
    setScene("SETTINGS");
    screen.style.backgroundImage = "";
    screen.innerHTML = `
        <h2>Settings</h2>
        <p>Settings coming soon.</p>
        <button onclick="showMainMenu()">Back to Menu</button>
    `;
    // Note: showMainMenu() calls audioManager.playMenuTheme(), so the theme
    // restarts automatically when the player returns from Settings.
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
