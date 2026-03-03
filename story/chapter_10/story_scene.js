// Chapter 10 — "The Things They Don't Say Out Loud"
// Source: dialogue_storymode

var chapter10Scene = createDialogueScene({
    id: "chapter_10_scene",
    background: "media_room",
    chapterTitle: "Chapter 10: The Things They Don't Say Out Loud",
    dialogue: [
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Pre-Game Interview. Media Room. Away vs Eastvale." },
        { speaker: "Reporter 1",  emotion: "neutral",    text: "Otto Herrera, Westward keeps winning under pressure. What do you think that says about the country right now?" },
        { speaker: "Otto",        emotion: "neutral",    text: "I think people respect effort. They respect anyone who keeps showing up — even when it's hard." },
        { speaker: "Reporter 2",  emotion: "neutral",    text: "Some fans are saying football is becoming political. Do you agree?" },
        { speaker: "Otto",        emotion: "neutral",    text: "Football reflects people. That's all I'll say." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: The Game. Crowd noise fades into abstraction. Otto presses. Otto assists or scores. Westward wins." },
        { speaker: "Reporter",    emotion: "neutral",    text: "Another away win. How do you keep your focus with everything happening?" },
        { speaker: "Otto",        emotion: "neutral",    text: "You focus on the next pass. If you think too far ahead, you trip." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Afternoon. Away city. Old apartment building. Otto helps Olivia move." },
        { speaker: "Otto",        emotion: "curious",    text: "Why are you moving? This apartment is sick!" },
        { speaker: "Olivia",      emotion: "neutral",    text: "My mom is sick and I need to be closer to her. I'm helping her while my dad has to travel around the country. Anyways, I swear these were lighter yesterday." },
        { speaker: "Otto",        emotion: "neutral",    text: "Everything gets heavier when you're tired." },
        { speaker: "Olivia",      emotion: "neutral",    text: "You offering wisdom now?" },
        { speaker: "Otto",        emotion: "neutral",    text: "Only when I'm lifting furniture." },
        { speaker: "Olivia",      emotion: "happy",      text: "I owe you big time. Thanks for helping me move." },
        { speaker: "Otto",        emotion: "neutral",    text: "You already paid me." },
        { speaker: "Olivia",      emotion: "neutral",    text: "No. I mean properly." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Street Food. Neon lights." },
        { speaker: "Olivia",      emotion: "neutral",    text: "People think I'm shallow." },
        { speaker: "Otto",        emotion: "curious",    text: "Are you?" },
        { speaker: "Olivia",      emotion: "neutral",    text: "Only when I'm bored." },
        { speaker: "Otto",        emotion: "neutral",    text: "Then I'll try not to bore you." },
        { speaker: "Olivia",      emotion: "happy",      text: "Good. Because I like you when you're not trying." },
        { speaker: "Olivia",      emotion: "neutral",    text: "This is for you." },
        { speaker: "Otto",        emotion: "curious",    text: "What is it?" },
        { speaker: "Olivia",      emotion: "neutral",    text: "A drum. Handmade. Chesterburg style." },
        { speaker: "Otto",        emotion: "curious",    text: "Why a drum?" },
        { speaker: "Olivia",      emotion: "neutral",    text: "Because drums don't lie. And they're impossible to ignore. So answer me please — do you know anything about the bombings?" },
        { speaker: "Otto",        emotion: "neutral",    text: "Olivia, let's not talk about that stuff. And no, I don't. I'm clueless like you. And I'm in the know." }
    ],
    next: "chapter_11_scene"
});
