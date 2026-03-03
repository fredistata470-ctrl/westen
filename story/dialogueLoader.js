let chaptersData = null;

const fallbackChaptersData = [
    {
        type: "story",
        title: "Prologue Part 1 — Arrival",
        lines: [
            { speaker: "Narrator", text: "Fade in. A government building sits by the ocean. A boat approaches the dock." },
            { speaker: "Ara Hernandez", text: "Welcome. My name is Ara Hernandez." },
            { speaker: "Ara Hernandez", text: "You're assigned to the city of West Ward. Because without unity there is no future." }
        ]
    },
    {
        type: "story",
        title: "Prologue Part 2 — Before",
        lines: [
            { speaker: "Unknown", text: "Otto are you okay? I have to leave." },
            { speaker: "Otto", text: "Mom isn't coming back. ...but I'm here." }
        ]
    },
    {
        type: "story",
        title: "Chapter 1 — The Westen-Xiao League",
        lines: [
            { speaker: "Rebecca", text: "You're late again." },
            { speaker: "Coach Baker", text: "Listen up. If you're here to dream — leave now." }
        ]
    },
    {
        type: "story",
        title: "Chapter 2 — Selected",
        lines: [
            { speaker: "Otto", text: "I made it. This feels so unreal." },
            { speaker: "Coach Baker", text: "You're depth. Very low on the chart. Don't expect much this season." },
            { speaker: "Otto", text: "I'm going to give it my best and surprise you." }
        ]
    },
    {
        type: "match",
        title: "Match 1 — Westward FC vs Northbridge United",
        homeTeam: "westen_fc",
        awayTeam: "northbridge_united",
        preGame: {
            type: "story",
            lines: [
                { speaker: "Reporter", text: "Otto, this is your first league match. How are you feeling?" },
                { speaker: "Otto", text: "Ready. I've worked too hard to be nervous." }
            ]
        },
        postGame: {
            type: "story",
            lines: [
                { speaker: "Reporter", text: "That was a tough match. What are your thoughts?" },
                { speaker: "Otto", text: "We gave it everything. We keep building from here." }
            ]
        },
        storyAfterMatch: {
            type: "story",
            lines: [
                { speaker: "Narrator", text: "Win or lose, Otto walks off the pitch knowing this is only the beginning." },
                { speaker: "Otto", text: "There's more to come." }
            ]
        }
    }
];

async function loadDialogue() {
    const candidates = [
        "story/chapters.json",
        "./story/chapters.json",
        new URL("story/chapters.json", window.location.href).toString()
    ];

    for (const path of candidates) {
        try {
            const response = await fetch(path, { cache: "no-store" });
            if (!response.ok) continue;
            chaptersData = await response.json();
            return;
        } catch (_error) {
            // try next candidate
        }
    }

    chaptersData = fallbackChaptersData;
}
