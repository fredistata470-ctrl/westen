// Chapter 3 — Post-Game
// Modular post-game scene: result (Win/Loss/Draw), performance rating, and
// branching story impact are all driven by saveData in the story engine.
// Drop additional dialogue lines into the dialogue array without breaking the engine.

var chapter3PostGameDialogue = createDialogueScene({
    id: "ch3_postgame",
    background: "sideline",
    dialogue: [
        { speaker: "Reporter", emotion: "excited",    text: "What a match! Can you tell us what was going through your mind out there?" },
        { speaker: "Player",   emotion: "determined", text: "It was tough — they came out pressing hard. But we kept our shape and found our chances." },
        { speaker: "Zhao",     emotion: "serious",    text: "I had two shots go wide. Not good enough. But the team pulled through." },
        { speaker: "Reporter", emotion: "curious",    text: "Coach Rivera, your thoughts?" },
        { speaker: "Coach",    emotion: "serious",    text: "Proud of the effort. There's still work to do, but this is the foundation we needed." }
    ]
});
