async function loadChapter(index) {
    if (!chaptersData) {
        await loadDialogue();
    }

    const chapter = chaptersData[index];
    if (!chapter) {
        screen.innerHTML = "<h1>End of Demo</h1>";
        return;
    }

    if (chapter.type === "story") {
        playStory(chapter, () => nextChapter());
    }

    if (chapter.type === "match") {
        startPreGameInterview(chapter);
    }
}

function playStory(chapter, onComplete) {
    let dialogueIndex = 0;

    function showDialogue() {
        const line = chapter.lines[dialogueIndex];

        screen.innerHTML = `
            <h2>${line.speaker}</h2>
            <p>${line.text}</p>
        `;

        if (line.choices) {
            line.choices.forEach(choice => {
                const btn = document.createElement("button");
                btn.innerText = choice.text;
                btn.onclick = () => {
                    dialogueIndex++;
                    if (dialogueIndex >= chapter.lines.length) {
                        if (onComplete) onComplete();
                    } else {
                        showDialogue();
                    }
                };
                screen.appendChild(btn);
            });
        } else {
            screen.onclick = () => {
                dialogueIndex++;
                if (dialogueIndex >= chapter.lines.length) {
                    screen.onclick = null;
                    if (onComplete) onComplete();
                } else {
                    showDialogue();
                }
            };
        }
    }

    showDialogue();
}

function startPreGameInterview(chapter) {
    playStory(chapter.preGame, () => {
        startMatch(chapter, () => {
            startPostGameInterview(chapter);
        });
    });
}

function startPostGameInterview(chapter) {
    playStory(chapter.postGame, () => {
        if (chapter.storyAfterMatch) {
            playStory(chapter.storyAfterMatch, () => nextChapter());
        } else {
            nextChapter();
        }
    });
}
