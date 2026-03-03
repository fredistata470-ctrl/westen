// Chapter 7 — "Unbelievable"
// Source: dialogue_storymode

var chapter7Scene = createDialogueScene({
    id: "chapter_7_scene",
    background: "stadium",
    chapterTitle: "Chapter 7: Unbelievable",
    dialogue: [
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Match vs Silverton. Westward wins. Recognition grows." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Team Offices. Otto is called in." },
        { speaker: "Otto",        emotion: "curious",    text: "Did I do something wrong?" },
        { speaker: "Manager",     emotion: "neutral",    text: "No. Someone asked about you." },
        { speaker: "Otto",        emotion: "curious",    text: "...About me?" },
        { speaker: "Manager",     emotion: "neutral",    text: "Government registry. Courting request." },
        { speaker: "Otto",        emotion: "curious",    text: "You sure they didn't put the wrong name?" },
        { speaker: "Otto",        emotion: "neutral",    text: "I've had one girlfriend. Ever. Until I was twenty." },
        { speaker: "Otto",        emotion: "neutral",    text: "...Why would anyone notice me?" },
        { speaker: "Manager",     emotion: "neutral",    text: "Do you want to meet them?" },
        { speaker: "Otto",        emotion: "neutral",    text: "...Yeah. I'll meet her." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Lottery Courting Building." },
        { speaker: "Otto",        emotion: "neutral",    text: "Hi. I'm Otto Herrera. Nice to meet you." },
        { speaker: "Mei Ling",    emotion: "neutral",    text: "Otto. Yes. I've seen your name on the registry." },
        { speaker: "Otto",        emotion: "neutral",    text: "I was told I was, uh… requested." },
        { speaker: "Mei Ling",    emotion: "neutral",    text: "You're doing fine. Herrera… where's that from?" },
        { speaker: "Otto",        emotion: "neutral",    text: "It's from a Latin country." },
        { speaker: "Mei Ling",    emotion: "neutral",    text: "You have a 78% pass completion rate." },
        { speaker: "Otto",        emotion: "curious",    text: "You keep up with stats?" },
        { speaker: "Mei Ling",    emotion: "neutral",    text: "I keep up with you." },
        { speaker: "Otto",        emotion: "curious",    text: "Do you like to read?" },
        { speaker: "Mei Ling",    emotion: "neutral",    text: "The Art of War. And… Harry Potter." },
        { speaker: "Otto",        emotion: "neutral",    text: "I like to make music. And make stories in my head." },
        { speaker: "Mei Ling",    emotion: "curious",    text: "Why don't you write a book?" },
        { speaker: "Otto",        emotion: "neutral",    text: "I'm not that creative." },
        { speaker: "Mei Ling",    emotion: "happy",      text: "I think you are." },
        { speaker: "Otto",        emotion: "neutral",    text: "A friend who thinks you have really nice hair.",
          choices: [
              { text: "Playful: A friend who thinks you have really nice hair.", next: "chapter_7_playful" },
              { text: "Genuine: I'm glad. I don't have many friends.", next: "chapter_7_genuine" }
          ]
        },
        { speaker: "Narrator",    emotion: "neutral",    text: "Mei Ling smiles. The meeting draws to a close, but something has started." }
    ],
    next: "chapter_8_scene"
});
