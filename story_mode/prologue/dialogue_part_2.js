// Prologue — Part 2: First Meeting
// Drop additional dialogue lines into the dialogue array without breaking the engine.

var prologuePart2 = createDialogueScene({
    id: "prologue_02",
    background: "academy_entrance",
    dialogue: [
        { speaker: "Player", emotion: "determined", text: "We won't disappoint you, Coach." },
        { speaker: "Zhao",   emotion: "confident",  text: "Speak for yourself. I'm here to win." },
        { speaker: "Coach",  emotion: "amused",     text: "Good. A little fire never hurt anyone. Now — let's get to work." }
    ]
});
