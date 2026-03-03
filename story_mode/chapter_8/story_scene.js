// Chapter 8 — "Clay and Fire"
// Source: dialogue_storymode

var chapter8Scene = createDialogueScene({
    id: "chapter_8_scene",
    background: "hotel_room",
    chapterTitle: "Chapter 8: Clay and Fire",
    dialogue: [
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Hotel Room. Night. Otto is alone in his hotel room after the match. His phone vibrates. Payment received: League payment 2000 + match bonus 500 = 2500 Weston Dollars." },
        { speaker: "Otto",        emotion: "happy",      text: "Finally." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Otto considers how to allocate the money.",
          choices: [
              { text: "Send most to family (2000)", next: "chapter_8_send_most" },
              { text: "Send half (1250)", next: "chapter_8_send_half" },
              { text: "Keep most (keep 2000)", next: "chapter_8_keep_most" }
          ]
        },
        { speaker: "Otto",        emotion: "neutral",    text: "Hey. I'm about to send you some money. Does your wire transfer app still work?" },
        { speaker: "Rebecca",     emotion: "curious",    text: "Yeah. How much you gonna send?" },
        { speaker: "Otto",        emotion: "neutral",    text: "Enough to buy some beef." },
        { speaker: "Rebecca",     emotion: "happy",      text: "Really? Don't play with me." },
        { speaker: "Otto",        emotion: "neutral",    text: "I'm serious. Go buy food for the house." },
        { speaker: "Rebecca",     emotion: "happy",      text: "…Thanks, bro. I love you." },
        { speaker: "Rebecca",     emotion: "happy",      text: "We're gonna have meat tomorrow. Thank you again. Elizabeth says to stop shooting with the knuckleball. Shoot normally because you suck at the knuckleball." },
        { speaker: "Narrator",    emotion: "neutral",    text: "If Otto kept most of the money: He heads to a bar where Olivia is waiting." },
        { speaker: "Olivia",      emotion: "neutral",    text: "Otto. You played well today." },
        { speaker: "Otto",        emotion: "neutral",    text: "Thanks. You watched?" },
        { speaker: "Olivia",      emotion: "neutral",    text: "Caught the highlights. Is it just me, or do you look… stronger?" },
        { speaker: "Otto",        emotion: "curious",    text: "What do you mean? Is that good or bad?" },
        { speaker: "Olivia",      emotion: "neutral",    text: "Good, obviously. You carry yourself differently now. Like you know people are watching." },
        { speaker: "Olivia",      emotion: "neutral",    text: "So. What did you want to talk about?" },
        { speaker: "Otto",        emotion: "neutral",    text: "I just wanted to get to know you more..." },
        { speaker: "Olivia",      emotion: "serious",    text: "Only a certain amount of people really have the power in Weston. And they're lying. But… they give us a good life." },
        { speaker: "Olivia",      emotion: "sad",        text: "My dad… he's getting sad. Regretting his decisions in life." },
        { speaker: "Olivia",      emotion: "neutral",    text: "Unless I really trust you." },
        { speaker: "Olivia",      emotion: "neutral",    text: "Anyway. Change the subject. Are you gonna drink or what?" },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Bus Attack. Outside Stadium / Team Bus." },
        { speaker: "Teammate 1",  emotion: "curious",    text: "What's going on out there?" },
        { speaker: "Crowd",       emotion: "angry",      text: "CHESTERBURG IS CORRUPT! WE STARVE WHILE THEY GAMBLE!" },
        { speaker: "Teammate 2",  emotion: "serious",    text: "This doesn't feel like football." },
        { speaker: "Otto",        emotion: "serious",    text: "It isn't." },
        { speaker: "Driver",      emotion: "angry",      text: "I'M HIT!" },
        { speaker: "Coach Baker", emotion: "serious",    text: "EVERYBODY DOWN!" },
        { speaker: "Teammate 3",  emotion: "angry",      text: "I'M BLEEDING! THERE'S BLOOD!" },
        { speaker: "Narrator",    emotion: "neutral",    text: "Otto reacts.",
          choices: [
              { text: "Protect teammates", next: "chapter_8_protect" },
              { text: "Yell back: STOP ACTING LIKE ANIMALS! WE'RE NOT YOUR ENEMY!", next: "chapter_8_yell" },
              { text: "Fight", next: "chapter_8_fight" }
          ]
        },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: After Incident. Jenny calls." },
        { speaker: "Jenny",       emotion: "serious",    text: "Are you okay? I saw the footage." },
        { speaker: "Otto",        emotion: "neutral",    text: "Yeah. We're safe." },
        { speaker: "Jenny",       emotion: "neutral",    text: "I happen to be in town." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Otto responds.",
          choices: [
              { text: "I'll call you when I know more.", next: "chapter_8_neutral" },
              { text: "Meet me if you can. I don't want to be alone.", next: "chapter_8_meet_jenny" },
              { text: "It's not safe. Stay away.", next: "chapter_8_protective" }
          ]
        },
        { speaker: "Otto",        emotion: "neutral",    text: "Meet me if you can. I don't want to be alone." },
        { speaker: "Narrator",    emotion: "neutral",    text: "Scene change: Meeting Jenny. Closed cafe." },
        { speaker: "Jenny",       emotion: "neutral",    text: "You look exhausted." },
        { speaker: "Otto",        emotion: "neutral",    text: "Long night." },
        { speaker: "Jenny",       emotion: "neutral",    text: "My boss is asking about you." },
        { speaker: "Otto",        emotion: "neutral",    text: "He wants to meet me? I'm boring." },
        { speaker: "Jenny",       emotion: "neutral",    text: "But you're different." },
        { speaker: "Otto",        emotion: "curious",    text: "Is that good?" },
        { speaker: "Jenny",       emotion: "neutral",    text: "You're just lucky that you're kind of cute. In an ugly way." },
        { speaker: "Otto",        emotion: "neutral",    text: "I don't know how to take that, but I'll take my chances." },
        { speaker: "Jenny",       emotion: "neutral",    text: "Next home game, my boss will be at the stadium." },
        { speaker: "Otto",        emotion: "neutral",    text: "Can I take your word for it?" },
        { speaker: "Jenny",       emotion: "neutral",    text: "I know where you live." },
        { speaker: "Otto",        emotion: "curious",    text: "Can I know where you live?" },
        { speaker: "Jenny",       emotion: "neutral",    text: "Soon. Maybe you'll be more familiar with my house from the inside than the out." },
        { speaker: "Otto",        emotion: "curious",    text: "Huh?" },
        { speaker: "Jenny",       emotion: "neutral",    text: "Nothing. So, what are you gonna order?" }
    ],
    next: "chapter_9_scene"
});
