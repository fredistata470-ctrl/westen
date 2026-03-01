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

// Show a FIFA-style pre-match presentation screen (Story Mode only).
// Displays stadium name, team names, home/away indicator, formation and lineup.
// Fades into the match after a short delay or on click.
function showPreMatchPresentation(chapter, onDone) {
    setScene("PRE_MATCH");

    // Resolve team info from chapter or fall back to defaults
    const homeTeam = (chapter && chapter.homeTeam) || { name: "Westen FC", stadium: "Westward Arena", formation: "2-2", players: [] };
    const awayTeam = (chapter && chapter.awayTeam) || { name: "Northbridge United", formation: "2-2", players: [] };

    const homeLineup = (homeTeam.players && homeTeam.players.length)
        ? homeTeam.players.map((p, i) => `<li>#${i + 1} ${escapeHTML(p)}</li>`).join("")
        : "<li>#1 Goalkeeper</li><li>#2 Defender</li><li>#3 Midfielder</li><li>#4 Forward</li>";

    const awayLineup = (awayTeam.players && awayTeam.players.length)
        ? awayTeam.players.map((p, i) => `<li>#${i + 1} ${escapeHTML(p)}</li>`).join("")
        : "<li>#1 GK</li><li>#2 DF</li><li>#3 MF</li><li>#4 FW</li>";

    screen.innerHTML = `
        <div class="prematch-screen">
            <div class="prematch-stadium">${escapeHTML(homeTeam.stadium || "Westward Arena")}</div>
            <div class="prematch-matchup">
                <span class="prematch-home">${escapeHTML(homeTeam.name)} <span class="prematch-badge home-badge">HOME</span></span>
                <span class="prematch-vs">vs</span>
                <span class="prematch-away"><span class="prematch-badge away-badge">AWAY</span> ${escapeHTML(awayTeam.name)}</span>
            </div>
            <div class="prematch-details">
                <div class="prematch-team-col">
                    <div class="prematch-formation">Formation: ${escapeHTML(homeTeam.formation || "2-2")}</div>
                    <ul class="prematch-lineup">${homeLineup}</ul>
                </div>
                <div class="prematch-team-col">
                    <div class="prematch-formation">Formation: ${escapeHTML(awayTeam.formation || "2-2")}</div>
                    <ul class="prematch-lineup">${awayLineup}</ul>
                </div>
            </div>
            <div class="prematch-prompt">▶ Click to kick off</div>
        </div>
    `;

    function proceed() {
        clearTimeout(autoTimer);
        screen.onclick = null;
        if (onDone) onDone();
    }

    // Also auto-advance after 5 seconds
    const autoTimer = setTimeout(() => {
        if (currentScene === "PRE_MATCH") proceed();
    }, 5000);

    screen.onclick = () => proceed();
}

function startPreGameInterview(chapter) {
    playStory(chapter.preGame, () => {
        // Show pre-match presentation before the match begins
        showPreMatchPresentation(chapter, () => {
            setScene("MATCH");
            startMatch(chapter, () => {
                // Record match result in save data before post-game interview
                if (typeof score !== "undefined") {
                    if (score.player > score.ai) {
                        saveData.wins++;
                        if (saveData.record) saveData.record.wins++;
                    } else {
                        saveData.losses++;
                        if (saveData.record) saveData.record.losses++;
                    }
                    if (saveData.record) saveData.record.goals += score.player;
                    // Award XP to Otto for story matches
                    if (typeof awardMatchXP === "function") {
                        awardMatchXP(score.player > score.ai ? "win" : "loss", score.player);
                    }
                    saveGame();
                }
                startPostGameInterview(chapter);
            });
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
