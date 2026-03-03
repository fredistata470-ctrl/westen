// Chapter 18 — "League Table"
// Source: dialogue_storymode

var chapter18Scene = createDialogueScene({
    id: "chapter_18_scene",
    background: "government_building",
    chapterTitle: "Chapter 18: League Table",
    dialogue: [
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Nationwide Broadcast. Government announcement." },
        { speaker: "President",   emotion: "serious",    text: "Extremist elements are using sports figures to destabilize our nation. Don't be fooled!" },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Private Event. Finance District. Olivia watches the broadcast." },
        { speaker: "Olivia",      emotion: "neutral",    text: "Good for him." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Later, alone, she smashes a glass." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: University Office. Yumi." },
        { speaker: "Yumi",        emotion: "sad",        text: "I'm hurt. But that doesn't matter." },
        { speaker: "Otto",        emotion: "neutral",    text: "Yumi—" },
        { speaker: "Yumi",        emotion: "serious",    text: "You chose power. Now use it. Be louder. People are bleeding." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Secure Office. Ashley makes a discovery." },
        { speaker: "Ashley",      emotion: "serious",    text: "Oh God…" },
        { speaker: "Ashley",      emotion: "serious",    text: "Sir. The rebellion isn't just ideology. It's personal." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Capitol Square. Capital Protest. Thousands gather. Government guards hesitate. Some lower their weapons. A commander shouts. Cut to black." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: City Park. Jenny and Otto." },
        { speaker: "Jenny",       emotion: "sad",        text: "I thought I'd be fine. I told myself I would be." },
        { speaker: "Jenny",       emotion: "sad",        text: "Do you remember senior year? Homecoming week?" },
        { speaker: "Jenny",       emotion: "sad",        text: "I almost asked you out. I stood in that hallway for ten minutes just… watching you laugh with everyone else." },
        { speaker: "Jenny",       emotion: "sad",        text: "I decided if you didn't notice me then, you never would." },
        { speaker: "Jenny",       emotion: "neutral",    text: "Turns out I was wrong." },
        { speaker: "Otto",        emotion: "serious",    text: "Jenny… I'm marrying Mei Ling." },
        { speaker: "Jenny",       emotion: "neutral",    text: "I know. And I'm not asking you to choose me." },
        { speaker: "Jenny",       emotion: "neutral",    text: "I just needed you to know that what you meant to me was real. Even if it's too late." },
        { speaker: "Jenny",       emotion: "neutral",    text: "Just promise me something." },
        { speaker: "Otto",        emotion: "curious",    text: "What?" },
        { speaker: "Jenny",       emotion: "serious",    text: "Don't become numb. That's how they win." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Pre-game coach interview." },
        { speaker: "Coach",       emotion: "serious",    text: "Pressure doesn't break players. Avoidance does. Otto's still showing up. That tells me everything." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Match result: WIN. Clinical. Professional. Team morale rises." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Post-game interview.",
          choices: [
              { text: "Some nights are about getting through it.", next: "chapter_18_somber" },
              { text: "Winning doesn't always feel loud.", next: "chapter_18_introspective" },
              { text: "I'll celebrate when the season's done.", next: "chapter_18_focused" }
          ]
        },
        { speaker: "Interviewer", emotion: "neutral",    text: "You didn't celebrate your assists. Why?" },
        { speaker: "Otto",        emotion: "neutral",    text: "Some nights are about getting through it." }
    ],
    next: "chapter_19_scene"
});
