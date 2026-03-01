// Story Engine — modular scene loader and flow controller.
// Assembles the chapter list from per-chapter scene files and drives the story.
// Training mode calls startMatch() directly, bypassing all story engine hooks.

// ── Chapter registry ──────────────────────────────────────────────────────────
// To add a new chapter: create its scene file, load it in index.html before
// this script, then push a new entry into STORY_CHAPTERS below.

var STORY_CHAPTERS = [
    // Prologue
    { type: "story", scene: prologuePart1 },
    { type: "story", scene: prologuePart2 },

    // Chapter 1
    { type: "story", scene: chapter1Scene },

    // Chapter 2
    { type: "story", scene: chapter2Scene },

    // Chapter 3 — Match chapter
    {
        type: "match",
        preGame: chapter3PreGameDialogue,
        homeTeam: chapter3MatchSetup.homeTeam,
        awayTeam: chapter3MatchSetup.awayTeam,
        chapterTitle: chapter3MatchSetup.chapterTitle,
        postGame: chapter3PostGameDialogue,
        storyAfterMatch: chapter3StoryScene,
        matchHooks: chapter3Match
    },

    // Chapter: The Golden Return
    { type: "story", scene: chapterGoldenReturnScene },

    // Chapter: They Say It Out Loud
    { type: "story", scene: chapterTheySayItOutLoudScene },

    // Chapter 12
    { type: "story", scene: chapter12Scene },

    // Chapter 13
    { type: "story", scene: chapter13Scene },

    // Chapter 14: Visibility
    { type: "story", scene: chapter14Scene },

    // Chapter 22: Fault Lines
    { type: "story", scene: chapter22Scene }
];

// ── HTML escaping ─────────────────────────────────────────────────────────────

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// ── Chapter loader ────────────────────────────────────────────────────────────
// Called by main.js with the current chapter index.
// Returns a resolved Promise for compatibility with the async _runChapter wrapper.

function loadChapter(index) {
    var chapter = STORY_CHAPTERS[index];
    if (!chapter) {
        screen.innerHTML = "<h1>End of Demo</h1>";
        return Promise.resolve();
    }

    if (chapter.type === "story") {
        playStory(chapter.scene, function() {
            nextChapter();
        });
    }

    if (chapter.type === "match") {
        startPreGameInterview(chapter);
    }

    return Promise.resolve();
}

// ── Dialogue renderer ─────────────────────────────────────────────────────────
// Render a properly structured dialogue box at the bottom of the screen.
// Supports optional portrait image and optional voice audio per line.
// Accepts a scene object (dialogue[] from createDialogueScene) or a legacy
// lines-based object so existing save data keeps working.

function playStory(scene, onEnd) {
    setScene("DIALOGUE");
    var dialogueIndex = 0;

    // Support both new scene.dialogue[] format and legacy scene.lines[] format
    var lines = (scene && (scene.dialogue || scene.lines)) || [];

    function showDialogue() {
        var line = lines[dialogueIndex];
        if (!line) {
            screen.onclick = null;
            if (onEnd) onEnd();
            return;
        }

        // Play voice line through centralized audio manager if provided
        if (line.voice) {
            audioManager.playVoice(line.voice);
        }

        var portraitHTML = line.portrait
            ? "<div class=\"dialogue-portrait\"><img src=\"" + escapeHTML(line.portrait) + "\" alt=\"" + escapeHTML(line.speaker) + "\" onerror=\"this.style.display='none'\"></div>"
            : "";

        screen.innerHTML =
            "<div class=\"dialogue-scene\">" +
                portraitHTML +
                "<div class=\"dialogue-box\">" +
                    "<div class=\"dialogue-speaker\">" + escapeHTML(line.speaker) + "</div>" +
                    "<div class=\"dialogue-text\">" + escapeHTML(line.text) + "</div>" +
                    "<div class=\"dialogue-prompt\">\u25bc Click to continue</div>" +
                "</div>" +
            "</div>";

        if (line.choices) {
            // Hide the click-to-continue prompt and show choice buttons instead
            var promptEl = screen.querySelector(".dialogue-prompt");
            if (promptEl) promptEl.style.display = "none";

            var boxEl = screen.querySelector(".dialogue-box");
            line.choices.forEach(function(choice) {
                var btn = document.createElement("button");
                btn.className = "dialogue-choice";
                btn.innerText = choice.text;
                btn.onclick = function() {
                    dialogueIndex++;
                    if (dialogueIndex >= lines.length) {
                        if (onEnd) onEnd();
                    } else {
                        showDialogue();
                    }
                };
                boxEl.appendChild(btn);
            });
        } else {
            screen.onclick = function() {
                dialogueIndex++;
                if (dialogueIndex >= lines.length) {
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

// ── Pre-match presentation ────────────────────────────────────────────────────
// Show a FIFA-style pre-match presentation screen (Story Mode only).
// Displays chapter title, stadium, team names, home/away, formation and lineup.
// Training mode bypasses this entirely — startTrainingMode() calls startMatch() directly.

function showPreMatchPresentation(chapter, onDone) {
    setScene("PRE_MATCH");

    var homeTeam = (chapter && chapter.homeTeam) || { name: "Westen FC", stadium: "Westward Arena", formation: "2-2", players: [] };
    var awayTeam = (chapter && chapter.awayTeam) || { name: "Northbridge United", formation: "2-2", players: [] };
    var chapterTitle = (chapter && chapter.chapterTitle) || "";

    var homeLineup = (homeTeam.players && homeTeam.players.length)
        ? homeTeam.players.map(function(p, i) { return "<li>#" + (i + 1) + " " + escapeHTML(p) + "</li>"; }).join("")
        : "<li>#1 Goalkeeper</li><li>#2 Defender</li><li>#3 Midfielder</li><li>#4 Forward</li>";

    var awayLineup = (awayTeam.players && awayTeam.players.length)
        ? awayTeam.players.map(function(p, i) { return "<li>#" + (i + 1) + " " + escapeHTML(p) + "</li>"; }).join("")
        : "<li>#1 GK</li><li>#2 DF</li><li>#3 MF</li><li>#4 FW</li>";

    screen.innerHTML =
        "<div class=\"prematch-screen\">" +
            (chapterTitle ? "<div class=\"prematch-chapter\">" + escapeHTML(chapterTitle) + "</div>" : "") +
            "<div class=\"prematch-stadium\">" + escapeHTML(homeTeam.stadium || "Westward Arena") + "</div>" +
            "<div class=\"prematch-matchup\">" +
                "<span class=\"prematch-home\">" + escapeHTML(homeTeam.name) + " <span class=\"prematch-badge home-badge\">HOME</span></span>" +
                "<span class=\"prematch-vs\">vs</span>" +
                "<span class=\"prematch-away\"><span class=\"prematch-badge away-badge\">AWAY</span> " + escapeHTML(awayTeam.name) + "</span>" +
            "</div>" +
            "<div class=\"prematch-details\">" +
                "<div class=\"prematch-team-col\">" +
                    "<div class=\"prematch-formation\">Formation: " + escapeHTML(homeTeam.formation || "2-2") + "</div>" +
                    "<ul class=\"prematch-lineup\">" + homeLineup + "</ul>" +
                "</div>" +
                "<div class=\"prematch-team-col\">" +
                    "<div class=\"prematch-formation\">Formation: " + escapeHTML(awayTeam.formation || "2-2") + "</div>" +
                    "<ul class=\"prematch-lineup\">" + awayLineup + "</ul>" +
                "</div>" +
            "</div>" +
            "<div class=\"prematch-prompt\">\u25b6 Click to kick off</div>" +
        "</div>";

    function proceed() {
        clearTimeout(autoTimer);
        screen.onclick = null;
        if (onDone) onDone();
    }

    // Also auto-advance after 5 seconds
    var autoTimer = setTimeout(function() {
        if (currentScene === "PRE_MATCH") proceed();
    }, 5000);

    screen.onclick = function() { proceed(); };
}

// ── Match flow ────────────────────────────────────────────────────────────────

function startPreGameInterview(chapter) {
    playStory(chapter.preGame, function() {
        showPreMatchPresentation(chapter, function() {
            // Fire match-start hooks (crowd atmosphere, team loading)
            if (chapter.matchHooks && chapter.matchHooks.onMatchStart) {
                chapter.matchHooks.onMatchStart();
            }

            setScene("MATCH");
            startMatch(chapter, function() {
                // Fire match-end hooks
                if (chapter.matchHooks && chapter.matchHooks.onMatchEnd) {
                    chapter.matchHooks.onMatchEnd();
                }

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
    playStory(chapter.postGame, function() {
        if (chapter.storyAfterMatch) {
            playStory(chapter.storyAfterMatch, function() {
                nextChapter();
            });
        } else {
            nextChapter();
        }
    });
}
