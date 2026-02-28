let canvas, ctx;
let ball;
let players = [];
let aiPlayers = [];
let goalies = { player: null, ai: null };
let score = { player: 0, ai: 0 };
let matchRunning = false;
let onMatchComplete = null;
let matchPaused = false;
let pauseMenuEl = null;
let matchClock = 180;
let goaliePossessionTimer = 0;
let playerGoaliePossessionTimer = 0;
const GOALIE_AUTO_PASS_DELAY = 2; // seconds before a goalie auto-passes

let tackleCooldown = 0;
let tackleActive = false;
let tackleTimer = 0;
const TACKLE_RANGE = 26;
const TACKLE_DURATION = 12;
const TACKLE_COOLDOWN_FRAMES = 40;

const FIELD = {
    width: 1400,
    height: 820,
    goalTop: 290,
    goalBottom: 530,
    leftGoalX: 60,
    rightGoalX: 1340,
    leftPostTop: { x: 60, y: 290 },
    leftPostBottom: { x: 60, y: 530 },
    rightPostTop: { x: 1340, y: 290 },
    rightPostBottom: { x: 1340, y: 530 },
    playerBox: { x: 0, y: 310, w: 110, h: 200 },
    aiBox: { x: 1290, y: 310, w: 110, h: 200 }
};

const FORMATION_Y = [170, 320, 500, 650];
const AI_HOME = [
    { x: 1030, y: 180 },
    { x: 930, y: 340 },
    { x: 930, y: 500 },
    { x: 1080, y: 650 }
];

// Formation definitions for 4-player teams (2-2, 3-1, 1-3)
const FORMATIONS = {
    "2-2": {
        label: "2-2 Balanced",
        playerHome: [
            { x: 290, y: 240 }, { x: 290, y: 580 },
            { x: 480, y: 300 }, { x: 480, y: 520 }
        ],
        aiHome: [
            { x: 1110, y: 240 }, { x: 1110, y: 580 },
            { x: 920,  y: 300 }, { x: 920,  y: 520 }
        ]
    },
    "3-1": {
        label: "3-1 Defensive",
        playerHome: [
            { x: 260, y: 200 }, { x: 260, y: 410 }, { x: 260, y: 620 },
            { x: 490, y: 410 }
        ],
        aiHome: [
            { x: 1140, y: 200 }, { x: 1140, y: 410 }, { x: 1140, y: 620 },
            { x: 910,  y: 410 }
        ]
    },
    "1-3": {
        label: "1-3 Attacking",
        playerHome: [
            { x: 260, y: 410 },
            { x: 460, y: 190 }, { x: 490, y: 410 }, { x: 460, y: 630 }
        ],
        aiHome: [
            { x: 1140, y: 410 },
            { x: 940,  y: 190 }, { x: 910, y: 410 }, { x: 940, y: 630 }
        ]
    }
};
let currentFormation = "2-2";

const input = { up: false, down: false, left: false, right: false };

const possession = { owner: null, team: null, lockTimer: 0, pickupCooldown: 0 };
const passAssist = { target: null, timer: 0 };

const controlState = { dirX: 1, dirY: 0 };

const shotState = { held: false, charge: 0, maxCharge: 90, aimX: 1, aimY: 0 };
const passState = { held: false, charge: 0, maxCharge: 60 };

const PASS_ASSIST_COLOR = "#66aaff";
const PASS_TARGET_RADIUS_OFFSET = 9;
const PASS_ASSIST_STEER_RANGE = 220;    // px: distance within which magnetic steering is active
const PASS_ASSIST_STEER_STRENGTH = 0.06; // subtle curve per frame toward intended recipient

// Goalie save constants
const GOALIE_CATCH_LOCK_DURATION = 18; // frames ball is held after a save (~0.3s at 60fps)
const GOAL_MOUTH_BUFFER = 4;           // px: keeps ball from embedding inside goal mouth
// Minimum rightward directional component required to shoot toward the right goal
const MIN_SHOOTING_DIR_X = 0.2;
// Pickup radius offset for AI outfield players collecting a loose ball
const AI_OUTFIELD_PICKUP_RADIUS = 14;

function showFormationSelect(onSelect) {
    screen.innerHTML = "";
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.gap = "10px";
    div.innerHTML = `<h2 style="margin-bottom:6px">Select Formation</h2><p style="margin:0 0 8px">Choose your team shape (4 players):</p>`;
    Object.entries(FORMATIONS).forEach(([key, f]) => {
        const btn = document.createElement("button");
        btn.textContent = f.label + (key === currentFormation ? " [selected]" : "");
        btn.onclick = () => { currentFormation = key; onSelect(); };
        div.appendChild(btn);
    });
    screen.appendChild(div);
}

function startMatch(chapter, done) {
    onMatchComplete = done || null;
    showFormationSelect(() => {
        screen.innerHTML = "";
        canvas = document.createElement("canvas");
        canvas.width = FIELD.width;
        canvas.height = FIELD.height;
        screen.appendChild(canvas);
        ctx = canvas.getContext("2d");

        initMatch();
        matchPaused = false;
        removePauseMenu();
        matchRunning = true;
        requestAnimationFrame(gameLoop);
    });
}

function initMatch() {
    ball = { x: FIELD.width / 2, y: FIELD.height / 2, vx: 0, vy: 0, radius: 7 };
    players = [];
    aiPlayers = [];
    score = { player: 0, ai: 0 };
    possession.owner = null;
    possession.team = null;
    possession.lockTimer = 0;
    possession.pickupCooldown = 0;
    passAssist.target = null;
    passAssist.timer = 0;
    matchClock = 180;
    goaliePossessionTimer = 0;
    playerGoaliePossessionTimer = 0;
    shotState.held = false;
    shotState.charge = 0;
    shotState.aimX = 1;
    shotState.aimY = 0;
    passState.held = false;
    passState.charge = 0;
    tackleCooldown = 0;
    tackleActive = false;
    tackleTimer = 0;

    const formation = FORMATIONS[currentFormation] || FORMATIONS["2-2"];
    for (let i = 0; i < 4; i++) {
        const ph = formation.playerHome[i];
        const ah = formation.aiHome[i];
        players.push({ x: ph.x, y: ph.y, baseSpeed: 3.8, speed: 3.8, stamina: 100, r: 15, team: "player" });
        aiPlayers.push({
            x: ah.x,
            y: ah.y,
            baseSpeed: 1.7,
            speed: 1.7,
            stamina: 100,
            r: 15,
            team: "ai",
            tackleCooldown: 0
        });
    }

    goalies.player = { x: 78, y: FIELD.height / 2, r: 17, speed: 2.95, box: FIELD.playerBox, team: "player", reactionTimer: 0, errorY: 0, diveTimer: 0, diveDir: 0 };
    goalies.ai = { x: 1322, y: FIELD.height / 2, r: 17, speed: 2.95, box: FIELD.aiBox, team: "ai", reactionTimer: 0, errorY: 0, diveTimer: 0, diveDir: 0 };
}

function gameLoop() {
    if (!matchRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (matchPaused) return;

    if (possession.lockTimer > 0) possession.lockTimer--;
    if (possession.pickupCooldown > 0) possession.pickupCooldown--;
    if (passAssist.timer > 0) passAssist.timer--;

    if (tackleCooldown > 0) tackleCooldown--;
    if (tackleActive) {
        tackleTimer++;
        if (tackleTimer > TACKLE_DURATION) {
            tackleActive = false;
            tackleTimer = 0;
        }
        attemptTackle();
    }

    if (shotState.held) {
        shotState.charge = Math.min(shotState.maxCharge, shotState.charge + 1);
        shotState.aimX = controlState.dirX;
        shotState.aimY = controlState.dirY;
    }
    if (passState.held) {
        passState.charge = Math.min(passState.maxCharge, passState.charge + 1);
    }

    matchClock = Math.max(0, matchClock - (1 / 60));

    moveControlledPlayer();

    players.forEach(p => {
        if (!p.baseSpeed) return;
        const moving = input.up || input.down || input.left || input.right;
        if (moving && players[0] === p) {
            p.stamina -= 0.15;
        } else {
            p.stamina += 0.08;
        }
        p.stamina = clamp(p.stamina, 0, 100);
        const fatigueFactor = 0.6 + (p.stamina / 100) * 0.4;
        p.speed = p.baseSpeed * fatigueFactor;
    });

    updatePlayerOutfield();
    updateAIOutfield();
    updateGoalie(goalies.player);
    updateGoalie(goalies.ai);

    updatePlayerPossession();
    updatePassAssistCapture();
    updatePlayerGoaliePossession();

    // Auto-switch controlled player to nearest when ball is loose.
    // Suppress while a pass assist is in flight so control stays on the intended recipient.
    if (!possession.owner && possession.pickupCooldown <= 0 && passAssist.timer <= 0 && players.length > 1) {
        let nearestIdx = 0;
        let nearestDist = distance(players[0].x, players[0].y, ball.x, ball.y);
        for (let i = 1; i < players.length; i++) {
            const d = distance(players[i].x, players[i].y, ball.x, ball.y);
            if (d < nearestDist - PLAYER_SWITCH_HYSTERESIS) {
                nearestDist = d;
                nearestIdx = i;
            }
        }
        if (nearestIdx > 0) {
            players.unshift(...players.splice(nearestIdx, 1));
        }
    }

    if (possession.owner) {
        carryBallWithOwner();
    } else {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Magnetic steering: subtly curve ball toward the intended pass recipient
        if (passAssist.target) {
            const target = passAssist.target;
            const dx = target.x - ball.x;
            const dy = target.y - ball.y;
            const dist = Math.hypot(dx, dy);
            if (dist < PASS_ASSIST_STEER_RANGE) {
                ball.vx += dx * PASS_ASSIST_STEER_STRENGTH / dist;
                ball.vy += dy * PASS_ASSIST_STEER_STRENGTH / dist;
            }
        }
    }

    handleFieldBoundariesAndPosts();
    detectGoals();

    if (!possession.owner) {
        ball.vx *= 0.97;
        ball.vy *= 0.97;
        if (Math.abs(ball.vx) < 0.03) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.03) ball.vy = 0;
    }

    if (matchClock <= 0) {
        endMatch("Time Up");
        return;
    }

    if (score.player >= 3 || score.ai >= 3) endMatch();
}

function moveControlledPlayer() {
    const selected = players[0];
    if (!selected) return;

    let dx = 0;
    let dy = 0;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;

    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        const nx = dx / len;
        const ny = dy / len;
        selected.x += nx * selected.speed;
        selected.y += ny * selected.speed;
        controlState.dirX = nx;
        controlState.dirY = ny;
    }

    selected.x = clamp(selected.x, selected.r, FIELD.width - selected.r);
    selected.y = clamp(selected.y, selected.r, FIELD.height - selected.r);
}

// Spread offsets for attack support (per teammate index 1..3)
const ATTACK_OFFSETS = [
    { dx: 160, dy: -150 },
    { dx: 200, dy:    0 },
    { dx: 160, dy:  150 }
];

// Defensive shape constants for player outfield teammates
const DEFENSIVE_BASE_X   = 350;
const DEFENSIVE_SPREAD_X = 80;
const DEFENSIVE_MIN_X    = 200;
const DEFENSIVE_MAX_X    = 520;
// Factor to pull defenders back toward their own half relative to formation home X
const DEFENSIVE_PULLBACK_FACTOR = 0.88;

// How far the ball can be before the goalie fully centres on the goal-mouth
const GOALIE_MAX_TRACK_DIST = 900;
// Ball prediction lookahead frames: shot vs normal
const GOALIE_SHOT_LOOKAHEAD   = 10;
const GOALIE_NORMAL_LOOKAHEAD = 4;

// Controls how inaccurately the AI goalie reads the player's shot aim (higher = easier to fake)
const GOALIE_AIM_READ_NOISE = 140;
// Controls how much the AI goalie anticipates the aimed corner vs reacting to ball position
const GOALIE_AIM_READ_WEIGHT = 0.55;

// Hysteresis distance for auto-switching controlled player (prevents rapid flickering)
const PLAYER_SWITCH_HYSTERESIS = 25;

function updatePlayerOutfield() {
    const carrier = possession.team === "player" ? possession.owner : null;
    const aiHasBall = possession.team === "ai" && possession.owner !== null;

    for (let i = 1; i < players.length; i++) {
        const p = players[i];
        let targetX, targetY;

        if (carrier && players.includes(carrier)) {
            // Attacking: spread around the carrier to create passing lanes
            const off = ATTACK_OFFSETS[i - 1] || { dx: 140, dy: (i - 2) * 160 };
            targetX = clamp(carrier.x + off.dx, 200, FIELD.width - 250);
            targetY = clamp(carrier.y + off.dy, 60, FIELD.height - 60);
        } else if (aiHasBall) {
            // Defending: pull back toward formation home in defensive half
            const fHome = (FORMATIONS[currentFormation] || FORMATIONS["2-2"]).playerHome[i] || { x: DEFENSIVE_BASE_X, y: FORMATION_Y[i] };
            targetX = clamp(fHome.x * DEFENSIVE_PULLBACK_FACTOR, DEFENSIVE_MIN_X, DEFENSIVE_MAX_X);
            targetY = fHome.y;
        } else {
            // Ball loose: hold formation home positions
            const fHome = (FORMATIONS[currentFormation] || FORMATIONS["2-2"]).playerHome[i] || { x: 300, y: FORMATION_Y[i] };
            targetX = fHome.x;
            targetY = fHome.y;
        }

        const to = normalize(targetX - p.x, targetY - p.y);
        const dist = distance(p.x, p.y, targetX, targetY);
        if (dist > 6) {
            p.x += to.x * p.speed;
            p.y += to.y * p.speed;
        }
        p.x = clamp(p.x, p.r, FIELD.width - p.r);
        p.y = clamp(p.y, p.r, FIELD.height - p.r);
    }
}

function updateAIOutfield() {
    const aiCarrier = possession.team === "ai" ? possession.owner : null;
    const playerCarrier = possession.team === "player" ? possession.owner : null;

    const pressAgent = aiPlayers.reduce((best, p) => {
        const d = distance(p.x, p.y, playerCarrier ? playerCarrier.x : ball.x, playerCarrier ? playerCarrier.y : ball.y);
        if (!best || d < best.d) return { p, d };
        return best;
    }, null)?.p;

    aiPlayers.forEach((p, i) => {
        p.stamina -= 0.05;
        p.stamina = clamp(p.stamina, 50, 100);
        const fatigue = 0.7 + (p.stamina / 100) * 0.3;
        p.speed = p.baseSpeed * fatigue;

        const aiFormHome = (FORMATIONS[currentFormation] || FORMATIONS["2-2"]).aiHome[i] || AI_HOME[i];
        let targetX = aiFormHome.x;
        let targetY = aiFormHome.y;

        if (p === pressAgent) {
            targetX = playerCarrier ? playerCarrier.x : ball.x;
            targetY = playerCarrier ? playerCarrier.y : ball.y;
        } else if (playerCarrier) {
            // Defensive shape: cut passing lanes
            const laneX = clamp(playerCarrier.x + 180, 700, 1200);
            const verticalSpread = (i - 1.5) * 130;

            targetX = laneX;
            targetY = clamp(playerCarrier.y + verticalSpread, 80, FIELD.height - 80);
        } else if (aiCarrier && p !== aiCarrier) {
            // Support diagonally instead of stacking
            const supportX = clamp(aiCarrier.x - 140, 600, 1100);
            const sideOffset = (i % 2 === 0 ? -1 : 1) * 120;
            const supportY = clamp(aiCarrier.y + sideOffset, 90, FIELD.height - 90);

            targetX = supportX;
            targetY = supportY;
        }

        const to = normalize(targetX - p.x, targetY - p.y);
        p.x += to.x * p.speed;
        p.y += to.y * p.speed;
        p.x = clamp(p.x, p.r, FIELD.width - p.r);
        p.y = clamp(p.y, p.r, FIELD.height - p.r);

        if (playerCarrier && possession.lockTimer <= 0) {
            if (p.tackleCooldown > 0) {
                p.tackleCooldown--;
            } else {
                const d = distance(p.x, p.y, playerCarrier.x, playerCarrier.y);
                if (d < p.r + playerCarrier.r + TACKLE_RANGE) {
                    if (Math.random() < 0.55) {
                        possession.owner = p;
                        possession.team = "ai";
                        possession.lockTimer = 15;
                        ball.vx = 0;
                        ball.vy = 0;
                    } else {
                        possession.owner = null;
                        possession.team = null;
                        ball.vx = (Math.random() - 0.5) * 6;
                        ball.vy = (Math.random() - 0.5) * 6;
                    }
                    p.tackleCooldown = TACKLE_COOLDOWN_FRAMES;
                }
            }
        }
    });

    // AI outfield loose-ball pickup (mirrors player's updatePlayerPossession)
    if (!possession.owner && possession.pickupCooldown <= 0) {
        for (const p of aiPlayers) {
            if (distance(p.x, p.y, ball.x, ball.y) < p.r + AI_OUTFIELD_PICKUP_RADIUS) {
                possession.owner = p;
                possession.team = "ai";
                possession.lockTimer = 20;
                ball.vx = 0;
                ball.vy = 0;
                break;
            }
        }
    }

    if (possession.team !== "ai" || !possession.owner) {
        goaliePossessionTimer = 0;
        return;
    }

    const carrier = possession.owner;

    if (carrier === goalies.ai) {
        goaliePossessionTimer += 1 / 60;
        if (goaliePossessionTimer < GOALIE_AUTO_PASS_DELAY) return;

        // Pick the teammate with the most space around them
        let bestTarget = aiPlayers[0];
        let maxSpace = -Infinity;
        for (const mate of aiPlayers) {
            const space = distanceToNearestOpponent(mate);
            if (space > maxSpace) {
                maxSpace = space;
                bestTarget = mate;
            }
        }
        const outlet = bestTarget || aiPlayers[0];
        if (outlet) {
            const outletDir = normalize(outlet.x - carrier.x, outlet.y - carrier.y);
            const aiOutletSpeed = 8.5;
            releasePossession(outletDir.x * aiOutletSpeed, outletDir.y * aiOutletSpeed);
        }
        goaliePossessionTimer = 0;
        return;
    }

    goaliePossessionTimer = 0;

    const nearGoalX = carrier.x <= 420;
    const inShotLane = carrier.y > FIELD.goalTop - 20 && carrier.y < FIELD.goalBottom + 20;
    const nearestPlayerDef = players.reduce((best, pl) => Math.min(best, distance(pl.x, pl.y, carrier.x, carrier.y)), Infinity);

    const goalTargetY = clamp(FIELD.height / 2 + (Math.random() - 0.5) * 70, FIELD.goalTop + 10, FIELD.goalBottom - 10);
    const drive = normalize(FIELD.leftGoalX - carrier.x, goalTargetY - carrier.y);
    carrier.x += drive.x * 1.55;
    carrier.y += drive.y * 0.95;

    if (nearGoalX && inShotLane && (nearestPlayerDef > 85 || Math.random() < 0.35)) {
        const targetY = clamp(carrier.y + (Math.random() - 0.5) * 46, FIELD.goalTop + 12, FIELD.goalBottom - 12);
        const shotDir = normalize(FIELD.leftGoalX - ball.x, targetY - ball.y);
        releasePossession(shotDir.x * 20.5, shotDir.y * 7.5);
        return;
    }

    const bestMate = findBestAIPassTarget(carrier);
    if (!bestMate) return;

    const laneGain = (carrier.x - bestMate.x);
    const shouldPass = (nearestPlayerDef < 95 && Math.random() < 0.24) || (laneGain > 35 && Math.random() < 0.16);
    if (shouldPass) {
        const passDir = normalize(bestMate.x - carrier.x, bestMate.y - carrier.y);
        const aiPassSpeed = 7.8;
        releasePossession(passDir.x * aiPassSpeed, passDir.y * aiPassSpeed);
        possession.owner = bestMate;
        possession.team = "ai";
        possession.lockTimer = 10;
    }
}

function goalieAutoPassToPlayer() {
    const goalie = goalies.player;
    let bestTarget = null;
    let maxSpace = -Infinity;
    for (const mate of players) {
        const space = distanceToNearestOpponent(mate);
        if (space > maxSpace) {
            maxSpace = space;
            bestTarget = mate;
        }
    }
    if (!bestTarget) return;
    const dir = normalize(bestTarget.x - goalie.x, bestTarget.y - goalie.y);
    releasePossession(dir.x * 15.0, dir.y * 13.0);
    passAssist.target = bestTarget;
    passAssist.timer = 40;
    playerGoaliePossessionTimer = 0;
}

function updatePlayerGoaliePossession() {
    if (possession.team !== "player" || possession.owner !== goalies.player) {
        playerGoaliePossessionTimer = 0;
        return;
    }
    // Reset timer while the player is actively pressing direction keys (lining up a pass)
    if (input.up || input.down || input.left || input.right) {
        playerGoaliePossessionTimer = 0;
        return;
    }
    playerGoaliePossessionTimer += 1 / 60;
    if (playerGoaliePossessionTimer < GOALIE_AUTO_PASS_DELAY) return;
    goalieAutoPassToPlayer();
}

function isClosestAIToBall(player) {
    let best = null;
    let bestD = Infinity;
    aiPlayers.forEach(p => {
        const d = distance(p.x, p.y, ball.x, ball.y);
        if (d < bestD) {
            bestD = d;
            best = p;
        }
    });
    return best === player;
}

function findBestAIPassTarget(carrier) {
    let best = null;
    let bestScore = -Infinity;

    aiPlayers.forEach(p => {
        if (p === carrier) return;
        const vx = p.x - carrier.x;
        const vy = p.y - carrier.y;
        const dist = Math.hypot(vx, vy);
        if (dist < 70 || dist > 340) return;

        const forward = carrier.x - p.x;
        const central = 1 - Math.min(1, Math.abs(p.y - FIELD.height / 2) / 250);
        const pressure = players.reduce((bestD, pl) => Math.min(bestD, distance(pl.x, pl.y, p.x, p.y)), Infinity);

        const score = forward * 1.4 + central * 70 + pressure * 0.55 - dist * 0.22;
        if (score > bestScore) {
            bestScore = score;
            best = p;
        }
    });

    return best;
}

function findBestAIAttacker() {
    let best = aiPlayers[0] || null;
    let bestScore = -Infinity;

    aiPlayers.forEach(p => {
        const toGoalX = p.x - FIELD.leftGoalX;
        const centerBias = 1 - Math.min(1, Math.abs(p.y - FIELD.height / 2) / 260);
        const scoreValue = toGoalX * 0.9 + centerBias * 120;
        if (scoreValue > bestScore) {
            bestScore = scoreValue;
            best = p;
        }
    });

    return best;
}

function updateGoalie(goalie) {
    if (goalie.reactionTimer > 0) {
        goalie.reactionTimer--;
    } else {
        goalie.reactionTimer = 12 + Math.floor(Math.random() * 16);
        goalie.errorY = (Math.random() - 0.5) * 58;
    }

    // Detect if a shot is incoming toward this goalie's goal
    const shotIncoming = (goalie.team === "player" && ball.vx < -7) ||
                         (goalie.team === "ai" && ball.vx > 7);

    const predictedY = ball.y + ball.vy * (shotIncoming ? GOALIE_SHOT_LOOKAHEAD : GOALIE_NORMAL_LOOKAHEAD) + goalie.errorY;
    const ballDist = distance(goalie.x, goalie.y, ball.x, ball.y);

    // Each goalie only fully tracks the ball when it is a threat to their own goal
    const ballHeadingTowardsGoal = (goalie.team === "player" && ball.vx <= 0) ||
                                   (goalie.team === "ai" && ball.vx >= 0);
    const distWeight = clamp(1 - ballDist / GOALIE_MAX_TRACK_DIST, 0.25, 1);
    const trackWeight = ballHeadingTowardsGoal
        ? clamp(distWeight + (shotIncoming ? 0.3 : 0), 0.25, 1)
        : distWeight * 0.4;

    const centreY = FIELD.height / 2;
    let blendedY = centreY + (predictedY - centreY) * trackWeight;

    // AI goalie partially reads player's shot aim so it can be faked
    if (goalie.team === "ai" && shotState.held && possession.team === "player") {
        const aimTargetY = FIELD.height / 2 + shotState.aimY * 130;
        const readNoise = (Math.random() - 0.5) * GOALIE_AIM_READ_NOISE;
        blendedY = blendedY * (1 - GOALIE_AIM_READ_WEIGHT) + (aimTargetY + readNoise) * GOALIE_AIM_READ_WEIGHT;
    }

    const defendY = clamp(blendedY, FIELD.goalTop - 25, FIELD.goalBottom + 25);
    const defendX = goalie.team === "player" ? 85 : 1315;

    const activeSpeed = shotIncoming ? goalie.speed * 2.0 : goalie.speed;
    const to = normalize(defendX - goalie.x, defendY - goalie.y);
    goalie.x += to.x * activeSpeed;
    goalie.y += to.y * activeSpeed;

    if (goalie.diveTimer > 0) {
        goalie.diveTimer--;
        goalie.y += goalie.diveDir * 4.8;
    } else if (shotIncoming && Math.random() < 0.07) {
        goalie.diveTimer = 8 + Math.floor(Math.random() * 7);
        goalie.diveDir = (ball.y < goalie.y) ? -1 : 1;
    } else if (Math.random() < 0.004) {
        goalie.diveTimer = 3 + Math.floor(Math.random() * 4);
        goalie.diveDir = Math.random() < 0.5 ? -1 : 1;
    }

    goalie.x = clamp(goalie.x, goalie.box.x + goalie.r, goalie.box.x + goalie.box.w - goalie.r);
    goalie.y = clamp(goalie.y, goalie.box.y + goalie.r, goalie.box.y + goalie.box.h - goalie.r);

    // Fine-tune Y position based on ball angle (FIFA-style tracking)
    const angleY = clamp(ball.y, FIELD.goalTop + 10, FIELD.goalBottom - 10);
    goalie.y += (angleY - goalie.y) * 0.08;

    // Skip save attempt when the ball was just kicked and is not heading toward this goal.
    // This prevents the goalie from immediately re-catching or deflecting a pass it just made.
    if (possession.pickupCooldown > 0) {
        const headingToGoal = (goalie.team === "player" && ball.vx < -2) ||
                              (goalie.team === "ai"    && ball.vx >  2);
        if (!headingToGoal) return;
    }

    const interactionRadius = goalie.r + 8;
    if (distance(goalie.x, goalie.y, ball.x, ball.y) >= interactionRadius) return;

    // Save probability based on shot speed (arcade-polished: strong shots can beat keeper)
    const shotSpeed = Math.hypot(ball.vx, ball.vy);
    let saveChance;
    if (shotSpeed < 7) {
        saveChance = 0.85; // weak shot — almost always saved
    } else if (shotSpeed < 11) {
        saveChance = 0.55; // normal shot
    } else {
        saveChance = 0.30; // powerful shot — often scores
    }

    // Reduce save chance if ball is far from keeper's body (angled / corner shot)
    const angleOffset = Math.abs(ball.y - goalie.y);
    if (angleOffset > 25) {
        saveChance -= 0.2;
    }

    if (Math.random() < saveChance) {
        possession.owner = goalie;
        possession.team = goalie.team;
        possession.lockTimer = GOALIE_CATCH_LOCK_DURATION;
        ball.vx = 0;
        ball.vy = 0;
    } else {
        // Deflection — ball bounces back into play
        possession.owner = null;
        possession.team = null;
        ball.vx *= -0.6;
        ball.vy *= 0.8;
    }
}

function updatePlayerPossession() {
    const selected = players[0];
    if (!selected) return;
    if (possession.pickupCooldown > 0) return;

    const dist = distance(selected.x, selected.y, ball.x, ball.y);
    if (!possession.owner && dist < selected.r + 18) {
        possession.owner = selected;
        possession.team = "player";
        possession.lockTimer = 24;
        ball.vx = 0;
        ball.vy = 0;
    }
}

function updatePassAssistCapture() {
    if (passAssist.timer <= 0 || !passAssist.target) return;
    if (possession.owner || possession.pickupCooldown > 0) return;

    const d = distance(passAssist.target.x, passAssist.target.y, ball.x, ball.y);
    if (d > passAssist.target.r + 28) return;

    possession.owner = passAssist.target;
    possession.team = "player";
    possession.lockTimer = 12;
    ball.vx = 0;
    ball.vy = 0;
    passAssist.timer = 0;
    passAssist.target = null;
}

function carryBallWithOwner() {
    const owner = possession.owner;
    if (!owner) return;

    let dirX = controlState.dirX;
    let dirY = controlState.dirY;

    if (possession.team === "ai") {
        dirX = -1;
        dirY = 0;
    } else if (possession.team === "player" && possession.owner !== players[0]) {
        // Non-controlled player-team player: carry ball toward the AI goal
        dirX = 1;
        dirY = 0;
    }

    const holdDistance = owner.r + ball.radius - 4;
    const tx = owner.x + dirX * holdDistance;
    const ty = owner.y + dirY * holdDistance;

    ball.x += (tx - ball.x) * 0.78;
    ball.y += (ty - ball.y) * 0.78;
    ball.vx = 0;
    ball.vy = 0;
}

function ensurePlayerControlForAction(selected, range = 26) {
    if (!selected) return false;
    if (possession.owner === selected && possession.team === "player") return true;

    const d = distance(selected.x, selected.y, ball.x, ball.y);
    if (d <= selected.r + range) {
        possession.owner = selected;
        possession.team = "player";
        possession.lockTimer = 10;
        ball.vx = 0;
        ball.vy = 0;
        return true;
    }
    return false;
}

function performPass() {
    // If the player's goalie has the ball, pass from the goalie to the best-aligned teammate
    if (possession.owner === goalies.player && possession.team === "player") {
        const goalie = goalies.player;
        const passDir = normalize(controlState.dirX, controlState.dirY);
        let best = null;
        let bestScore = -Infinity;
        for (const mate of players) {
            const vx = mate.x - goalie.x;
            const vy = mate.y - goalie.y;
            const dist = Math.hypot(vx, vy);
            if (dist < 30) continue;
            const n = normalize(vx, vy);
            const alignment = n.x * passDir.x + n.y * passDir.y;
            const score = alignment * 800 - dist * 0.3;
            if (score > bestScore) {
                bestScore = score;
                best = mate;
            }
        }
        if (best) {
            const toMate = normalize(best.x - goalie.x, best.y - goalie.y);
            releasePossession(toMate.x * 10.0, toMate.y * 7.5);
            passAssist.target = best;
            passAssist.timer = 40;
        } else {
            releasePossession(passDir.x * 9.0, passDir.y * 7.0);
        }
        playerGoaliePossessionTimer = 0;
        return;
    }

    const selected = players[0];
    if (!selected) return;
    if (!ensurePlayerControlForAction(selected, 22)) return;

    const dir = normalize(controlState.dirX, controlState.dirY);
    const teammate = findBestPassTarget(selected, dir);

    if (teammate) {
        const toMate = normalize(teammate.x - selected.x, teammate.y - selected.y);
        releasePossession(toMate.x * 14.5, toMate.y * 12.5);
        passAssist.target = teammate;
        passAssist.timer = 40;
    } else {
        releasePossession(dir.x * 13.5, dir.y * 11.5);
    }
}

function performChargedShot() {
    let shooter = players[0];
    if (!shooter) return;

    if (possession.team === "player" && possession.owner && players.includes(possession.owner)) {
        shooter = possession.owner;
    } else {
        let nearest = players[0];
        let bestDist = Infinity;
        players.forEach(p => {
            const d = distance(p.x, p.y, ball.x, ball.y);
            if (d < bestDist) { bestDist = d; nearest = p; }
        });
        shooter = nearest;
    }

    // Must be facing roughly toward the right goal to shoot
    if (controlState.dirX < MIN_SHOOTING_DIR_X) return;

    // Prevent instant re-shot after a save/possession change
    if (possession.lockTimer > 0) return;

    setControlledPlayer(shooter);

    if (!ensurePlayerControlForAction(shooter, 56)) {
        possession.owner = shooter;
        possession.team = "player";
        possession.lockTimer = 1;
    }

    const chargeRatio = Math.max(0.15, shotState.charge / shotState.maxCharge);
    const power = 16 + chargeRatio * 18;

    ball.x = shooter.x + shooter.r + ball.radius - 2;
    ball.y = shooter.y + shotState.aimY * 3;

    const targetX = FIELD.width - 2;
    const targetY = clamp(
        FIELD.height / 2 + shotState.aimY * 140,
        FIELD.goalTop + 8,
        FIELD.goalBottom - 8
    );
    const shot = normalize(targetX - ball.x, targetY - ball.y);
    releasePossession(shot.x * power, shot.y * power);
    passAssist.target = null;
    passAssist.timer = 0;
}

function performChargedPass() {
    // If the player's goalie has the ball, perform a charged pass from the goalie
    if (possession.owner === goalies.player && possession.team === "player") {
        const goalie = goalies.player;
        const chargeRatio = Math.max(0.2, passState.charge / passState.maxCharge);
        const passSpeed = 16 + chargeRatio * 12;
        const passDir = normalize(controlState.dirX, controlState.dirY);
        let best = null;
        let bestScore = -Infinity;
        for (const mate of players) {
            const vx = mate.x - goalie.x;
            const vy = mate.y - goalie.y;
            const dist = Math.hypot(vx, vy);
            if (dist < 30) continue;
            const n = normalize(vx, vy);
            const alignment = n.x * passDir.x + n.y * passDir.y;
            const score = alignment * 800 - dist * 0.3;
            if (score > bestScore) { bestScore = score; best = mate; }
        }
        if (best) {
            const toMate = normalize(best.x - goalie.x, best.y - goalie.y);
            releasePossession(toMate.x * passSpeed, toMate.y * passSpeed);
            passAssist.target = best;
            passAssist.timer = 40;
        } else {
            releasePossession(passDir.x * passSpeed, passDir.y * passSpeed);
        }
        playerGoaliePossessionTimer = 0;
        return;
    }

    const selected = players[0];
    if (!selected) return;
    if (!ensurePlayerControlForAction(selected, 22)) return;

    const chargeRatio = Math.max(0.2, passState.charge / passState.maxCharge);
    const passSpeed = 16 + chargeRatio * 12;

    const dir = normalize(controlState.dirX, controlState.dirY);
    const teammate = findBestPassTarget(selected, dir);

    if (teammate) {
        const toMate = normalize(teammate.x - selected.x, teammate.y - selected.y);
        releasePossession(toMate.x * passSpeed, toMate.y * passSpeed);
        passAssist.target = teammate;
        passAssist.timer = 40;
    } else {
        releasePossession(dir.x * passSpeed, dir.y * passSpeed);
    }
}

function performShot() {
    const shooter = players[0];
    if (!shooter) return;
    if (!ensurePlayerControlForAction(shooter, 22)) return;

    const dir = normalize(FIELD.rightGoalX - shooter.x, FIELD.height / 2 - shooter.y);
    releasePossession(dir.x * 12, dir.y * 12);
    passAssist.target = null;
    passAssist.timer = 0;
}

function findBestPassTarget(selected, dir) {
    let best = null;
    let bestScore = -Infinity;

    for (let i = 1; i < players.length; i++) {
        const mate = players[i];
        const vx = mate.x - selected.x;
        const vy = mate.y - selected.y;
        const dist = Math.hypot(vx, vy);
        if (dist < 35) continue;

        const n = normalize(vx, vy);
        const alignment = n.x * dir.x + n.y * dir.y;

        // Allow wider passing cone
        if (alignment < 0.1) continue;

        // Prioritize forward + open players
        const space = distanceToNearestOpponent(mate);
        const forwardBonus = vx * 0.6;

        const score = alignment * 800 + space * 0.8 + forwardBonus - dist * 0.4;

        if (score > bestScore) {
            bestScore = score;
            best = mate;
        }
    }

    return best;
}

function setControlledPlayer(player) {
    const idx = players.indexOf(player);
    if (idx <= 0) return;
    players.unshift(...players.splice(idx, 1));
}

function attemptTackle() {
    const selected = players[0];
    if (!selected) return;
    if (!tackleActive) return;

    // Loose ball pickup during the tackle window
    if (!possession.owner) {
        if (distance(selected.x, selected.y, ball.x, ball.y) < selected.r + 16) {
            possession.owner = selected;
            possession.team = "player";
            possession.lockTimer = 14;
            ball.vx = 0;
            ball.vy = 0;
            tackleActive = false;
            tackleTimer = 0;
        }
        return;
    }

    if (possession.owner.team === selected.team) return;

    const target = possession.owner;
    const d = distance(selected.x, selected.y, target.x, target.y);
    if (d > selected.r + target.r + TACKLE_RANGE) return;

    // Must be facing the opponent
    const facing = normalize(controlState.dirX, controlState.dirY);
    const toTarget = normalize(target.x - selected.x, target.y - selected.y);
    const dot = facing.x * toTarget.x + facing.y * toTarget.y;
    if (dot < 0.3) return;

    if (Math.random() < 0.65) {
        // Success: win the ball
        possession.owner = selected;
        possession.team = "player";
        possession.lockTimer = 15;
        ball.vx = 0;
        ball.vy = 0;
    } else {
        // Fail: loose ball poke
        possession.owner = null;
        possession.team = null;
        ball.vx = (Math.random() - 0.5) * 6;
        ball.vy = (Math.random() - 0.5) * 6;
    }
    tackleActive = false;
    tackleTimer = 0;
}

function handleFieldBoundariesAndPosts() {
    // top/bottom lines
    if (ball.y < ball.radius) {
        ball.y = ball.radius;
        ball.vy *= -0.65;
    }
    if (ball.y > FIELD.height - ball.radius) {
        ball.y = FIELD.height - ball.radius;
        ball.vy *= -0.65;
    }

    // goalposts block side entries
    const sideOpen = ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom;
    if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.vx *= -0.8;
    }
    if (ball.x > FIELD.width - ball.radius) {
        ball.x = FIELD.width - ball.radius;
        ball.vx *= -0.8;
    }

    if (ball.x <= FIELD.leftGoalX && !sideOpen) {
        ball.x = FIELD.leftGoalX + ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.65;
    }
    if (ball.x >= FIELD.rightGoalX && !sideOpen) {
        ball.x = FIELD.rightGoalX - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.65;
    }

    // Prevent ball getting stuck inside goal mouth (before a goal is scored)
    if (
        ball.x > FIELD.rightGoalX - GOAL_MOUTH_BUFFER &&
        ball.y > FIELD.goalTop &&
        ball.y < FIELD.goalBottom
    ) {
        ball.x = FIELD.rightGoalX - GOAL_MOUTH_BUFFER;
    }

    if (
        ball.x < FIELD.leftGoalX + GOAL_MOUTH_BUFFER &&
        ball.y > FIELD.goalTop &&
        ball.y < FIELD.goalBottom
    ) {
        ball.x = FIELD.leftGoalX + GOAL_MOUTH_BUFFER;
    }
}

function announceGoal(team) {
    const text = team === "player" ? "Goal for the home team!" : "Goal for the away team!";
    if (!window.speechSynthesis) return;
    try {
        const utter = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    } catch (err) {
        // Speech synthesis unavailable or blocked; fall back silently
    }
}

function detectGoals() {
    if (ball.x <= FIELD.leftGoalX && ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom) {
        score.ai++;
        announceGoal("ai");
        resetBall();
    }

    if (ball.x >= FIELD.rightGoalX && ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom) {
        score.player++;
        announceGoal("player");
        resetBall();
    }
}

function normalize(x, y) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
}

function releasePossession(kickVX, kickVY) {
    possession.owner = null;
    possession.team = null;
    possession.lockTimer = 0;
    possession.pickupCooldown = 18;
    ball.vx = kickVX;
    ball.vy = kickVY;
}

function resetBall() {
    possession.owner = null;
    possession.team = null;
    possession.lockTimer = 0;
    possession.pickupCooldown = 0;
    passAssist.target = null;
    passAssist.timer = 0;
    ball.x = FIELD.width / 2;
    ball.y = FIELD.height / 2;
    ball.vx = 0;
    ball.vy = 0;
}

function endMatch(reason = "Match Finished") {
    matchRunning = false;
    screen.innerHTML = `
        <h2>${reason}</h2>
        <p>Player ${score.player} - ${score.ai} AI</p>
        <p>Click to continue...</p>
    `;

    screen.onclick = () => {
        screen.onclick = null;
        if (onMatchComplete) {
            const cb = onMatchComplete;
            onMatchComplete = null;
            cb();
        }
    };
}

function draw() {
    ctx.fillStyle = "#1f8d2e";
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(FIELD.width / 2, 0);
    ctx.lineTo(FIELD.width / 2, FIELD.height);
    ctx.stroke();

    // goalie boxes
    ctx.strokeStyle = "#f0f0f0";
    ctx.strokeRect(FIELD.playerBox.x, FIELD.playerBox.y, FIELD.playerBox.w, FIELD.playerBox.h);
    ctx.strokeRect(FIELD.aiBox.x, FIELD.aiBox.y, FIELD.aiBox.w, FIELD.aiBox.h);

    // goals
    ctx.fillStyle = "white";
    ctx.fillRect(0, FIELD.goalTop, FIELD.leftGoalX, FIELD.goalBottom - FIELD.goalTop);
    ctx.fillRect(FIELD.rightGoalX, FIELD.goalTop, FIELD.width - FIELD.rightGoalX, FIELD.goalBottom - FIELD.goalTop);

    // goalposts (side blockers)
    drawPost(FIELD.leftPostTop);
    drawPost(FIELD.leftPostBottom);
    drawPost(FIELD.rightPostTop);
    drawPost(FIELD.rightPostBottom);

    // ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 7, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 2;
    ctx.stroke();

    players.forEach((p, idx) => drawPixelPlayer(p, idx === 0 ? "#67f3ff" : "#3f78ff", false));
    aiPlayers.forEach(p => drawPixelPlayer(p, "#ff4d4d", false));

    drawPixelPlayer(goalies.player, "#f8d96a", true);
    drawPixelPlayer(goalies.ai, "#ffb17a", true);

    // Scoreboard HUD (center top)
    const hudCx = FIELD.width / 2;
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(hudCx - 180, 6, 360, 76);
    ctx.strokeStyle = "rgba(255,215,0,0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(hudCx - 180, 6, 360, 76);

    ctx.textAlign = "center";
    ctx.fillStyle = "#67f3ff";
    ctx.font = "bold 14px Arial";
    ctx.fillText("HOME", hudCx - 90, 26);
    ctx.fillStyle = "#ff7070";
    ctx.fillText("AWAY", hudCx + 90, 26);

    ctx.fillStyle = "white";
    ctx.font = "bold 38px Arial";
    ctx.fillText(`${score.player}`, hudCx - 72, 62);
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "bold 26px Arial";
    ctx.fillText("-", hudCx, 58);
    ctx.fillStyle = "white";
    ctx.font = "bold 38px Arial";
    ctx.fillText(`${score.ai}`, hudCx + 72, 62);

    ctx.fillStyle = "#ffdd77";
    ctx.font = "bold 14px Arial";
    ctx.fillText(`${formatClock(matchClock)}`, hudCx, 76);
    ctx.textAlign = "left";

    // Corner scoreboard (top-left) – always visible even on smaller viewports
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.fillRect(8, 8, 130, 52);
    ctx.strokeStyle = "rgba(255,215,0,0.85)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 8, 130, 52);
    ctx.textAlign = "center";
    ctx.fillStyle = "#67f3ff";
    ctx.font = "bold 11px Arial";
    ctx.fillText("HOME", 43, 22);
    ctx.fillStyle = "#ff7070";
    ctx.fillText("AWAY", 103, 22);
    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    ctx.fillText(`${score.player}`, 38, 50);
    ctx.fillStyle = "#aaa";
    ctx.font = "bold 20px Arial";
    ctx.fillText("-", 73, 48);
    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    ctx.fillText(`${score.ai}`, 108, 50);
    ctx.textAlign = "left";

    // Bottom HUD: shot/pass power bar (always visible when charging)
    if (shotState.held || passState.held) {
        const isShot = shotState.held;
        const chargeRatio = isShot
            ? shotState.charge / shotState.maxCharge
            : passState.charge / passState.maxCharge;
        const hudBarW = 280;
        const hudBarH = 18;
        const hudBarX = FIELD.width / 2 - hudBarW / 2;
        const hudBarY = FIELD.height - 36;
        const label = isShot ? "SHOT POWER" : "PASS POWER";
        const barColor = isShot
            ? (chargeRatio < 0.5 ? "#6eff6e" : chargeRatio < 0.8 ? "#ffe566" : "#ff5555")
            : "#66aaff";

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(hudBarX - 2, hudBarY - 20, hudBarW + 4, hudBarH + 24);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(label, FIELD.width / 2, hudBarY - 6);
        ctx.textAlign = "left";
        ctx.fillStyle = "#333";
        ctx.fillRect(hudBarX, hudBarY, hudBarW, hudBarH);
        ctx.fillStyle = barColor;
        ctx.fillRect(hudBarX, hudBarY, hudBarW * chargeRatio, hudBarH);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hudBarX, hudBarY, hudBarW, hudBarH);
    }

    // Shot charge bar and aim arrow (above player)
    if (shotState.held) {
        const shooter = players[0];
        if (shooter) {
            const chargeRatio = shotState.charge / shotState.maxCharge;

            // Aim arrow toward the right goal
            const aimLen = 55;
            const startX = shooter.x + shotState.aimX * (shooter.r + 5);
            const startY = shooter.y + shotState.aimY * (shooter.r + 5);
            const endX = shooter.x + shotState.aimX * aimLen;
            const endY = shooter.y + shotState.aimY * aimLen;

            ctx.save();
            ctx.strokeStyle = "#ffe033";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Arrowhead triangle
            const angle = Math.atan2(shotState.aimY, shotState.aimX);
            ctx.translate(endX, endY);
            ctx.rotate(angle);
            ctx.fillStyle = "#ffe033";
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-7, -6);
            ctx.lineTo(-7, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Shot power bar above player
            const barW = 70;
            const barH = 12;
            const barX = shooter.x - barW / 2;
            const barY = shooter.y - shooter.r - 28;
            ctx.fillStyle = "rgba(0,0,0,0.65)";
            ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
            const barColor = chargeRatio < 0.5 ? "#6eff6e" : chargeRatio < 0.8 ? "#ffe566" : "#ff5555";
            ctx.fillStyle = barColor;
            ctx.fillRect(barX, barY, barW * chargeRatio, barH);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);
        }
    }

    // Pass charge bar above player + pass-assist target preview
    if (passState.held) {
        const selected = players[0];
        if (selected) {
            const chargeRatio = passState.charge / passState.maxCharge;
            const barW = 70;
            const barH = 12;
            const barX = selected.x - barW / 2;
            const barY = selected.y - selected.r - 28;
            ctx.fillStyle = "rgba(0,0,0,0.65)";
            ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
            ctx.fillStyle = "#66aaff";
            ctx.fillRect(barX, barY, barW * chargeRatio, barH);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);

            // Highlight the teammate that will receive the pass (only when a direction is held)
            if (controlState.dirX !== 0 || controlState.dirY !== 0) {
                const dir = normalize(controlState.dirX, controlState.dirY);
                const target = findBestPassTarget(selected, dir);
                if (target) {
                    // Dashed circle around target
                    ctx.save();
                    ctx.setLineDash([5, 4]);
                    ctx.strokeStyle = PASS_ASSIST_COLOR;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(target.x, target.y, target.r + PASS_TARGET_RADIUS_OFFSET, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Dashed line from passer to target
                    ctx.strokeStyle = "rgba(102,170,255,0.55)";
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([6, 5]);
                    ctx.beginPath();
                    ctx.moveTo(selected.x, selected.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                }
            }
        }
    }

    // Controls legend (bottom of field)
    const legendText = "Arrow Keys: Move  |  N: Pass (goalie too)  |  M: Shoot  |  K: Switch (def)  |  L: Tackle  |  X: Charged Pass  |  Space: Charged Shot";
    ctx.font = "bold 13px Arial";
    const legendW = ctx.measureText(legendText).width + 20;
    const legendX = (FIELD.width - legendW) / 2;
    const legendY = FIELD.height - 10;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(legendX, legendY - 17, legendW, 22);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.textAlign = "center";
    ctx.fillText(legendText, FIELD.width / 2, legendY);
    ctx.textAlign = "left";

    // In-flight pass assist indicator: circle around the intended recipient
    if (passAssist.timer > 0 && passAssist.target) {
        const t = passAssist.target;
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = PASS_ASSIST_COLOR;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r + PASS_TARGET_RADIUS_OFFSET, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
}

function formatClock(value) {
    const total = Math.max(0, Math.ceil(value));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function togglePauseMenu() {
    if (!matchRunning) return;
    matchPaused = !matchPaused;
    if (matchPaused) {
        openPauseMenu();
    } else {
        removePauseMenu();
    }
}

function openPauseMenu() {
    removePauseMenu();
    const menu = document.createElement("div");
    menu.style.position = "absolute";
    menu.style.inset = "0";
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.justifyContent = "center";
    menu.style.alignItems = "center";
    menu.style.background = "rgba(0,0,0,0.75)";
    menu.innerHTML = `
        <h2>Pause Menu</h2>
        <button id="menu-formation">Formation: ${(FORMATIONS[currentFormation] || FORMATIONS["2-2"]).label}</button>
        <button id="menu-team">Team Management</button>
        <button id="menu-instructions">Instructions</button>
        <button id="menu-exit">Exit to Main Menu</button>
        <button id="menu-resume">Resume</button>
    `;
    screen.style.position = "relative";
    screen.appendChild(menu);
    pauseMenuEl = menu;

    menu.querySelector("#menu-formation").onclick = () => {
        const keys = Object.keys(FORMATIONS);
        const idx = keys.indexOf(currentFormation);
        currentFormation = keys[(idx + 1) % keys.length];
        menu.querySelector("#menu-formation").textContent = "Formation: " + (FORMATIONS[currentFormation] || FORMATIONS["2-2"]).label;
        showMenuOverlayMessage("Formation changed to " + FORMATIONS[currentFormation].label + ". Home positions update immediately; starting positions apply on next match.");
    };
    menu.querySelector("#menu-team").onclick = () => openTeamManagementPanel();
    menu.querySelector("#menu-instructions").onclick = () => showMenuOverlayMessage(
        "Controls: WASD move | N: pass (works from outfield players AND from goalie — aim with WASD first) — " +
        "control switches to the recipient automatically | " +
        "Hold M and aim with WASD then release to shoot (longer = stronger) | " +
        "Goalie auto-passes after 2 s if you don't act | " +
        "L tackle | K switch on defense | P pause menu."
    );
    menu.querySelector("#menu-exit").onclick = () => exitToMainMenu();
    menu.querySelector("#menu-resume").onclick = () => togglePauseMenu();
}

function showMenuOverlayMessage(text) {
    if (!pauseMenuEl) return;
    let note = pauseMenuEl.querySelector("p");
    if (!note) {
        note = document.createElement("p");
        note.style.maxWidth = "780px";
        note.style.textAlign = "center";
        note.style.padding = "0 20px";
        pauseMenuEl.appendChild(note);
    }
    note.textContent = text;
}

function openTeamManagementPanel() {
    if (!pauseMenuEl) return;

    let panel = pauseMenuEl.querySelector(".team-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.className = "team-panel";
        panel.style.display = "flex";
        panel.style.gap = "8px";
        panel.style.marginTop = "12px";
        panel.style.flexWrap = "wrap";
        panel.style.justifyContent = "center";
        pauseMenuEl.appendChild(panel);
    }

    panel.innerHTML = "";
    players.forEach((p, idx) => {
        const btn = document.createElement("button");
        btn.textContent = `Player ${idx + 1}`;
        btn.onclick = () => showMenuOverlayMessage(`Selected Player ${idx + 1}. Stats customization can be added next.`);
        panel.appendChild(btn);
    });
}

function removePauseMenu() {
    if (pauseMenuEl && pauseMenuEl.parentNode) {
        pauseMenuEl.parentNode.removeChild(pauseMenuEl);
    }
    pauseMenuEl = null;
}

function exitToMainMenu() {
    matchRunning = false;
    matchPaused = false;
    removePauseMenu();
    if (typeof showMainMenu === "function") {
        showMainMenu();
    } else {
        screen.innerHTML = '<h1>WESTEN</h1><button onclick="startGame()">Start Game</button>';
    }
}

function drawPost(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#dddddd";
    ctx.fill();
}

function drawPixelPlayer(p, color, isGoalie) {
    const x = p.x;
    const y = p.y;

    const walkCycle = Math.sin(Date.now() * 0.008 + x * 0.05) * 2;

    // body
    ctx.fillStyle = color;
    ctx.fillRect(x - 7, y - 9, 14, 18);

    // head
    ctx.fillStyle = "#ffd7b0";
    ctx.fillRect(x - 5, y - 15, 10, 6);

    // legs animated
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 6, y + 9, 4, 6 + walkCycle);
    ctx.fillRect(x + 2, y + 9, 4, 6 - walkCycle);

    // subtle shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x - 8, y + 14, 16, 4);

    if (isGoalie) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 11, y - 2, 4, 4);
        ctx.fillRect(x + 7, y - 2, 4, 4);
    }

    if (!isGoalie && p.team === "player" && p.stamina !== undefined) {
        ctx.fillStyle = "black";
        ctx.fillRect(x - 10, y - 22, 20, 4);
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(x - 10, y - 22, (p.stamina / 100) * 20, 4);
    }
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function distanceToNearestOpponent(player) {
    let min = Infinity;
    for (const p of players.concat(aiPlayers, [goalies.player, goalies.ai]).filter(Boolean)) {
        if (p.team !== player.team) {
            const d = distance(player.x, player.y, p.x, p.y);
            if (d < min) min = d;
        }
    }
    return min;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function setDirection(key, pressed) {
    if (key === "w" || key === "ArrowUp") input.up = pressed;
    if (key === "s" || key === "ArrowDown") input.down = pressed;
    if (key === "a" || key === "ArrowLeft") input.left = pressed;
    if (key === "d" || key === "ArrowRight") input.right = pressed;
}

document.addEventListener("keydown", e => {
    if (!matchRunning) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    // Prevent arrow keys and space from scrolling the page during gameplay
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) || e.key === " ") {
        e.preventDefault();
    }

    if (key === "p") {
        togglePauseMenu();
        return;
    }

    if (matchPaused) {
        if (key === "y") openTeamManagementPanel();
        return;
    }

    setDirection(key, true);

    const selected = players[0];
    if (!selected) return;

    if (key === "n" && !e.repeat) performPass();
    if (key === "x" && !e.repeat) { passState.held = true; passState.charge = 0; }
    if (key === "m" && !e.repeat) performShot();
    if (key === " " && !e.repeat) { shotState.held = true; shotState.charge = 0; shotState.aimX = controlState.dirX; shotState.aimY = controlState.dirY; }
    if (key === "l" && tackleCooldown <= 0) { tackleActive = true; tackleCooldown = TACKLE_COOLDOWN_FRAMES; tackleTimer = 0; }
    if (key === "z" && tackleCooldown <= 0) { tackleActive = true; tackleCooldown = TACKLE_COOLDOWN_FRAMES; tackleTimer = 0; }

    // K: cycle to next player on defense only
    if (key === "k" && players.length > 1 && possession.team !== "player") {
        players.push(players.shift());
    }
});

document.addEventListener("keyup", e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    setDirection(key, false);

    if (key === " " && shotState.held) {
        shotState.held = false;
        if (matchRunning && !matchPaused) performChargedShot();
        shotState.charge = 0;
    }
    if (key === "x" && passState.held) {
        passState.held = false;
        if (matchRunning && !matchPaused) performChargedPass();
        passState.charge = 0;
    }
});
