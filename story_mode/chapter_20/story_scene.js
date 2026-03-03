// Chapter 20 — "Pressure Lines"
// Source: dialogue_storymode

var chapter20Scene = createDialogueScene({
    id: "chapter_20_scene",
    background: "media_studio",
    chapterTitle: "Chapter 20: Pressure Lines",
    dialogue: [
        { speaker: "Narrator",       emotion: "neutral",    text: "Scene change: Media Divide. Headline: HERRERA: HERO OR THREAT?" },
        { speaker: "Panelist 1",     emotion: "neutral",    text: "He's inspiring a generation." },
        { speaker: "Panelist 2",     emotion: "serious",    text: "He's destabilizing a nation." },
        { speaker: "Panelist 3",     emotion: "neutral",    text: "He's just a footballer. Or at least he should be." },
        { speaker: "Narrator",       emotion: "neutral",    text: "Rebellion Route: Graffiti appears — WESTWARD STANDS WITH US. WE RISE for WESTIN. An unknown text: We are watching you now. I told you to fuck off. A black government vehicle is present." },
        { speaker: "Narrator",       emotion: "neutral",    text: "Quiet Route: A private dinner with a donor and political figure. A campaign strategy outline is presented." },
        { speaker: "Narrator",       emotion: "neutral",    text: "Scene change: High-Stakes Match. Security doubled. Crowd split. Westward wins narrowly." },
        { speaker: "Narrator",       emotion: "neutral",    text: "Post-game response.",
          choices: [
              { text: "REBELLION route: I play for my team… and for people who feel unheard.", next: "chapter_20_rebellion" },
              { text: "QUIET route: I'm a footballer. I want unity. That's it.", next: "chapter_20_quiet" }
          ]
        },
        { speaker: "Otto",           emotion: "serious",    text: "I play for my team… and for people who feel unheard." },
        { speaker: "Narrator",       emotion: "neutral",    text: "Scene change: Government War Room." },
        { speaker: "Vice President", emotion: "serious",    text: "He's gaining emotional capital." },
        { speaker: "President",      emotion: "serious",    text: "Emotion fades." },
        { speaker: "Vice President", emotion: "serious",    text: "Not this kind." },
        { speaker: "President",      emotion: "serious",    text: "Then we accelerate." },
        { speaker: "President",      emotion: "serious",    text: "And prepare the narrative." },
        { speaker: "Narrator",       emotion: "neutral",    text: "Government escalation phase 2 begins. Pressure is building. The divide is intensifying. A tragedy is imminent." }
    ],
    next: "chapter_21_scene"
});
