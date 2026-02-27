let chaptersData = null;

const fallbackChaptersData = [
    {
        type: "story",
        lines: [
            { speaker: "Narrator", text: "Prologue..." },
            { speaker: "Coach", text: "Welcome to Westen." }
        ]
    },
    {
        type: "story",
        lines: [
            { speaker: "Narrator", text: "Chapter 1 begins..." }
        ]
    },
    {
        type: "story",
        lines: [
            { speaker: "Narrator", text: "Chapter 2..." }
        ]
    },
    {
        type: "match",
        preGame: {
            type: "story",
            lines: [
                { speaker: "Reporter", text: "How do you feel today?" }
            ]
        },
        postGame: {
            type: "story",
            lines: [
                { speaker: "Reporter", text: "Great performance." }
            ]
        },
        storyAfterMatch: {
            type: "story",
            lines: [
                { speaker: "Narrator", text: "System cycle unlocked: Pre-Game Interview → Match → Post-Game Interview → Story → Next Chapter." }
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
