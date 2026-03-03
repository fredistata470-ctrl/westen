// Chapter 17 — Headlines and Fault Lines
// Source: dialogue_storymode

var chapter17Scene = createDialogueScene({
    id: "chapter_17_scene",
    background: "stadium",
    chapterTitle: "Chapter 17: Headlines and Fault Lines",
    dialogue: [
        { speaker: "Narrator",  emotion: "neutral",    text: "Chapter 17 plays differently depending on who Otto chose in Chapter 16." },
        { speaker: "Narrator",  emotion: "neutral",    text: "If Mei Ling path: A photo leaks. Public sentiment turns volatile. Headlines follow." },
        { speaker: "Narrator",  emotion: "neutral",    text: "If Olivia path: Relationship deepens. Public recognition rises. Family tension intensifies." },
        { speaker: "Narrator",  emotion: "neutral",    text: "If Yumi path: Rebellion support strengthens. Their bond grows louder." },
        { speaker: "Narrator",  emotion: "neutral",    text: "If Ashley or Jenny path: Media attention spikes. Recognition grows." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Scene change: Match vs Riverton. The team's best performance yet." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Team morale rises. Public support rises. But fatigue accumulates. The rivalry with Riverton is now activated." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Scene change: Morgan delivers her final warning." },
        { speaker: "Morgan",    emotion: "serious",    text: "You're running out of time, Otto. Whatever you think you're building — they will knock it down." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Her threat level escalates. Mental stress increases. Otto carries it forward." }
    ],
    next: "chapter_18_scene"
});
