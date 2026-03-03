// game_data.js — Game-ready structured representation of all story content.
// Source: Dialogue Part 1 and Dialogue Part 2.
// This file is the canonical game integration format produced from the structured
// dialogue files. Do NOT modify story content here — edit the per-chapter scene
// files and regenerate this structure accordingly.

const gameData = {
    chapters: [

        // ── PROLOGUE PART 1 ───────────────────────────────────────────────────
        // Source: Dialogue Part 1
        {
            id: "prologue_01",
            title: "Prologue \u2013 Part 1: \u201cWelcome to Weston\u201d",
            scenes: [
                { type: "narration", text: "Black screen. Sound of ocean waves. Low mechanical hum. Fade in." },
                { type: "narration", text: "A large government building sits on the edge of the ocean. A boat approaches the dock. You walk toward the building." },
                { type: "dialogue",  speaker: "Girl", text: "Oh, hello. Welcome. I didn't hear you come in." },
                { type: "dialogue",  speaker: "Girl", text: "My name is [INSERT NAME]. Are you just arriving from Breeder\u2019s Island?" },
                {
                    type: "choice",
                    options: [
                        { id: "choice_prologue01_1", text: "Yeah. I just came from the Breeder\u2019s Island.", next: "prologue_01_cont" }
                    ]
                },
                { id: "prologue_01_cont", type: "dialogue", speaker: "Girl", text: "Cool. Welcome to Weston." },
                { type: "dialogue", speaker: "Girl", text: "Do you have your paperwork and your ID?" },
                {
                    type: "choice",
                    options: [
                        { id: "choice_prologue01_2", text: "Yeah, I do.", next: "prologue_01_orientation" }
                    ]
                },
                { id: "prologue_01_orientation", type: "dialogue", speaker: "Girl", text: "Okay. Follow me. We have to go to the orientation building." },
                { type: "dialogue", speaker: "Girl", text: "Please sit down." },
                { type: "dialogue", speaker: "Girl", text: "Okay, all set. You\u2019re assigned to the city of West Ward." },
                { type: "dialogue", speaker: "Girl", text: "Oh, bummer. I don\u2019t know much about West Ward." },
                { type: "dialogue", speaker: "Girl", text: "But they\u2019re known for their coal mining." },
                { type: "dialogue", speaker: "Girl", text: "So let me give you a tour of Weston." },
                { type: "dialogue", speaker: "Girl", text: "Weston is over 1,000 years old. That\u2019s a lot of history." },
                { type: "dialogue", speaker: "Girl", text: "We became one of the strongest countries in the world over 500 years ago." },
                { type: "dialogue", speaker: "Girl", text: "Then the Great Xiao War happened." },
                { type: "dialogue", speaker: "Girl", text: "It lasted over 10 years." },
                { type: "dialogue", speaker: "Girl", text: "It was a dark time in our history." },
                { type: "dialogue", speaker: "Girl", text: "But now we made our government system for the benefit of the people." },
                { type: "dialogue", speaker: "Girl", text: "And people are happy." },
                { type: "dialogue", speaker: "Girl", text: "Let me tell you about the basic lifeline of people who live here." },
                { type: "dialogue", speaker: "Girl", text: "If you\u2019re born in West Ward, you go to the education building." },
                { type: "dialogue", speaker: "Girl", text: "Every city has a common education building for elementary, middle, and high school." },
                { type: "dialogue", speaker: "Girl", text: "We learn about Westward. We develop our skills. Social skills." },
                { type: "dialogue", speaker: "Girl", text: "And we graduate after passing our career exam to see what kind of career we\u2019re going to take." },
                { type: "dialogue", speaker: "Girl", text: "We learn the values and principles of being a Westerner." },
                { type: "dialogue", speaker: "Girl", text: "We have a record of being the best students and having the best test scores in the world." },
                { type: "dialogue", speaker: "Girl", text: "But for you, because you are from Breeder Island\u2026 you start off at this part of the map." },
                { type: "dialogue", speaker: "Girl", text: "You go to the Selection University." },
                { type: "dialogue", speaker: "Girl", text: "But I see here that you already went to university in a different country. How particular." },
                { type: "dialogue", speaker: "Girl", text: "I\u2019ve never seen that before." },
                { type: "dialogue", speaker: "Girl", text: "But since you already have a major\u2026 and it looks like you already have a job\u2026 we can skip that." },
                { type: "dialogue", speaker: "Girl", text: "But when you have kids, they will go to the Selection University for two years to master what they\u2019ve been chosen to do." },
                { type: "dialogue", speaker: "Girl", text: "Oh, but you start off here. In a couple of years, when you turn 25, you get to enter the Lottery Convention." },
                { type: "dialogue", speaker: "Girl", text: "You will go to the Grand Lottery Convention Hall in the capital city of Draco." },
                { type: "dialogue", speaker: "Girl", text: "You fill out forms. You pay your taxes." },
                { type: "dialogue", speaker: "Girl", text: "Depending on your status\u2026 you can find a higher-level mate or a lower-level mate for you." },
                { type: "dialogue", speaker: "Girl", text: "I wish you all the luck in that." },
                { type: "dialogue", speaker: "Girl", text: "But remember\u2026 mating before marriage is illegal and punishable." },
                { type: "dialogue", speaker: "Girl", text: "Breeder Island-born Westerners and natural-born Westerners on the mainland are all the same." },
                { type: "dialogue", speaker: "Girl", text: "We have to protect each other to make sure our society survives." },
                { type: "dialogue", speaker: "Girl", text: "Because without unity\u2026 there is no future." },
                {
                    type: "choice",
                    options: [
                        { id: "choice_prologue01_3", text: "What?", next: "prologue_01_end" }
                    ]
                },
                { id: "prologue_01_end", type: "dialogue", speaker: "Girl", text: "Oh. Nothing." },
                { type: "dialogue", speaker: "Girl", text: "Here\u2019s your ticket." },
                { type: "dialogue", speaker: "Girl", text: "Here is the address of the apartment you have been given." },
                { type: "dialogue", speaker: "Girl", text: "And here are 500 Westernite dollars. Use them wisely." },
                { type: "dialogue", speaker: "Girl", text: "You are to report to work on Monday morning." },
                { type: "dialogue", speaker: "Girl", text: "Nice meeting you. Good luck." },
                { type: "narration", text: "Fade to black." }
            ]
        },

        // ── PROLOGUE PART 2 ───────────────────────────────────────────────────
        // Source: Dialogue Part 1
        {
            id: "prologue_02",
            title: "Prologue \u2013 Part 2",
            scenes: [
                { type: "narration", text: "Pitch black screen. No visuals. Only text bubbles and sound." },
                { type: "dialogue",  speaker: "Unknown", text: "Otto\u2026 are you okay?" },
                { type: "narration", text: "Distant engines. Boots on pavement." },
                { type: "dialogue",  speaker: "Unknown", text: "I have to leave." },
                { type: "dialogue",  speaker: "Unknown", text: "Mom will be back in an hour or two. You stay here." },
                { type: "dialogue",  speaker: "Unknown", text: "I never scanned my ID when I turned twenty-one." },
                { type: "dialogue",  speaker: "Unknown", text: "They don\u2019t know where I am. They can\u2019t track me." },
                { type: "dialogue",  speaker: "Unknown", text: "They\u2019re drafting everyone." },
                { type: "dialogue",  speaker: "Unknown", text: "I can\u2019t go to war." },
                { type: "dialogue",  speaker: "Unknown", text: "If they catch me, I\u2019m gone." },
                { type: "dialogue",  speaker: "Unknown", text: "You\u2019re the oldest now." },
                { type: "narration", text: "Engines roar closer." },
                { type: "dialogue",  speaker: "Unknown", text: "Protect them." },
                { type: "narration", text: "A massive explosion. Cut to black." },
                { type: "narration", text: "Soldiers storm the town. Gunfire. People running. A woman falls. Silence." },
                { type: "narration", text: "Early morning. An elderly man stands at Otto\u2019s door. He looks broken. Otto listens. His face changes." },
                { type: "dialogue",  speaker: "Otto", text: "Mom\u2026 isn\u2019t coming back." },
                { type: "dialogue",  speaker: "Otto", text: "He\u2026 went away as well." },
                { type: "dialogue",  speaker: "Otto", text: "But I\u2019m here." },
                { type: "narration", text: "Cut to black. Eight years later." }
            ]
        },

        // ── CHAPTER 1 ─────────────────────────────────────────────────────────
        {
            id: "chapter_1",
            title: "Chapter 1 \u2014 First Days",
            scenes: [
                { type: "narration", text: "Chapter 1 \u2014 First Days" },
                { type: "dialogue",  speaker: "Coach", text: "Before we talk tactics, you need to understand one thing: this is a team sport." },
                { type: "dialogue",  speaker: "Zhao",  text: "I know how to play a team sport." },
                { type: "dialogue",  speaker: "Coach", text: "Do you? Because the scouts tell me you took 14 shots last match and passed zero times." },
                { type: "dialogue",  speaker: "Zhao",  text: "... They went in, didn\u2019t they?" },
                { type: "dialogue",  speaker: "Coach", text: "Two of them did. Your teammates were open six more times. Learn to read the field." },
                { type: "dialogue",  speaker: "Player", text: "Coach \u2014 what\u2019s the plan for the upcoming qualifier?" },
                { type: "dialogue",  speaker: "Coach", text: "That\u2019s what we\u2019re here to figure out. Get some rest. Tomorrow it gets real." }
            ]
        },

        // ── CHAPTER 2 ─────────────────────────────────────────────────────────
        {
            id: "chapter_2",
            title: "Chapter 2 \u2014 Rising Pressure",
            scenes: [
                { type: "narration", text: "Chapter 2 \u2014 Rising Pressure" },
                { type: "narration", text: "Word has spread across the league. Westen\u2019s new recruits are drawing attention." },
                { type: "dialogue",  speaker: "Zhao",   text: "Did you see that scout in the stands? He was watching us the whole session." },
                { type: "dialogue",  speaker: "Player", text: "I noticed. We can\u2019t afford to have a bad game right now." },
                { type: "dialogue",  speaker: "Coach",  text: "Forget the scouts. Play for each other. The rest follows." },
                { type: "dialogue",  speaker: "Coach",  text: "The qualifier is tomorrow. Pre-game interviews, then the match. Be ready." },
                { type: "dialogue",  speaker: "Player", text: "Understood. We\u2019ll be ready." }
            ]
        },

        // ── CHAPTER 3 ─────────────────────────────────────────────────────────
        {
            id: "chapter_3",
            title: "Chapter 3 \u2014 The Qualifier",
            scenes: [
                // Pre-game interview
                { type: "dialogue",  speaker: "Reporter", text: "We\u2019re live on the sideline with Westen FC\u2019s rising stars! How are you feeling ahead of today\u2019s qualifier?" },
                { type: "dialogue",  speaker: "Player",   text: "Focused. We\u2019ve put in the work. Today we show what we\u2019re made of." },
                { type: "dialogue",  speaker: "Reporter", text: "Zhao \u2014 last season you were known as a solo player. Is that still the case?" },
                { type: "dialogue",  speaker: "Zhao",     text: "People change. I\u2019ve learned to trust my team. Watch what happens out there." },
                { type: "dialogue",  speaker: "Reporter", text: "Strong words. Westen fans are counting on you. Best of luck!" },

                // Post-game interview
                { type: "dialogue",  speaker: "Reporter", text: "What a match! Can you tell us what was going through your mind out there?" },
                { type: "dialogue",  speaker: "Player",   text: "It was tough \u2014 they came out pressing hard. But we kept our shape and found our chances." },
                { type: "dialogue",  speaker: "Zhao",     text: "I had two shots go wide. Not good enough. But the team pulled through." },
                { type: "dialogue",  speaker: "Reporter", text: "Coach Rivera, your thoughts?" },
                { type: "dialogue",  speaker: "Coach",    text: "Proud of the effort. There\u2019s still work to do, but this is the foundation we needed." },

                // Post-match story scene
                { type: "narration", text: "The result is in. Whatever happened today, the journey is only beginning." },
                { type: "dialogue",  speaker: "Coach", text: "Remember this feeling \u2014 win or lose. Let it drive you forward." },
                { type: "dialogue",  speaker: "Zhao",  text: "Next match... I won\u2019t miss those shots." },
                { type: "dialogue",  speaker: "Player", text: "Neither will I. We\u2019re just getting started." },
                { type: "narration", text: "The Champions League road continues. Westen FC presses on." }
            ]
        }
    ]
};
