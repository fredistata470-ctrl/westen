// Chapter 13
// Source: dialogue_storymode

var chapter13Scene = createDialogueScene({
    id: "chapter_13",
    background: "stadium",
    chapterTitle: "Chapter 13",
    dialogue: [
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Pre-Game Interview (vs Northfield Away). Under the harsh stadium lights. Otto stands in front of a microphone. The interviewer's voice echoes across the stadium." },
        { speaker: "Interviewer",     emotion: "neutral",    text: "Otto, tonight's match against Northfield is more than just a game. You're in their city, facing Quinn Lopez's team. What's your message to them?" },
        { speaker: "Narrator",        emotion: "neutral",    text: "Otto hesitates, then speaks with quiet resolve." },
        { speaker: "Otto",            emotion: "serious",    text: "They can say what they want. But we're here to play. And we're here to win. No matter what they throw at us." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: The Match Begins. The game kicks off. The atmosphere is tense. Northfield is confident." },
        { speaker: "Morgan",          emotion: "serious",    text: "I'm not going to let you keep that. Or the money. Her father owes Quinn's parents. If you throw this game, maybe things get easier for you." },
        { speaker: "Otto",            emotion: "serious",    text: "Leave me alone." },
        { speaker: "Morgan",          emotion: "serious",    text: "F*ck off, Otto. You were a dweeb then, and you're still a loser now. No personality. Still going to be poor." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Otto's face darkens." },
        { speaker: "Otto",            emotion: "angry",      text: "F*ck off. You're a trashy liar." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Morgan's eyes widen in shock. Before she can respond, a security guard steps between them." },
        { speaker: "Security Guard",  emotion: "serious",    text: "Enough! Break it up!" },
        { speaker: "Narrator",        emotion: "neutral",    text: "He separates Otto and Morgan, escorting her away." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: The Game. The whistle blows. Otto's team looks focused. Otto is tense, knowing the stakes.",
          choices: [{ text: "Win the game", next: "ch13_win" }] },
        { speaker: "Narrator",        emotion: "neutral",    text: "Otto plays his best. The team fights hard, and they win. The crowd roars. Otto's side celebrates." },
        { speaker: "Otto",            emotion: "determined", text: "This is what we fight for. No matter what they say, we're strong. We're Westward." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Post-Match Interview." },
        { speaker: "Reporter",        emotion: "neutral",    text: "Otto, tough game tonight. Some are saying Northfield's players were overly aggressive. How do you respond?",
          choices: [{ text: "Defiant", next: "ch13_defiant" }] },
        { speaker: "Otto",            emotion: "serious",    text: "People talk crap about us, but we're a strong team. We fight hard. We've got heart." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Morgan and Quinn's Dad. Later that night, in a luxury suite overlooking the stadium. Morgan approaches Quinn's father, a stern-looking man in a tailored suit." },
        { speaker: "Morgan",          emotion: "neutral",    text: "It's okay, Quinn. You'll get them next time. They just got lucky." },
        { speaker: "Narrator",        emotion: "neutral",    text: "She turns to Quinn's dad and hands him a small flash drive." },
        { speaker: "Quinn's Dad",     emotion: "neutral",    text: "What is this?" },
        { speaker: "Morgan",          emotion: "serious",    text: "I spoke with Otto. I recorded it. We're going to need this later on." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Quinn's dad takes it. He scrolls through old photos: warehouse shifts, team lunches, people now labeled 'agitators.' A final news alert appears: WESTWARD UNDER TEMPORARY SECURITY OVERSIGHT." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Otto locks his phone. For the first time since joining Westward FC — football doesn't feel like an escape anymore. It feels like a spotlight." }
    ],
    next: "chapter_14"
});
