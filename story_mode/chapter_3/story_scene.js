// Chapter 3 — Story Scene (Post-Match)
// Plays after the post-game interview. Add choices here to branch the story
// based on match result without modifying the engine.

var chapter3StoryScene = createDialogueScene({
    id: "ch3_story",
    background: "locker_room",
    dialogue: [
        { speaker: "Narrator", emotion: "neutral",    text: "The result is in. Whatever happened today, the journey is only beginning." },
        { speaker: "Coach",    emotion: "serious",    text: "Remember this feeling — win or lose. Let it drive you forward." },
        { speaker: "Zhao",     emotion: "determined", text: "Next match... I won't miss those shots." },
        { speaker: "Player",   emotion: "determined", text: "Neither will I. We're just getting started." },
        { speaker: "Narrator", emotion: "neutral",    text: "The Champions League road continues. Westen FC presses on." }
    ]
});
