// Chapter 19 — "The Signal"
// Source: dialogue_storymode

var chapter19Scene = createDialogueScene({
    id: "chapter_19_scene",
    background: "underground_safe_house",
    chapterTitle: "Chapter 19: The Signal",
    dialogue: [
        { speaker: "Narrator",   emotion: "neutral",    text: "Scene change: Underground Safe House. Rebellion broadcast." },
        { speaker: "Yumi",       emotion: "serious",    text: "When the river runs backward and the clocks refuse to speak, ask not who silenced them — ask who feared the sound." },
        { speaker: "Yumi",       emotion: "serious",    text: "They call this stability. We call it occupation." },
        { speaker: "Narrator",   emotion: "neutral",    text: "Visual flashes: Documents. Names. Accounts. Orders." },
        { speaker: "Narrator",   emotion: "neutral",    text: "A riddle embedded in the broadcast: What breaks without falling? What burns without heat? The answer: Trust." },
        { speaker: "Narrator",   emotion: "neutral",    text: "The rebellion signal has been sent." },
        { speaker: "Narrator",   emotion: "neutral",    text: "Scene change: Yumi phone call." },
        { speaker: "Yumi",       emotion: "serious",    text: "If you see this… It means we bought ourselves seconds, not safety." },
        { speaker: "Yumi",       emotion: "serious",    text: "They're moving. I don't know who sold us out." },
        { speaker: "Narrator",   emotion: "neutral",    text: "Scene change: Match result. Westward wins late. Crowd chanting warnings." },
        { speaker: "Narrator",   emotion: "neutral",    text: "Post-game interview.",
          choices: [
              { text: "Everyone should think before they speak.", next: "chapter_19_cautious" },
              { text: "People listen when they want to hear.", next: "chapter_19_neutral" },
              { text: "Silence is still a message.", next: "chapter_19_provocative" }
          ]
        },
        { speaker: "Interviewer", emotion: "neutral",   text: "Do you think athletes should speak on what's happening?" },
        { speaker: "Otto",       emotion: "neutral",    text: "Silence is still a message." }
    ],
    next: "chapter_20_scene"
});
