// Prologue — Part 1: City and Academy Introduction
// Drop additional dialogue lines into the dialogue array without breaking the engine.

var prologuePart1 = createDialogueScene({
    id: "prologue_01",
    background: "city_street",
    chapterTitle: "Prologue",
    dialogue: [
        { speaker: "Narrator", emotion: "neutral", text: "Somewhere in the city of Westen, a dream is about to begin..." },
        { speaker: "Narrator", emotion: "neutral", text: "Two young players — rivals since childhood — are called to the same academy." },
        { speaker: "Coach",    emotion: "serious", text: "Welcome to the Westen Champions League Academy. I'm Coach Rivera." },
        { speaker: "Coach",    emotion: "serious", text: "You've been selected because we see something special in you. Don't waste it." }
    ]
});
