// Chapter 2 — Rising Pressure
// Drop additional dialogue lines into the dialogue array without breaking the engine.

var chapter2Scene = createDialogueScene({
    id: "chapter_2_scene",
    background: "locker_room",
    dialogue: [
        { speaker: "Narrator", emotion: "neutral",    text: "Chapter 2 — Rising Pressure" },
        { speaker: "Narrator", emotion: "neutral",    text: "Word has spread across the league. Westen's new recruits are drawing attention." },
        { speaker: "Zhao",     emotion: "curious",    text: "Did you see that scout in the stands? He was watching us the whole session." },
        { speaker: "Player",   emotion: "serious",    text: "I noticed. We can't afford to have a bad game right now." },
        { speaker: "Coach",    emotion: "serious",    text: "Forget the scouts. Play for each other. The rest follows." },
        { speaker: "Coach",    emotion: "serious",    text: "The qualifier is tomorrow. Pre-game interviews, then the match. Be ready." },
        { speaker: "Player",   emotion: "determined", text: "Understood. We'll be ready." }
    ]
});
