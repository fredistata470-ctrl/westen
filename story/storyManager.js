// Escape special HTML characters to prevent XSS when injecting dialogue data into innerHTML.
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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
        playStory(chapter, () => {
            nextChapter();
        });
    }

    if (chapter.type === "match") {
        startPreGameInterview(chapter);
    }
}

// Render a properly structured dialogue box at the bottom of the screen.
// Supports optional portrait image and optional voice audio per line.
function playStory(chapter, onEnd) {
    setScene("DIALOGUE");
    let dialogueIndex = 0;

    function showDialogue() {
        const line = chapter.lines?.[dialogueIndex];
        if (!line) {
            screen.onclick = null;
            if (onEnd) onEnd();
            return;
        }

        // Play voice line through centralized audio manager if provided
        if (line.voice) {
            audioManager.playVoice(line.voice);
        }

        const portraitHTML = line.portrait
            ? `<div class="dialogue-portrait"><img src="${escapeHTML(line.portrait)}" alt="${escapeHTML(line.speaker)}" onerror="this.style.display='none'"></div>`
            : "";

        screen.innerHTML = `
            <div class="dialogue-scene">
                ${portraitHTML}
                <div class="dialogue-box">
                    <div class="dialogue-speaker">${escapeHTML(line.speaker)}</div>
                    <div class="dialogue-text">${escapeHTML(line.text)}</div>
                    <div class="dialogue-prompt">▼ Click to continue</div>
                </div>
            </div>
        `;

        if (line.choices) {
            // Hide the click-to-continue prompt and show choice buttons instead
            const promptEl = screen.querySelector(".dialogue-prompt");
            if (promptEl) promptEl.style.display = "none";

            const boxEl = screen.querySelector(".dialogue-box");
            line.choices.forEach(choice => {
                const btn = document.createElement("button");
                btn.className = "dialogue-choice";
                btn.innerText = choice.text;
                btn.onclick = () => {
                    dialogueIndex++;
                    if (dialogueIndex >= chapter.lines.length) {
                        if (onEnd) onEnd();
                    } else {
                        showDialogue();
                    }
                };
                boxEl.appendChild(btn);
            });
        } else {
            screen.onclick = () => {
                dialogueIndex++;
                if (dialogueIndex >= chapter.lines.length) {
                    screen.onclick = null;
                    if (onEnd) onEnd();
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
        setScene("MATCH");
        startMatch(chapter, () => {
            // Record match result in save data before post-game interview
            if (typeof score !== "undefined") {
                if (score.player > score.ai) {
                    saveData.wins++;
                } else {
                    saveData.losses++;
                }
                saveGame();
            }
            startPostGameInterview(chapter);
        });
    });
}

function startPostGameInterview(chapter) {
    setScene("POST_MATCH");
    playStory(chapter.postGame, () => {
        if (chapter.storyAfterMatch) {
            playStory(chapter.storyAfterMatch, () => {
                nextChapter();
            });
        } else {
            nextChapter();
        }
    });
}
