let chaptersData = null;

const fallbackChaptersData = [
    {
        type: "story",
        lines: [
            { speaker: "Narrator", text: "Somewhere in the city of Westen, a dream is about to begin..." },
            { speaker: "Coach", text: "Welcome to the Westen Champions League Academy. I'm Coach Rivera." },
            { speaker: "Coach", text: "You've been selected because we see something special in you. Don't waste it." },
            { speaker: "Player", text: "We won't disappoint you, Coach." }
        ]
    },
    {
        type: "story",
        lines: [
            { speaker: "Narrator", text: "Chapter 1 — First Days" },
            { speaker: "Coach", text: "Before we talk tactics, you need to understand one thing: this is a team sport." },
            { speaker: "Zhao", text: "I know how to play a team sport." },
            { speaker: "Coach", text: "Do you? Because the scouts tell me you took 14 shots last match and passed zero times." }
        ]
    },
    {
        type: "story",
        lines: [
            { speaker: "Narrator", text: "Chapter 2 — Rising Pressure" },
            { speaker: "Coach", text: "The qualifier is tomorrow. Pre-game interviews, then the match. Be ready." },
            { speaker: "Player", text: "Understood. We'll be ready." }
        ]
    },
    {
        type: "match",
        preGame: {
            type: "story",
            lines: [
                { speaker: "Reporter", text: "How are you feeling ahead of today's qualifier?" },
                { speaker: "Player", text: "Focused. We've put in the work. Today we show what we're made of." }
            ]
        },
        postGame: {
            type: "story",
            lines: [
                { speaker: "Reporter", text: "What a match! Can you tell us what was going through your mind out there?" },
                { speaker: "Coach", text: "Proud of the effort. There's still work to do, but this is the foundation we needed." }
            ]
        },
        storyAfterMatch: {
            type: "story",
            lines: [
                { speaker: "Narrator", text: "The result is in. Whatever happened today, the journey is only beginning." },
                { speaker: "Coach", text: "Remember this feeling — win or lose. Let it drive you forward." },
                { speaker: "Narrator", text: "The Champions League road continues. Westen FC presses on." }
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
