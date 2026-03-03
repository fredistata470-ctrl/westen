// Chapter 6 — "A Hundred Thousand Eyes"
// Source: dialogue_storymode

var chapter6Scene = createDialogueScene({
    id: "chapter_6_scene",
    background: "ironcrown_stadium",
    chapterTitle: "Chapter 6: A Hundred Thousand Eyes",
    dialogue: [
        { speaker: "Narrator",     emotion: "neutral",    text: "Scene change: Ironcrown Stadium vs Northfield (Draka). Attendance: 100,000. The noise is physical. It presses against Otto's chest like weight. Westward stands in the tunnel, dwarfed. Their opponent: Ironclad FC — last year's finalists. They don't rush. They don't panic. They suffocate you." },
        { speaker: "Coach Baker",  emotion: "serious",    text: "Otto. Warm up." },
        { speaker: "Narrator",     emotion: "neutral",    text: "Minute 82. One broken press. Otto cuts inside. He shoots. Westward scores. Westward wins — Northfield loses." },
        { speaker: "Narrator",     emotion: "neutral",    text: "Scene change: Stadium Stage. MVP Ceremony." },
        { speaker: "Ashley",       emotion: "neutral",    text: "Otto Herrera. Match MVP." },
        { speaker: "Otto",         emotion: "neutral",    text: "...Thank you." },
        { speaker: "Ashley",       emotion: "neutral",    text: "Not bad for a depth player." },
        { speaker: "Otto",         emotion: "curious",    text: "You watched?" },
        { speaker: "Ashley",       emotion: "neutral",    text: "I was forced to. It's my job." },
        { speaker: "Narrator",     emotion: "neutral",    text: "Scene change: Government Administrative Complex. Formal Introduction. Otto opens the folder. Inside are not just league profiles, but surveillance notes, financial records of team sponsors, and a highlighted section about 'narrative influence.' At the bottom of the last page, a handwritten note: 'Your insulin shipments have been flagged for review. — A'" },
        { speaker: "Rebecca (text)", emotion: "neutral",  text: "Someone from the school board came by today. Asked about you. They were… polite. But it felt wrong." },
        { speaker: "Narrator",     emotion: "neutral",    text: "Otto stares at the note, then at the door Ashley left through.",
          choices: [{ text: "Confront Ashley directly", next: "chapter_6_confront" }] },
        { speaker: "Otto",         emotion: "serious",    text: "Was this a threat or a warning?" },
        { speaker: "Ashley",       emotion: "neutral",    text: "It's data. What you do with it determines the category." },
        { speaker: "Otto",         emotion: "serious",    text: "Why is my insulin being flagged? I need that." },
        { speaker: "Ashley",       emotion: "neutral",    text: "It's a precaution. Standard for players under increased scrutiny." },
        { speaker: "Otto",         emotion: "serious",    text: "Is my family in danger?" },
        { speaker: "Ashley",       emotion: "neutral",    text: "They're testing your loyalty. Your sister is safe for now." },
        { speaker: "Narrator",     emotion: "neutral",    text: "Scene change: Government office. A colleague approaches a father figure." },
        { speaker: "Colleague",    emotion: "neutral",    text: "Have you looked at the bottom teams?" },
        { speaker: "Father",       emotion: "neutral",    text: "The bottom teams?" },
        { speaker: "Colleague",    emotion: "neutral",    text: "Westward." },
        { speaker: "Father",       emotion: "neutral",    text: "The wasteland?" },
        { speaker: "Colleague",    emotion: "neutral",    text: "They're winning. People like winners." },
        { speaker: "Narrator",     emotion: "neutral",    text: "Father submits inquiries for Otto Herrera and another Westward player." }
    ],
    next: "chapter_7_scene"
});
