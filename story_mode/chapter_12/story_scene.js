// Chapter 12
// Source: dialogue_storymode

var chapter12Scene = createDialogueScene({
    id: "chapter_12",
    background: "dormitory",
    chapterTitle: "Chapter 12",
    dialogue: [
        { speaker: "Narrator",    emotion: "neutral", text: "Otto texts Rebecca." },
        { speaker: "Otto (text)", emotion: "neutral", text: "Rebecca, tell me exactly what you're hearing." },
        { speaker: "Narrator",    emotion: "neutral", text: "Otto turns on the TV. Every channel. Same footage. Westward — City Center. Thousands of people. Not a riot. Not chaos. Organized. Workers. Students. Families. Old banners pulled out of storage. New ones painted overnight. One word repeats across them all: ACCOUNTABILITY. The anchor's voice trembles — just slightly." },
        { speaker: "Anchor",      emotion: "serious", text: "Authorities confirm a coordinated, unauthorized mass demonstration in Westward—" },
        { speaker: "Narrator",    emotion: "neutral", text: "The screen cuts. Replaced by a government seal. EMERGENCY STATEMENT." },
        { speaker: "Narrator",    emotion: "neutral", text: "Scene change: Ashley — Inside the System. A government conference room. Tense. Loud. Controlled panic. Screens show aerial shots of Westward." },
        { speaker: "Official #1", emotion: "serious", text: "This isn't spontaneous." },
        { speaker: "Official #2", emotion: "serious", text: "It's logistical. Food stations. Medical volunteers. They planned this for weeks." },
        { speaker: "Narrator",    emotion: "neutral", text: "The door opens. The President enters. The room stands." },
        { speaker: "President",   emotion: "serious", text: "Sit." },
        { speaker: "Narrator",    emotion: "neutral", text: "They do." },
        { speaker: "President",   emotion: "serious", text: "Arrests begin immediately. Leadership first." },
        { speaker: "Narrator",    emotion: "neutral", text: "People who trained him. Covered his shifts. Helped him when his mom got sick. People who told him to chase football. Police zip-tie Marcos Vega. Marcos looks straight into the camera. Unafraid." },
        { speaker: "Narrator",    emotion: "neutral", text: "Scene change: Rebecca Calls. Otto answers instantly." },
        { speaker: "Otto",        emotion: "serious", text: "Where are you?" },
        { speaker: "Rebecca",     emotion: "serious", text: "Inside. Curtains closed." },
        { speaker: "Otto",        emotion: "serious", text: "I know those people they're arresting." },
        { speaker: "Narrator",    emotion: "neutral", text: "Silence." },
        { speaker: "Rebecca",     emotion: "sad",     text: "Everyone does." },
        { speaker: "Narrator",    emotion: "neutral", text: "Scene change: Jenny — The Media Collapse. Otto's phone rings again. Jenny." },
        { speaker: "Jenny",       emotion: "serious", text: "Deleting clips. People are being told to 'stick to the statement.'" },
        { speaker: "Otto",        emotion: "serious", text: "They're arresting civilians." },
        { speaker: "Jenny",       emotion: "serious", text: "I know. And they don't want the country seeing how many." },
        { speaker: "Narrator",    emotion: "neutral", text: "A pause." },
        { speaker: "Jenny",       emotion: "serious", text: "Otto... they're preparing a list." },
        { speaker: "Otto",        emotion: "serious", text: "A list of what?" },
        { speaker: "Jenny",       emotion: "serious", text: "Cities. People. Athletes." },
        { speaker: "Narrator",    emotion: "neutral", text: "Otto exhales slowly." },
        { speaker: "Narrator",    emotion: "neutral", text: "Scene change: Team Reaction. The team lounge. Everyone's watching now. No jokes. No trash talk." },
        { speaker: "Teammate 1",  emotion: "neutral", text: "That's your city, right?" },
        { speaker: "Narrator",    emotion: "neutral", text: "Otto nods." },
        { speaker: "Coach Baker", emotion: "serious", text: "Phones away in ten minutes." },
        { speaker: "Narrator",    emotion: "neutral", text: "Otto doesn't move." }
    ],
    next: "chapter_13"
});
