// Chapter 1 — First Days
// Drop additional dialogue lines into the dialogue array without breaking the engine.

var chapter1Scene = createDialogueScene({
    id: "chapter_1_scene",
    background: "training_pitch",
    dialogue: [
        { speaker: "Narrator", emotion: "neutral",   text: "Chapter 1 — First Days" },
        { speaker: "Coach",    emotion: "serious",   text: "Before we talk tactics, you need to understand one thing: this is a team sport." },
        { speaker: "Zhao",     emotion: "confident", text: "I know how to play a team sport." },
        { speaker: "Coach",    emotion: "serious",   text: "Do you? Because the scouts tell me you took 14 shots last match and passed zero times." },
        { speaker: "Zhao",     emotion: "neutral",   text: "... They went in, didn't they?" },
        { speaker: "Coach",    emotion: "serious",   text: "Two of them did. Your teammates were open six more times. Learn to read the field." },
        { speaker: "Player",   emotion: "curious",   text: "Coach — what's the plan for the upcoming qualifier?" },
        { speaker: "Coach",    emotion: "neutral",   text: "That's what we're here to figure out. Get some rest. Tomorrow it gets real." }
    ]
});
