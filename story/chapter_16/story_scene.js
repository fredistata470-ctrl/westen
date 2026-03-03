// Chapter 16 — Route Decision
// Source: dialogue_storymode

var chapter16Scene = createDialogueScene({
    id: "chapter_16_scene",
    background: "stadium",
    chapterTitle: "Chapter 16: Route Decision",
    dialogue: [
        { speaker: "Narrator",  emotion: "neutral",    text: "A moment of silence mid-game. The crowd falls quiet for a beat. Otto stands on the pitch, the weight of everything pressing in." },
        { speaker: "Narrator",  emotion: "neutral",    text: "A decision point. Two paths forward.",
          choices: [
              { text: "OUTSPOKEN: I won't stay silent while people are hurt.", next: "chapter_16_rebellion" },
              { text: "PRIVATE: Change doesn't come from chaos. It comes from structure.", next: "chapter_16_quiet" }
          ]
        },
        { speaker: "Otto",      emotion: "serious",    text: "I won't stay silent while people are hurt." },
        { speaker: "Narrator",  emotion: "neutral",    text: "The crowd reacts. Otto's stance is set. His route is locked. Public support rises. Government suspicion rises with it." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Or alternatively—" },
        { speaker: "Otto",      emotion: "neutral",    text: "Change doesn't come from chaos. It comes from structure." },
        { speaker: "Narrator",  emotion: "neutral",    text: "Otto keeps his head down. Government pressure eases. But the silence weighs on him." },
        { speaker: "Narrator",  emotion: "neutral",    text: "The match continues. Whatever he chose, there is no going back." }
    ],
    next: "chapter_17_scene"
});
