// Chapter 15 — "Visibility"
// Source: dialogue_storymode

var chapter15Scene = createDialogueScene({
    id: "chapter_15_scene",
    background: "training_tunnel",
    chapterTitle: "Chapter 15: Visibility",
    dialogue: [
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Pre-Game Pressure. Training Tunnel. Pine City Match." },
        { speaker: "Coach Baker",     emotion: "serious",    text: "No statements. No gestures. No heroics." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: The Game. Banners appear in the second half. Not slogans. Just names. Cities. Factories. Dates. The referee pauses the match. Police remove flares. The game resumes. Westward wins again." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Locker Room Silence. No music. No shouting." },
        { speaker: "Teammate",        emotion: "sad",        text: "My cousin's in one of those towns." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Nobody responds." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Rebecca's Panic Call. Training Center Locker Room." },
        { speaker: "Otto",            emotion: "serious",    text: "Rebecca? What's wrong?" },
        { speaker: "Rebecca",         emotion: "serious",    text: "Otto… they're taking students. The police came and took students from the school. They rounded us up. They stormed every classroom and they rounded us up into the auditorium." },
        { speaker: "Rebecca",         emotion: "serious",    text: "They're beating up the kids, Otto. Some of them are bleeding. They're grabbing them by their arms, dragging them out. They're putting them in trucks. I saw Leo get hit in the face with a baton. He's not moving." },
        { speaker: "Otto",            emotion: "serious",    text: "What? Where's Elizabeth?" },
        { speaker: "Rebecca",         emotion: "serious",    text: "I don't know. I haven't seen her. They separated us by grade. I'm in the auditorium with the freshmen. She's a senior — they took them somewhere else. I heard screaming from the hallway." },
        { speaker: "Otto",            emotion: "serious",    text: "Keep texting me. Stay in the auditorium. Don't move. I'm gonna see what I can do." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Coach Baker and Manager Pete." },
        { speaker: "Otto",            emotion: "serious",    text: "Coach, something's happening at the school. They're taking students. My sister — they're beating them. Putting them in trucks." },
        { speaker: "Coach Baker",     emotion: "serious",    text: "I just got notified. Police are sweeping the district. They're calling it a 'security sweep.' They're detaining anyone with suspected rebel ties — including family members of known dissenters." },
        { speaker: "Otto",            emotion: "serious",    text: "I have to go. I have to make sure she's okay." },
        { speaker: "Coach Baker",     emotion: "serious",    text: "I understand, but you need to stay here. There are police all over the training center. I don't know if they'll let you leave." },
        { speaker: "Manager Pete",    emotion: "serious",    text: "Otto, I've heard. But if you leave now, you risk being detained. The team can't afford to lose you before the next match." },
        { speaker: "Otto",            emotion: "serious",    text: "She's my sister." },
        { speaker: "Manager Pete",    emotion: "serious",    text: "I'll make some calls. See if I can get clearance. But if I say no, you stay. Understood?" },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Olivia. Rebel network connection revealed. Escape plan discussed." },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Jenny choice. Otto faces a decision about what Jenny asks of him regarding Morgan.",
          choices: [
              { text: "Gather dirt on Morgan (accept)", next: "chapter_15_gather_dirt" },
              { text: "Refuse and warn Morgan", next: "chapter_15_refuse_warn" }
          ]
        },
        { speaker: "Narrator",        emotion: "neutral",    text: "Scene change: Yumi. Arsenal unlocked. Old man contact made." }
    ],
    next: "chapter_16_scene"
});
