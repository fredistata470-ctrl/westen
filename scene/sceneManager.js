// Scene Manager — centralized state controller.
// All rendering and input must respect currentScene.

// DO NOT mix match logic into dialogue logic.
// Engine connects to other systems only through this manager.

const SCENES = {
    MENU: "MENU",
    DIALOGUE: "DIALOGUE",
    MATCH: "MATCH",
    POST_MATCH: "POST_MATCH",
    SETTINGS: "SETTINGS"
};

let currentScene = SCENES.MENU;

function setScene(name) {
    if (!SCENES[name]) {
        console.warn("setScene: unknown scene", name);
        return;
    }
    currentScene = name;
}
