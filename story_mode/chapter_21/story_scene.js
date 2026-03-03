// Chapter 21 — "Cracks in the Foundation"
// Source: dialogue_storymode

var chapter21Scene = createDialogueScene({
    id: "chapter_21_scene",
    background: "otto_apartment",
    chapterTitle: "Chapter 21: Cracks in the Foundation",
    dialogue: [
        { speaker: "Narrator",             emotion: "neutral",    text: "Scene change: Interior. Otto's Apartment. Early morning. Calm." },
        { speaker: "News Anchor",          emotion: "neutral",    text: "Tensions continue to rise following last night's match…" },
        { speaker: "Rebecca",              emotion: "neutral",    text: "They're saying your name again. Does it get annoying now?" },
        { speaker: "Otto",                 emotion: "neutral",    text: "They always are. And the grass is always greener on the other side. Just appreciate what you have always." },
        { speaker: "Rebecca",              emotion: "neutral",    text: "Just promise me something." },
        { speaker: "Otto",                 emotion: "curious",    text: "What?" },
        { speaker: "Rebecca",              emotion: "serious",    text: "Don't let them turn you into something you hate." },
        { speaker: "Otto",                 emotion: "neutral",    text: "Yes ma'am." },
        { speaker: "Narrator",             emotion: "neutral",    text: "This is the last calm moment. The trigger check begins." },
        { speaker: "Narrator",             emotion: "neutral",    text: "If rebellion power is high, government crackdown severe, and rebel exposure is above threshold — the arrest event activates." },
        { speaker: "Narrator",             emotion: "neutral",    text: "Scene change: Exterior. Apartment Building. Night. Black vehicles arrive with no sirens. Doors kicked in. A neighbor films from upstairs." },
        { speaker: "Officer",              emotion: "serious",    text: "Rebecca Herrera. You're under arrest for aiding extremist activity." },
        { speaker: "Rebecca",              emotion: "serious",    text: "I don't know what you're talking about." },
        { speaker: "Rebecca",              emotion: "serious",    text: "Don't stop." },
        { speaker: "Narrator",             emotion: "neutral",    text: "Otto's phone fills with missed calls. Elizabeth texts: 'they took rebecca!!!! Call me !!!' Unknown numbers. A news alert: SISTER OF CONTROVERSIAL PLAYER DETAINED IN COUNTER-TERROR SWEEP." },
        { speaker: "Narrator",             emotion: "neutral",    text: "Scene change: Emotional Aftermath. Interior. Locker room. Otto freezes. World goes silent." },
        { speaker: "Narrator",             emotion: "neutral",    text: "Rebellion route: Rebellion power surges. Public support rises. Quiet route: Government pressure surges. Internal conflict intensifies." },
        { speaker: "Narrator",             emotion: "neutral",    text: "Scene change: Interior. Government Briefing Room." },
        { speaker: "Government Spokesperson", emotion: "serious", text: "This detention is part of an ongoing investigation into extremist facilitation networks." },
        { speaker: "Narrator",             emotion: "neutral",    text: "Media headlines flash: 'ATHLETE'S FAMILY LINKED TO RADICAL CELLS?' — 'IS OTTO HERRERA A SYMBOL OR A LIABILITY?'" },
        { speaker: "Narrator",             emotion: "neutral",    text: "The public divide deepens. Government escalation phase 3 is now active. Everything personal is now on the line." }
    ],
    next: "chapter_22"
});
