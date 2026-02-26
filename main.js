const screen = document.getElementById("screen");

let gameState = "boot";
let currentChapter = 0;

function init() {
    showBootScreen();
}

function showBootScreen() {
    gameState = "boot";
    screen.innerHTML = "<h1>Click To Start</h1>";
    screen.onclick = () => {
        screen.onclick = null;
        showMainMenu();
    };
}

function showMainMenu() {
    gameState = "menu";
    screen.innerHTML = `
        <h1>WESTEN</h1>
        <button onclick="startGame()">Start Game</button>
    `;
}

function startGame() {
    gameState = "story";
    currentChapter = 0;
    loadChapter(currentChapter);
}

function nextChapter() {
    currentChapter++;
    loadChapter(currentChapter);
}

init();
