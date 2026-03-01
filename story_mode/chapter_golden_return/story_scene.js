// Chapter: The Golden Return
// Source: dialogue_storymode

var chapterGoldenReturnScene = createDialogueScene({
    id: "chapter_golden_return",
    background: "sports_broadcast_studio",
    chapterTitle: "The Golden Return",
    dialogue: [
        { speaker: "Narrator",   emotion: "neutral", text: "Scene change: Sports Broadcast Studio. Night. Bright lights. Polished desk. A massive screen behind the anchors shows highlights from last season — confetti, trophies, heartbreak." },
        { speaker: "Anchor",     emotion: "neutral", text: "And with the new season underway, one name keeps dominating the conversation." },
        { speaker: "Narrator",   emotion: "neutral", text: "The screen cuts to Quinn Lopez." },
        { speaker: "Morgan",     emotion: "neutral", text: "You didn't try very hard." },
        { speaker: "Quinn",      emotion: "neutral", text: "Fair." },
        { speaker: "Morgan",     emotion: "neutral", text: "People talk about you like you're a savior." },
        { speaker: "Quinn",      emotion: "serious", text: "That's dangerous." },
        { speaker: "Morgan",     emotion: "curious", text: "Why come back, really?" },
        { speaker: "Quinn",      emotion: "serious", text: "Because winning somewhere else didn't feel like winning." },
        { speaker: "Quinn",      emotion: "serious", text: "And because this city doesn't get second chances." },
        { speaker: "Morgan",     emotion: "neutral", text: "Careful. That kind of thinking makes people follow you." },
        { speaker: "Quinn",      emotion: "neutral", text: "I'm counting on it." },
        { speaker: "Narrator",   emotion: "neutral", text: "Their eyes linger a second too long." }
    ],
    next: "chapter_they_say_it_out_loud"
});
