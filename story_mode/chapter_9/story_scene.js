// Chapter 9 — "Say It Loud, Or Say It Sideways"
// Source: dialogue_storymode

var chapter9Scene = createDialogueScene({
    id: "chapter_9_scene",
    background: "westward_stadium",
    chapterTitle: "Chapter 9: Say It Loud, Or Say It Sideways",
    dialogue: [
        { speaker: "Narrator",      emotion: "neutral",    text: "Scene change: Match Day. Westward Stadium. Night vs Meadowvale. The crowd is tense — louder than usual, restless." },
        { speaker: "Commentator",   emotion: "neutral",    text: "Westward pushing again — Otto Herrera cooking into the game. Westward wins!" },
        { speaker: "Narrator",      emotion: "neutral",    text: "Post-match interview." },
        { speaker: "Reporter",      emotion: "neutral",    text: "Otto Herrera — another decisive goal. People are calling you the heartbeat of Westward." },
        { speaker: "Otto",          emotion: "neutral",    text: "I just do my job." },
        { speaker: "Reporter",      emotion: "neutral",    text: "The country's watching football closely right now. Any message to the fans?" },
        { speaker: "Otto",          emotion: "neutral",    text: "Football brings people together. That's all I'll say." }
    ],
    next: "chapter_10_scene"
});
