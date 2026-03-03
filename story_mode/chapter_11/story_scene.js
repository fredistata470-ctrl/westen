// Chapter 11 — "When The Crowd Speaks"
// Source: dialogue_storymode

var chapter11Scene = createDialogueScene({
    id: "chapter_11_scene",
    background: "saltreach_stadium",
    chapterTitle: "Chapter 11: When The Crowd Speaks",
    dialogue: [
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Saltreach Tideglass Stadium. Away vs Southgate. Attendance: 112,000. The ocean wind carries sound farther." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Banners ripple in the upper decks before kickoff — hand-painted, uneven: PAY THE WORKERS. WE ARE NOT TERRORISTS. LET US LIVE." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Security pretends not to see them. Otto does." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: The Game." },
        { speaker: "Commentator", emotion: "neutral",    text: "Westward looks calm. Too calm." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Otto drops deep. Tracks back. Wins a tackle he shouldn't. Second half — a break. A run through the channel. He scores. Westward wins." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Presidential Address." },
        { speaker: "President",   emotion: "serious",    text: "We will not allow disorder disguised as concern. These gatherings are not protests — they are disruptions orchestrated by rebels who seek to tear down the very foundations of our society." },
        { speaker: "President",   emotion: "serious",    text: "Those who incite unrest will be held accountable. Arrests. Fines. Loss of privileges. We act only in the best interest of the country." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Mei Ling — Email and Call." },
        { speaker: "Otto",        emotion: "curious",    text: "…Paid?" },
        { speaker: "Mei Ling",    emotion: "neutral",    text: "My dad sent you everything. I'm sorry it's so… official." },
        { speaker: "Otto",        emotion: "neutral",    text: "You don't have to pay me. If I ever married you, it'd be because I like you." },
        { speaker: "Mei Ling",    emotion: "happy",      text: "That's… surprisingly sweet." },
        { speaker: "Otto",        emotion: "neutral",    text: "There's just a lot happening right now. Can I have a little time?" },
        { speaker: "Mei Ling",    emotion: "neutral",    text: "Of course. And… maybe when I'm back in Westward, we go on a real date?" },
        { speaker: "Otto",        emotion: "happy",      text: "I'd like that." }
    ],
    next: "chapter_12"
});
