// Prologue — Part 2: Otto's Origin
// Source: story lines part 1.pdf — "PROLOGUE – PART 2" section
// Drop additional dialogue lines into the dialogue array without breaking the engine.

var prologuePart2 = createDialogueScene({
    id: "prologue_02",
    background: "dark_room",
    chapterTitle: "Prologue – Part 2",
    dialogue: [
        { speaker: "Narrator",  emotion: "neutral",    text: "Pitch black screen. No visuals. Only text bubbles and sound." },
        { speaker: "Unknown",   emotion: "serious",    text: "Otto… are you okay?" },
        { speaker: "Narrator",  emotion: "neutral",    text: "Distant engines. Boots on pavement." },
        { speaker: "Unknown",   emotion: "serious",    text: "I have to leave." },
        { speaker: "Unknown",   emotion: "serious",    text: "Mom will be back in an hour or two. You stay here." },
        { speaker: "Unknown",   emotion: "serious",    text: "I never scanned my ID when I turned twenty-one." },
        { speaker: "Unknown",   emotion: "serious",    text: "They don't know where I am. They can't track me." },
        { speaker: "Unknown",   emotion: "serious",    text: "They're drafting everyone." },
        { speaker: "Unknown",   emotion: "sad",        text: "I can't go to war." },
        { speaker: "Unknown",   emotion: "serious",    text: "If they catch me, I'm gone." },
        { speaker: "Unknown",   emotion: "serious",    text: "You're the oldest now." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Engines roar closer." },
        { speaker: "Unknown",   emotion: "serious",    text: "Protect them." },
        { speaker: "Narrator",  emotion: "neutral",    text: "A massive explosion. Cut to black." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Soldiers storm the town. Gunfire. People running. A woman falls. Silence." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Early morning. An elderly man stands at Otto's door. He looks broken. Otto listens. His face changes." },
        { speaker: "Otto",      emotion: "sad",        text: "Mom… isn't coming back." },
        { speaker: "Otto",      emotion: "sad",        text: "He… went away as well." },
        { speaker: "Otto",      emotion: "serious",    text: "But I'm here." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Cut to black. Eight years later." }
    ],
    next: "chapter_01"
});
