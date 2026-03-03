// Chapter 3 — Pre-Game
// Includes sideline interview dialogue and match setup data.
// Training mode bypasses this file entirely — startTrainingMode() calls startMatch() directly.

var chapter3PreGameDialogue = createDialogueScene({
    id: "ch3_pregame",
    background: "sideline",
    dialogue: [
        { speaker: "Reporter", emotion: "excited",    text: "We're live on the sideline with Westen FC's rising stars! How are you feeling ahead of today's qualifier?" },
        { speaker: "Player",   emotion: "determined", text: "Focused. We've put in the work. Today we show what we're made of." },
        { speaker: "Reporter", emotion: "curious",    text: "Zhao — last season you were known as a solo player. Is that still the case?" },
        { speaker: "Zhao",     emotion: "confident",  text: "People change. I've learned to trust my team. Watch what happens out there." },
        { speaker: "Reporter", emotion: "excited",    text: "Strong words. Westen fans are counting on you. Best of luck!" }
    ]
});

// Pre-match presentation data — plugged into showPreMatchPresentation().
// Swap out homeTeam / awayTeam here to reuse this template for future chapters.
var chapter3MatchSetup = {
    chapterTitle: "Chapter 3 — The Qualifier",
    homeTeam: {
        name: "Westen FC",
        stadium: "Westward Arena",
        formation: "2-2",
        players: ["Otto", "Reyes", "Malik", "Torres"]
    },
    awayTeam: {
        name: "Northbridge United",
        formation: "2-2",
        players: ["Shaw", "Patel", "Nkosi", "Cruz"]
    }
};
