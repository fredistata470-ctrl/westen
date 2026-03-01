// Prologue — Part 2: Otto's Origin
// Source: dialogue_storymode
// Drop additional dialogue lines into the dialogue array without breaking the engine.

var prologuePart2 = createDialogueScene({
    id: "prologue_02",
    background: "dark_room",
    chapterTitle: "Prologue – Part 2",
    dialogue: [
        { speaker: "Narrator", emotion: "neutral", text: "Pitch black screen. No visuals at all. Only text bubbles and sound." },
        { speaker: "Unknown",  emotion: "serious", text: "Otto... are you okay?" },
        { speaker: "Narrator", emotion: "neutral", text: "Distant engines. Boots on pavement." },
        { speaker: "Unknown",  emotion: "serious", text: "I have to leave." },
        { speaker: "Unknown",  emotion: "serious", text: "Mom will be back in an hour or two. You stay here." },
        { speaker: "Unknown",  emotion: "serious", text: "I never scanned my ID when I turned twenty-one." },
        { speaker: "Unknown",  emotion: "serious", text: "They don't know where I am. They can't track me." },
        { speaker: "Narrator", emotion: "neutral", text: "Shouting outside." },
        { speaker: "Unknown",  emotion: "serious", text: "They're drafting everyone." },
        { speaker: "Unknown",  emotion: "sad",     text: "I can't go to war." },
        { speaker: "Unknown",  emotion: "serious", text: "If they catch me, I'm gone." },
        { speaker: "Unknown",  emotion: "serious", text: "You're still underage but..." },
        { speaker: "Unknown",  emotion: "serious", text: "You're the oldest now." },
        { speaker: "Narrator", emotion: "neutral", text: "Engines roar closer." },
        { speaker: "Unknown",  emotion: "serious", text: "Protect them." },
        { speaker: "Narrator", emotion: "neutral", text: "A massive explosion. Cut to black." },
        { speaker: "Narrator", emotion: "neutral", text: "Still mostly black. Brief flashes. Soldiers storm the town. Gunfire. People running. A woman falls. One gunshot. Silence." },
        { speaker: "Narrator", emotion: "neutral", text: "Early morning. Otto's house on the outskirts of town. An elderly man — a grandfather — stands at the door. He looks broken. We don't hear his words. Otto listens. His face changes." },
        { speaker: "Narrator", emotion: "neutral", text: "Inside. Four younger siblings sit on the floor. Otto stands in front of them. He struggles." },
        { speaker: "Otto",     emotion: "sad",     text: "Mom... isn't coming back." },
        { speaker: "Narrator", emotion: "neutral", text: "Silence." },
        { speaker: "Otto",     emotion: "sad",     text: "He... went away as well." },
        { speaker: "Narrator", emotion: "neutral", text: "One child starts to cry." },
        { speaker: "Otto",     emotion: "serious", text: "But I'm here." },
        { speaker: "Narrator", emotion: "neutral", text: "Cut to black. Title card: EIGHT YEARS LATER." }
    ],
    next: "chapter_01"
});
