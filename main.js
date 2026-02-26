const screen = document.getElementById("screen");

let currentChapter = 0;

function init() {
    showBootScreen();
}

function showBootScreen() {
    screen.innerHTML = "<h1>Click To Start</h1>";
    screen.onclick = () => {
        screen.onclick = null;
        showMainMenu();
    };
}

function showMainMenu() {
    screen.innerHTML = `
        <h1>WESTEN</h1>
        <button onclick="startGame()">Start Game</button>
    `;
}

async function startGame() {
    currentChapter = 0;

    try {
        await loadChapter(currentChapter);
    } catch (error) {
        console.error("Failed to start game", error);
        screen.innerHTML = `
            <h2>Could not start game</h2>
            <p>Run this project from the Westen folder using a local server.</p>
            <p>Example: <code>cd /workspace/westen && python -m http.server 4173</code></p>
        `;
    }
}

function nextChapter() {
    currentChapter++;
    return loadChapter(currentChapter);
}

window.addEventListener("DOMContentLoaded", init);
