// Training Mode — sandbox match system.
// Completely separate from Story Mode. No story flags, no progression, no consequences.
// Story Mode logic is not touched here.
//
// Flow: Team Selection → Team Management → Match Start

// ── Team Data Structure ───────────────────────────────────────────────────────
// TRAINING_LEAGUE is populated dynamically from data/teams.json on first load.
// Fallback data below is used if the fetch fails (e.g. running without a local server).
// Stats are sourced from the Western League Roster CSV:
//   Defense column → defense stat
//   Midfield column → passing/stamina stats
//   Attack column → speed/shooting stats (as recorded in the uploaded roster data)

var TRAINING_LEAGUE = [
    {
        teamName: "Westward FC",
        color: "blue",
        stadium: "Westward Arena",
        players: [
            { name: "Otto Herrera",   position: "FW", overall: 78, speed: 75, shooting: 75, defense: 70, passing: 72, stamina: 72, isGoalkeeper: false },
            { name: "Reyes",          position: "MF", overall: 74, speed: 70, shooting: 68, defense: 72, passing: 76, stamina: 76, isGoalkeeper: false },
            { name: "Malik",          position: "DF", overall: 72, speed: 68, shooting: 62, defense: 78, passing: 70, stamina: 70, isGoalkeeper: false },
            { name: "Torres",         position: "DF", overall: 71, speed: 67, shooting: 60, defense: 76, passing: 68, stamina: 68, isGoalkeeper: false },
            { name: "Westward GK",    position: "GK", overall: 75, speed: 65, shooting: 55, defense: 80, passing: 65, stamina: 65, isGoalkeeper: true  }
        ]
    },
    {
        teamName: "Northfield FC",
        color: "red",
        stadium: "Northfield Stadium",
        players: [
            { name: "Quinn Lopez",    position: "ST", overall: 89, speed: 86, shooting: 86, defense: 85, passing: 95, stamina: 95, isGoalkeeper: false },
            { name: "Alex Smith",     position: "LB", overall: 89, speed: 93, shooting: 93, defense: 89, passing: 86, stamina: 86, isGoalkeeper: false },
            { name: "Jamie Wilson",   position: "RB", overall: 88, speed: 93, shooting: 93, defense: 83, passing: 87, stamina: 87, isGoalkeeper: false },
            { name: "Casey Davis",    position: "RM", overall: 79, speed: 85, shooting: 85, defense: 72, passing: 81, stamina: 81, isGoalkeeper: false },
            { name: "Morgan Brown",   position: "GK", overall: 84, speed: 83, shooting: 83, defense: 89, passing: 81, stamina: 81, isGoalkeeper: true  }
        ]
    },
    {
        teamName: "Silverton FC",
        color: "silver",
        stadium: "Silverton Stadium",
        players: [
            { name: "Quinn Davis",    position: "ST", overall: 75, speed: 77, shooting: 77, defense: 75, passing: 92, stamina: 92, isGoalkeeper: false },
            { name: "Taylor Davis",   position: "CF", overall: 78, speed: 77, shooting: 77, defense: 73, passing: 85, stamina: 85, isGoalkeeper: false },
            { name: "Jamie Lopez",    position: "RM", overall: 80, speed: 87, shooting: 87, defense: 71, passing: 81, stamina: 81, isGoalkeeper: false },
            { name: "Jordan Davis",   position: "CF", overall: 75, speed: 73, shooting: 73, defense: 80, passing: 72, stamina: 72, isGoalkeeper: false },
            { name: "Casey Garcia",   position: "GK", overall: 82, speed: 88, shooting: 88, defense: 67, passing: 90, stamina: 90, isGoalkeeper: true  }
        ]
    }
];

// Flag to avoid fetching teams.json more than once per session
var _teamsDataLoaded = false;

// Load team data from data/teams.json and populate TRAINING_LEAGUE.
// Calls onReady() when complete (whether fetch succeeded or not).
function _loadTeamsData(onReady) {
    if (_teamsDataLoaded) { if (onReady) onReady(); return; }
    fetch("data/teams.json")
        .then(function(r) { return r.json(); })
        .then(function(teamsJson) {
            var loaded = teamsJson.map(function(t) {
                return {
                    teamName: t.name,
                    color: t.id === "westward" ? "blue" : t.color,
                    stadium: t.stadium,
                    players: t.players
                };
            });
            if (loaded.length > 0) {
                TRAINING_LEAGUE = loaded;
                _teamsDataLoaded = true;
            }
            if (onReady) onReady();
        })
        .catch(function() {
            // Fetch failed (e.g. running from file://) — keep fallback data
            _teamsDataLoaded = true;
            if (onReady) onReady();
        });
}

// Available formations (4 outfield players + 1 GK = 5 total per team)
var TRAINING_FORMATIONS = [
    { key: "2-2", label: "2-2 (Balanced)" },
    { key: "3-1", label: "3-1 (Defensive)" },
    { key: "1-3", label: "1-3 (Attacking)" }
];

// ── Training state ────────────────────────────────────────────────────────────

var _trainingState = {
    playerTeamIndex: 0,        // index into TRAINING_LEAGUE
    opponentTeamIndex: 1,      // default: Northfield
    playerLineup: [],          // selected player indices for player team
    opponentLineup: [],        // selected player indices for opponent team
    playerFormation: "2-2",
    opponentFormation: "2-2"
};

// ── STEP 1: Team Selection Screen ─────────────────────────────────────────────

function showTrainingTeamSelect() {
    setScene("PRE_MATCH");

    // Show loading state while team data is fetched, then render the selection screen
    if (!_teamsDataLoaded) {
        screen.innerHTML = "<div class=\"training-screen\"><div class=\"training-title\">Loading Teams\u2026</div></div>";
        _loadTeamsData(function() { _renderTrainingTeamSelect(); });
        return;
    }
    _renderTrainingTeamSelect();
}

function _renderTrainingTeamSelect() {
    var state = _trainingState;
    state.playerTeamIndex = 0;
    state.opponentTeamIndex = 1;

    function render() {
        screen.innerHTML = "";
        var wrap = document.createElement("div");
        wrap.className = "training-screen";

        var title = document.createElement("div");
        title.className = "training-title";
        title.textContent = "Training Mode \u2014 Team Selection";
        wrap.appendChild(title);

        var panels = document.createElement("div");
        panels.className = "training-team-select";

        // Player Team Panel
        var playerPanel = _buildTeamSelectPanel(
            "Your Team",
            state.playerTeamIndex,
            function(idx) {
                if (idx === state.opponentTeamIndex) return; // prevent same team
                state.playerTeamIndex = idx;
                render();
            }
        );
        panels.appendChild(playerPanel);

        // Opponent Team Panel
        var oppPanel = _buildTeamSelectPanel(
            "Opponent Team",
            state.opponentTeamIndex,
            function(idx) {
                if (idx === state.playerTeamIndex) return; // prevent same team
                state.opponentTeamIndex = idx;
                render();
            }
        );
        panels.appendChild(oppPanel);
        wrap.appendChild(panels);

        var actions = document.createElement("div");
        actions.className = "training-actions";

        var nextBtn = document.createElement("button");
        nextBtn.className = "training-start-btn";
        nextBtn.textContent = "Select Players \u25b6";
        nextBtn.onclick = function() {
            showTrainingTeamManagement();
        };
        actions.appendChild(nextBtn);

        var backBtn = document.createElement("button");
        backBtn.className = "training-back-btn";
        backBtn.textContent = "\u25c0 Back";
        backBtn.onclick = function() { showMainMenu(); };
        actions.appendChild(backBtn);

        wrap.appendChild(actions);
        screen.appendChild(wrap);
    }

    render();
}

function _buildTeamSelectPanel(heading, selectedIndex, onSelect) {
    var panel = document.createElement("div");
    panel.className = "training-team-panel";

    var h3 = document.createElement("h3");
    h3.textContent = heading;
    panel.appendChild(h3);

    TRAINING_LEAGUE.forEach(function(team, idx) {
        var btn = document.createElement("button");
        btn.className = "training-team-option" + (idx === selectedIndex ? " selected" : "");
        btn.textContent = team.teamName;
        btn.onclick = function() { onSelect(idx); };
        panel.appendChild(btn);
    });

    return panel;
}

// ── STEP 2: Team Management Screen ────────────────────────────────────────────

function showTrainingTeamManagement() {
    setScene("PRE_MATCH");

    var state = _trainingState;
    var pTeam = TRAINING_LEAGUE[state.playerTeamIndex];
    var oTeam = TRAINING_LEAGUE[state.opponentTeamIndex];

    // Reset lineup selections
    state.playerLineup = [];
    state.opponentLineup = [];
    state.playerFormation = "2-2";
    state.opponentFormation = "2-2";

    function validate() {
        var pOk = _lineupValid(state.playerLineup, pTeam);
        var oOk = _lineupValid(state.opponentLineup, oTeam);
        return { pOk: pOk, oOk: oOk, allOk: pOk.valid && oOk.valid };
    }

    function render() {
        screen.innerHTML = "";
        var wrap = document.createElement("div");
        wrap.className = "training-screen";

        var title = document.createElement("div");
        title.className = "training-title";
        title.textContent = "Training Mode \u2014 Select Players";
        wrap.appendChild(title);

        var row = document.createElement("div");
        row.className = "training-management";

        row.appendChild(_buildMgmtPanel(pTeam, state.playerLineup, state, "player", function() { render(); }));
        row.appendChild(_buildMgmtPanel(oTeam, state.opponentLineup, state, "opponent", function() { render(); }));

        wrap.appendChild(row);

        // Formation selection row
        var fmtRow = document.createElement("div");
        fmtRow.style.cssText = "display:flex;gap:40px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;";

        fmtRow.appendChild(_buildFormationPanel("Your Formation", state.playerFormation, function(key) {
            state.playerFormation = key; render();
        }));
        fmtRow.appendChild(_buildFormationPanel("Opponent Formation", state.opponentFormation, function(key) {
            state.opponentFormation = key; render();
        }));
        wrap.appendChild(fmtRow);

        // Validation warning
        var v = validate();
        var warning = document.createElement("div");
        warning.className = "training-warning";
        if (!v.pOk.valid) {
            warning.textContent = "Your team: " + v.pOk.reason;
        } else if (!v.oOk.valid) {
            warning.textContent = "Opponent: " + v.oOk.reason;
        }
        wrap.appendChild(warning);

        var actions = document.createElement("div");
        actions.className = "training-actions";

        var startBtn = document.createElement("button");
        startBtn.className = "training-start-btn";
        startBtn.textContent = "\u25b6 Start Match";
        startBtn.disabled = !v.allOk;
        startBtn.onclick = function() {
            if (!v.allOk) return;
            _launchTrainingMatch();
        };
        actions.appendChild(startBtn);

        var backBtn = document.createElement("button");
        backBtn.className = "training-back-btn";
        backBtn.textContent = "\u25c0 Back";
        backBtn.onclick = function() { showTrainingTeamSelect(); };
        actions.appendChild(backBtn);

        wrap.appendChild(actions);
        screen.appendChild(wrap);
    }

    render();
}

function _buildMgmtPanel(team, lineup, state, side, onChange) {
    var panel = document.createElement("div");
    panel.className = "training-mgmt-panel";

    var h3 = document.createElement("h3");
    h3.textContent = team.teamName;
    panel.appendChild(h3);

    var v = _lineupValid(lineup, team);
    var counter = document.createElement("div");
    counter.className = "training-mgmt-counter" + (v.valid ? "" : " invalid");
    var gkSel = lineup.some(function(i) { return team.players[i].isGoalkeeper; });
    counter.textContent = lineup.length + "/5 selected  |  GK: " + (gkSel ? "YES" : "NO");
    panel.appendChild(counter);

    team.players.forEach(function(player, idx) {
        var row = document.createElement("div");
        var sel = lineup.indexOf(idx) !== -1;
        row.className = "training-player-row" + (sel ? " selected" : "");

        var pos = document.createElement("span");
        pos.className = "training-player-pos " + (player.isGoalkeeper ? "gk" : "field");
        pos.textContent = player.position;
        row.appendChild(pos);

        var name = document.createElement("span");
        name.className = "training-player-name";
        name.textContent = player.name;
        row.appendChild(name);

        // Show overall rating when available
        if (player.overall !== null && player.overall !== undefined) {
            var ovr = document.createElement("span");
            ovr.className = "training-player-ovr";
            ovr.textContent = player.overall;
            row.appendChild(ovr);
        }

        var check = document.createElement("span");
        check.className = "training-player-check";
        check.textContent = "\u2714";
        row.appendChild(check);

        row.onclick = function() {
            var i = lineup.indexOf(idx);
            if (i !== -1) {
                lineup.splice(i, 1);
            } else if (lineup.length < 5) {
                lineup.push(idx);
            }
            onChange();
        };

        panel.appendChild(row);
    });

    return panel;
}

function _buildFormationPanel(label, selectedKey, onSelect) {
    var panel = document.createElement("div");
    panel.style.cssText = "display:flex;flex-direction:column;align-items:center;";

    var lbl = document.createElement("div");
    lbl.style.cssText = "font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#67f3ff;margin-bottom:8px;";
    lbl.textContent = label;
    panel.appendChild(lbl);

    var btns = document.createElement("div");
    btns.className = "training-formation-row";

    TRAINING_FORMATIONS.forEach(function(f) {
        var btn = document.createElement("button");
        btn.className = "training-formation-btn" + (f.key === selectedKey ? " selected" : "");
        btn.textContent = f.label;
        btn.onclick = function() { onSelect(f.key); };
        btns.appendChild(btn);
    });

    panel.appendChild(btns);
    return panel;
}

// ── Validation ────────────────────────────────────────────────────────────────

function _lineupValid(lineup, team) {
    if (lineup.length !== 5) {
        return { valid: false, reason: "Select exactly 5 players (" + lineup.length + "/5)." };
    }
    var hasGK = lineup.some(function(i) { return team.players[i].isGoalkeeper; });
    if (!hasGK) {
        return { valid: false, reason: "You must select 1 goalkeeper." };
    }
    return { valid: true, reason: "" };
}

// ── STEP 3: Launch Match ──────────────────────────────────────────────────────

function _launchTrainingMatch() {
    var state = _trainingState;
    var oTeam = TRAINING_LEAGUE[state.opponentTeamIndex];

    // If opponent lineup is empty, auto-select top 5 (GK + 4 field players by order)
    if (state.opponentLineup.length === 0) {
        state.opponentLineup = _autoSelectLineup(oTeam);
    }

    // currentFormation is a global defined in soccerEngine.js; apply training selection
    if (typeof currentFormation !== "undefined") {
        currentFormation = state.playerFormation;
    }

    setScene("MATCH");
    // Pass null so the engine treats this as a non-story match (no insulin/XP hooks)
    startMatch(null, function() {
        _showTrainingPostMatch();
    });
}

function _showTrainingPostMatch() {
    setScene("PRE_MATCH");
    screen.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "training-screen";
    wrap.style.justifyContent = "center";

    var title = document.createElement("div");
    title.className = "training-title";
    title.textContent = "Match Complete";
    wrap.appendChild(title);

    var actions = document.createElement("div");
    actions.className = "training-actions";
    actions.style.marginTop = "30px";

    var againBtn = document.createElement("button");
    againBtn.className = "training-start-btn";
    againBtn.textContent = "\u21ba Play Again";
    againBtn.onclick = function() { showTrainingTeamManagement(); };
    actions.appendChild(againBtn);

    var newBtn = document.createElement("button");
    newBtn.className = "training-back-btn";
    newBtn.textContent = "\u21b0 Change Teams";
    newBtn.onclick = function() { showTrainingTeamSelect(); };
    actions.appendChild(newBtn);

    var menuBtn = document.createElement("button");
    menuBtn.className = "training-back-btn";
    menuBtn.textContent = "\u2302 Main Menu";
    menuBtn.onclick = function() { showMainMenu(); };
    actions.appendChild(menuBtn);

    wrap.appendChild(actions);
    screen.appendChild(wrap);
}

// Auto-select: pick GK first, then first 4 field players
function _autoSelectLineup(team) {
    var lineup = [];
    var gkIdx = -1;
    var fieldIdxs = [];

    team.players.forEach(function(p, i) {
        if (p.isGoalkeeper && gkIdx === -1) { gkIdx = i; }
        else { fieldIdxs.push(i); }
    });

    if (gkIdx !== -1) lineup.push(gkIdx);
    for (var i = 0; i < fieldIdxs.length && lineup.length < 5; i++) {
        lineup.push(fieldIdxs[i]);
    }
    return lineup;
}
