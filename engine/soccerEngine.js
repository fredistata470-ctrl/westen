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
let goalFlash = { timer: 0, team: null };
let goaliePossessionTimer = 0;
let playerGoaliePossessionTimer = 0;
const GOALIE_AUTO_PASS_DELAY = 2; // seconds before a goalie auto-passes

// Set to true when running a Story Mode match so insulin and XP mechanics are active
let isStoryMatch = false;

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

// Pre-generated crowd pixel positions for efficient rendering
let crowdPixels = [];

// Crowd state — tracks atmosphere, momentum and reaction animations
const crowdState = {
    momentum: 0,          // 0–1 scale; increases with shots/goals
    reactionTimer: 0,     // frames of active crowd reaction animation
    reactionType: null,   // "cheer" | "boo" | "lean"
    chantTimer: 0,        // countdown between chant pulses (frames)
    leanOffset: 0,        // current crowd lean pixel offset
    jumpOffset: 0         // current crowd jump pixel offset (for goal celebrations)
};
// Rate at which crowd momentum decays each frame (~0.54/min at 60fps)
const MOMENTUM_DECAY_RATE = 0.00015;

const PASS_ASSIST_COLOR = "#66aaff";
const PASS_TARGET_RADIUS_OFFSET = 9;
const PASS_ASSIST_STEER_RANGE = 300;    // px: distance within which magnetic steering is active
const PASS_ASSIST_STEER_STRENGTH = 0.12; // curve per frame toward intended recipient

// Goalie save constants
const GOALIE_CATCH_LOCK_DURATION = 18; // frames ball is held after a save (~0.3s at 60fps)
const GOAL_MOUTH_BUFFER = 4;           // px: keeps ball from embedding inside goal mouth
const GOAL_FLASH_DURATION = 150;       // frames the goal celebration overlay is shown
// Minimum rightward directional component required to shoot toward the right goal
const MIN_SHOOTING_DIR_X = -0.85;
// Pickup radius offset for AI outfield players collecting a loose ball
const AI_OUTFIELD_PICKUP_RADIUS = 14;

// Player movement feel
const PLAYER_ACCEL = 0.6;
const PLAYER_MAX_SPEED = 4.2;
const PLAYER_FRICTION = 0.85;

// Ball dribbling spring constants (controlled player)
const DRIBBLE_CONTROL_STRENGTH = 0.35;
const DRIBBLE_DAMPING = 0.7;

// Animation bounce scale (lower = smoother run cycle)
const ANIM_SPEED_SCALE = 0.18;

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
    isStoryMatch = chapter !== null && chapter !== undefined;
    showFormationSelect(() => {
        screen.innerHTML = "";
        canvas = document.createElement("canvas");
        canvas.width = FIELD.width;
        canvas.height = FIELD.height;
        screen.appendChild(canvas);
        ctx = canvas.getContext("2d");

        initMatch();
        // Initialise Otto's insulin mechanic for story matches
        if (isStoryMatch && typeof initOttoInsulin === "function") {
            initOttoInsulin();
        }
        matchPaused = false;
        removePauseMenu();
        matchRunning = true;
        audioManager.startAmbient();
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
    goalFlash.timer = 0;
    goalFlash.team = null;

    // Reset crowd atmosphere
    crowdState.momentum = 0;
    crowdState.reactionTimer = 0;
    crowdState.reactionType = null;
    crowdState.chantTimer = 0;
    crowdState.leanOffset = 0;
    crowdState.jumpOffset = 0;
    audioManager.crowdVolume = 1.0;

    const formation = FORMATIONS[currentFormation] || FORMATIONS["2-2"];
    for (let i = 0; i < 4; i++) {
        const ph = formation.playerHome[i];
        const ah = formation.aiHome[i];
        players.push({ x: ph.x, y: ph.y, baseSpeed: 3.8, speed: 3.8, stamina: 100, r: 11, team: "player", vx: 0, vy: 0, animOffset: 0, number: i + 1 });
        aiPlayers.push({
            x: ah.x,
            y: ah.y,
            baseSpeed: 2.6,
            speed: 2.6,
            stamina: 100,
            r: 11,
            team: "ai",
            tackleCooldown: 0,
            vx: 0,
            vy: 0,
            animOffset: 0,
            number: i + 1
        });
    }

    goalies.player = { x: 78, y: FIELD.height / 2, r: 13, collisionRadius: 13 * 0.65, speed: 2.95, box: FIELD.playerBox, team: "player", reactionTimer: 0, shotReactionDelay: 0, errorY: 0, diveTimer: 0, diveDir: 0, animOffset: 0 };
    goalies.ai = { x: 1322, y: FIELD.height / 2, r: 13, collisionRadius: 13 * 0.65, speed: 2.95, box: FIELD.aiBox, team: "ai", reactionTimer: 0, shotReactionDelay: 0, errorY: 0, diveTimer: 0, diveDir: 0, animOffset: 0 };

    // Pre-generate crowd pixels for top and bottom stands
    const standH = 42;
    crowdPixels = [];
    for (let i = 0; i < 500; i++) {
        crowdPixels.push({ x: Math.random() * FIELD.width, y: Math.random() * (standH - 2), hue: Math.random() * 360, bottom: false });
    }
    for (let i = 0; i < 500; i++) {
        crowdPixels.push({ x: Math.random() * FIELD.width, y: Math.random() * (standH - 2), hue: Math.random() * 360, bottom: true });
    }
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
    if (goalFlash.timer > 0) goalFlash.timer--;

    // Update crowd atmosphere
    updateCrowdState();
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

        // Otto's insulin mechanic (story mode only) modifies stamina drain and speed
        let staminaDrain = 0.15;
        let speedMult = 1;
        if (isStoryMatch && players[0] === p && typeof updateOttoInsulin === "function") {
            const insulin = updateOttoInsulin();
            staminaDrain = insulin.staminaDrain;
            speedMult = insulin.speedMult;
        }

        if (moving && players[0] === p) {
            p.stamina -= staminaDrain;
        } else {
            p.stamina += 0.08;
        }
        p.stamina = clamp(p.stamina, 0, 100);
        const fatigueFactor = 0.6 + (p.stamina / 100) * 0.4;
        p.speed = p.baseSpeed * fatigueFactor * speedMult;
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

    const accel = PLAYER_ACCEL;
    const maxSpeed = PLAYER_MAX_SPEED;
    const friction = PLAYER_FRICTION;

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
        selected.vx += nx * accel;
        selected.vy += ny * accel;
        controlState.dirX = nx;
        controlState.dirY = ny;
    }

    const speed = Math.hypot(selected.vx, selected.vy);
    if (speed > maxSpeed) {
        selected.vx = (selected.vx / speed) * maxSpeed;
        selected.vy = (selected.vy / speed) * maxSpeed;
    }

    selected.vx *= friction;
    selected.vy *= friction;

    selected.animOffset += speed * ANIM_SPEED_SCALE;

    selected.x += selected.vx;
    selected.y += selected.vy;

    selected.x = clamp(selected.x, selected.r, FIELD.width - selected.r);
    selected.y = clamp(selected.y, selected.r, FIELD.height - selected.r);
    blockPlayerFromGoalArea(selected);
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
const GOALIE_AIM_READ_NOISE = 220;
// Controls how much the AI goalie anticipates the aimed corner vs reacting to ball position
const GOALIE_AIM_READ_WEIGHT = 0.32;

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
            p.animOffset += p.speed * ANIM_SPEED_SCALE;
        }
        p.x = clamp(p.x, p.r, FIELD.width - p.r);
        p.y = clamp(p.y, p.r, FIELD.height - p.r);
        blockPlayerFromGoalArea(p);
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

        const moveDist = distance(p.x, p.y, targetX, targetY);
        if (moveDist > 6) {
            const to = normalize(targetX - p.x, targetY - p.y);
            p.x += to.x * p.speed;
            p.y += to.y * p.speed;
            p.animOffset += p.speed * ANIM_SPEED_SCALE;
        }
        p.x = clamp(p.x, p.r, FIELD.width - p.r);
        p.y = clamp(p.y, p.r, FIELD.height - p.r);
        blockPlayerFromGoalArea(p);

        if (playerCarrier && playerCarrier !== goalies.player && possession.lockTimer <= 0) {
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
    carrier.x += drive.x * 2.0;
    carrier.y += drive.y * 1.3;

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
    releasePossession(dir.x * 17.0, dir.y * 15.0);
    passAssist.target = bestTarget;
    passAssist.timer = 55;
    setControlledPlayer(bestTarget);
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

// 220 ms reaction delay in frames at 60fps before keeper reacts to an incoming shot
const GOALIE_SHOT_REACTION_FRAMES = 13; // Math.round(0.220 * 60)
// Probability the goalkeeper misreads the shot direction (human error)
const GOALIE_ERROR_CHANCE = 0.22;
// Maximum additional Y offset added when keeper makes an error (pixels)
const GOALIE_ERROR_OFFSET_MAX = 40;

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

    // 220ms reaction delay: when a shot is first detected, start a countdown
    // before the keeper begins moving toward the predicted ball position.
    if (shotIncoming) {
        if (goalie.shotReactionDelay === 0) {
            goalie.shotReactionDelay = GOALIE_SHOT_REACTION_FRAMES;
            // 22% chance the keeper misreads — adds extra random Y offset
            if (Math.random() < GOALIE_ERROR_CHANCE) {
                goalie.errorY += (Math.random() - 0.5) * GOALIE_ERROR_OFFSET_MAX;
            }
        }
    } else {
        goalie.shotReactionDelay = 0;
    }

    const reactionFrozen = goalie.shotReactionDelay > 0 && shotIncoming;
    if (reactionFrozen) {
        goalie.shotReactionDelay--;
    }

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

    const activeSpeed = (shotIncoming && !reactionFrozen) ? goalie.speed * 1.7 : goalie.speed;
    const goalieMoveDist = distance(goalie.x, goalie.y, defendX, defendY);
    if (goalieMoveDist > 3) {
        const to = normalize(defendX - goalie.x, defendY - goalie.y);
        goalie.x += to.x * activeSpeed;
        goalie.y += to.y * activeSpeed;
        goalie.animOffset += activeSpeed * ANIM_SPEED_SCALE;
    }

    if (goalie.diveTimer > 0) {
        goalie.diveTimer--;
        goalie.y += goalie.diveDir * 3.8;
    } else if (shotIncoming && !reactionFrozen && Math.random() < 0.07) {
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

    // Use reduced collision radius (65% of visual) so near-post shots slip through
    const interactionRadius = (goalie.collisionRadius || goalie.r * 0.65) + 8;
    if (distance(goalie.x, goalie.y, ball.x, ball.y) >= interactionRadius) return;

    // Save probability based on shot speed (arcade-polished: strong shots can beat keeper)
    const shotSpeed = Math.hypot(ball.vx, ball.vy);
    let saveChance;
    if (shotSpeed < 7) {
        saveChance = 0.72; // weak shot — often saved
    } else if (shotSpeed < 11) {
        saveChance = 0.42; // normal shot
    } else {
        saveChance = 0.20; // powerful shot — usually scores
    }

    // Reduce save chance if ball is far from keeper's body (angled / corner shot)
    const angleOffset = Math.abs(ball.y - goalie.y);
    if (angleOffset > 18) saveChance -= 0.25;
    if (angleOffset > 32) saveChance -= 0.45;

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

    // Smooth lerp carry for the controlled player: ball sits cleanly at the player's feet
    if (possession.team === "player" && owner === players[0]) {
        const holdDist = owner.r + ball.radius - 2;
        const mag = Math.hypot(controlState.dirX, controlState.dirY);
        const tdx = mag > 0 ? controlState.dirX / mag : 1;
        const tdy = mag > 0 ? controlState.dirY / mag : 0;
        const targetX = owner.x + tdx * holdDist;
        const targetY = owner.y + tdy * holdDist;
        ball.x += (targetX - ball.x) * 0.55;
        ball.y += (targetY - ball.y) * 0.55;
        ball.vx = 0;
        ball.vy = 0;
        return;
    }

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
            releasePossession(toMate.x * 14.0, toMate.y * 12.0);
            passAssist.target = best;
            passAssist.timer = 55;
            setControlledPlayer(best);
        } else {
            releasePossession(passDir.x * 12.0, passDir.y * 10.0);
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
        releasePossession(toMate.x * 20, toMate.y * 18);
        passAssist.target = teammate;
        passAssist.timer = 55;
        setControlledPlayer(teammate);
    } else {
        releasePossession(dir.x * 18, dir.y * 16);
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

    const chargeRatio = Math.max(0.30, shotState.charge / shotState.maxCharge);
    const power = 13 + chargeRatio * 16;

    ball.x = shooter.x + shooter.r + ball.radius - 2;
    ball.y = shooter.y + shotState.aimY * 3;

    const targetX = FIELD.width - 2;
    const targetY = clamp(
        FIELD.height / 2 + shotState.aimY * 140,
        FIELD.goalTop + 8,
        FIELD.goalBottom - 8
    );
    const shot = normalize(targetX - ball.x, targetY - ball.y);
    releasePossession(Math.max(1.1, shot.x) * power, shot.y * (power * 0.65));
    passAssist.target = null;
    passAssist.timer = 0;
}

function performChargedPass() {
    // If the player's goalie has the ball, perform a charged pass from the goalie
    if (possession.owner === goalies.player && possession.team === "player") {
        const goalie = goalies.player;
        const chargeRatio = Math.max(0.2, passState.charge / passState.maxCharge);
        const passSpeed = 18 + chargeRatio * 16;
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
            passAssist.timer = 55;
            setControlledPlayer(best);
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
    const passSpeed = 18 + chargeRatio * 16;

    const dir = normalize(controlState.dirX, controlState.dirY);
    const teammate = findBestPassTarget(selected, dir);

    if (teammate) {
        const toMate = normalize(teammate.x - selected.x, teammate.y - selected.y);
        releasePossession(toMate.x * passSpeed, toMate.y * passSpeed);
        passAssist.target = teammate;
        passAssist.timer = 55;
        setControlledPlayer(teammate);
    } else {
        releasePossession(dir.x * passSpeed, dir.y * passSpeed);
    }
}

function performShot() {
    const shooter = players[0];
    if (!shooter) return;
    if (!ensurePlayerControlForAction(shooter, 22)) return;

    const targetX = FIELD.width - 2;
    const targetY = clamp(
        FIELD.height / 2 + controlState.dirY * 140,
        FIELD.goalTop + 8,
        FIELD.goalBottom - 8
    );
    const dir = normalize(targetX - shooter.x, targetY - shooter.y);
    releasePossession(dir.x * 20, dir.y * 20);
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

        // Allow wider passing cone (backward passes allowed too)
        if (alignment < -0.45) continue;

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

    // Goalies cannot be tackled
    if (possession.owner === goalies.ai || possession.owner === goalies.player) return;

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
        // Away goal: home crowd boos, lower volume
        audioManager.crowdVolume = 0.6;
        audioManager.playSFX("goal_boo");
        crowdState.reactionTimer = 90;
        crowdState.reactionType = "boo";
        crowdState.jumpOffset = 0;
        crowdState.momentum = Math.max(0, crowdState.momentum - 0.2);
        goalFlash.timer = GOAL_FLASH_DURATION;
        goalFlash.team = "ai";
        resetBall();
    }

    if (ball.x >= FIELD.rightGoalX && ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom) {
        score.player++;
        announceGoal("player");
        // Home goal: full cheer, full volume
        audioManager.crowdVolume = 1.0;
        audioManager.playSFX("goal_cheer");
        crowdState.reactionTimer = 120;
        crowdState.reactionType = "cheer";
        crowdState.jumpOffset = 8;
        crowdState.momentum = Math.min(1, crowdState.momentum + 0.3);
        goalFlash.timer = GOAL_FLASH_DURATION;
        goalFlash.team = "player";
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
    // Trigger crowd reaction for powerful shots heading toward either goal
    const speed = Math.hypot(kickVX, kickVY);
    if (speed >= 14) {
        audioManager.playSFX(Math.random() < 0.5 ? "crowd_ooh" : "crowd_ah");
        // Crowd leans forward on big shot
        crowdState.reactionTimer = 40;
        crowdState.reactionType = "lean";
        crowdState.leanOffset = 3;
        // Increase momentum when player shots are powerful
        crowdState.momentum = Math.min(1, crowdState.momentum + 0.1);
    }
}

// Update crowd state each frame: handle reaction timers, chant pulses, momentum decay.
function updateCrowdState() {
    // Decay momentum slowly over time
    crowdState.momentum = Math.max(0, crowdState.momentum - MOMENTUM_DECAY_RATE);

    // Decay reaction animation
    if (crowdState.reactionTimer > 0) {
        crowdState.reactionTimer--;
        if (crowdState.reactionType === "cheer") {
            // Jump eases back down
            crowdState.jumpOffset = Math.max(0, crowdState.jumpOffset - 0.1);
        } else if (crowdState.reactionType === "lean") {
            crowdState.leanOffset = Math.max(0, crowdState.leanOffset - 0.08);
        } else {
            crowdState.jumpOffset = 0;
            crowdState.leanOffset = 0;
        }
    } else {
        crowdState.reactionType = null;
        crowdState.jumpOffset = 0;
        crowdState.leanOffset = 0;
    }

    // Chant pulses when momentum is high (home team has momentum)
    if (crowdState.momentum > 0.4) {
        crowdState.chantTimer--;
        if (crowdState.chantTimer <= 0) {
            audioManager.playSFX("crowd_chant", crowdState.momentum * 0.8);
            // Next chant pulse: sooner when momentum is higher
            crowdState.chantTimer = Math.floor(180 - crowdState.momentum * 100);
        }
    } else {
        crowdState.chantTimer = 0;
    }

    // Sync ambient intensity with momentum
    audioManager.setAmbientIntensity(crowdState.momentum);
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
    audioManager.stopAmbient();
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

    // --- Crowd in the stands (top and bottom strips) ---
    const standH = 42;
    // Stand background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, FIELD.width, standH);
    ctx.fillRect(0, FIELD.height - standH, FIELD.width, standH);
    // Crowd: pre-generated colorful pixel dots with reaction animation
    const crowdJump = crowdState.jumpOffset;
    const crowdLean = crowdState.leanOffset;
    for (const cp of crowdPixels) {
        // Boost saturation/lightness when momentum is high
        const sat = Math.round(60 + crowdState.momentum * 30);
        const lit = Math.round(55 + crowdState.momentum * 20);
        ctx.fillStyle = `hsl(${cp.hue},${sat}%,${lit}%)`;
        const yOff = cp.bottom ? FIELD.height - standH + cp.y : cp.y;
        // Jump: dots shift upward on goal; lean: rightward lean on shot
        const jumpY = cp.bottom ? crowdJump : -crowdJump;
        ctx.fillRect(cp.x + crowdLean, yOff + jumpY, 2, 2);
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(FIELD.width / 2, 0);
    ctx.lineTo(FIELD.width / 2, FIELD.height);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(FIELD.width / 2, FIELD.height / 2, 90, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Center spot
    ctx.beginPath();
    ctx.arc(FIELD.width / 2, FIELD.height / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    // goalie boxes
    ctx.strokeStyle = "#f0f0f0";
    ctx.strokeRect(FIELD.playerBox.x, FIELD.playerBox.y, FIELD.playerBox.w, FIELD.playerBox.h);
    ctx.strokeRect(FIELD.aiBox.x, FIELD.aiBox.y, FIELD.aiBox.w, FIELD.aiBox.h);

    // goals
    ctx.fillStyle = "white";
    ctx.fillRect(0, FIELD.goalTop, FIELD.leftGoalX, FIELD.goalBottom - FIELD.goalTop);
    ctx.fillRect(FIELD.rightGoalX, FIELD.goalTop, FIELD.width - FIELD.rightGoalX, FIELD.goalBottom - FIELD.goalTop);

    // goal net pattern
    ctx.save();
    ctx.strokeStyle = "rgba(150,150,150,0.55)";
    ctx.lineWidth = 0.8;
    for (let nx = 10; nx < FIELD.leftGoalX; nx += 10) {
        ctx.beginPath(); ctx.moveTo(nx, FIELD.goalTop); ctx.lineTo(nx, FIELD.goalBottom); ctx.stroke();
    }
    for (let ny = FIELD.goalTop + 14; ny < FIELD.goalBottom; ny += 14) {
        ctx.beginPath(); ctx.moveTo(0, ny); ctx.lineTo(FIELD.leftGoalX, ny); ctx.stroke();
    }
    for (let nx = FIELD.rightGoalX + 10; nx < FIELD.width; nx += 10) {
        ctx.beginPath(); ctx.moveTo(nx, FIELD.goalTop); ctx.lineTo(nx, FIELD.goalBottom); ctx.stroke();
    }
    for (let ny = FIELD.goalTop + 14; ny < FIELD.goalBottom; ny += 14) {
        ctx.beginPath(); ctx.moveTo(FIELD.rightGoalX, ny); ctx.lineTo(FIELD.width, ny); ctx.stroke();
    }
    ctx.restore();

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

    players.forEach((p, idx) => drawPixelPlayer(p, "#1e90ff", false, idx === 0));
    aiPlayers.forEach(p => drawPixelPlayer(p, "#ff4747", false, false));

    drawPixelPlayer(goalies.player, "#f8d96a", true, false);
    drawPixelPlayer(goalies.ai, "#ffb17a", true, false);

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
            const arrowLength = 90 + shotState.charge;
            const ax = shooter.x + shotState.aimX * arrowLength;
            const ay = shooter.y + shotState.aimY * arrowLength;

            ctx.save();
            ctx.strokeStyle = "#ff4444";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(shooter.x, shooter.y);
            ctx.lineTo(ax, ay);
            ctx.stroke();

            // Arrowhead triangle
            const angle = Math.atan2(shotState.aimY, shotState.aimX);
            ctx.translate(ax, ay);
            ctx.rotate(angle);
            ctx.fillStyle = "#ff4444";
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
    const legendText = "Arrow Keys/WASD: Move  |  N: Pass  |  Hold M/Space: Shoot (longer = stronger)  |  Hold X: Charged Pass  |  L/Z: Tackle  |  K: Switch (def)  |  P: Pause";
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

    // Goal celebration flash overlay
    if (goalFlash.timer > 0) {
        const alpha = Math.min(1, goalFlash.timer / 50) * 0.55;
        ctx.fillStyle = goalFlash.team === "player"
            ? `rgba(30,100,255,${alpha})` : `rgba(255,50,50,${alpha})`;
        ctx.fillRect(0, 0, FIELD.width, FIELD.height);
        const textAlpha = Math.min(1, goalFlash.timer / 60);
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "bold 92px Arial";
        ctx.fillStyle = `rgba(255,255,255,${textAlpha})`;
        ctx.strokeStyle = `rgba(0,0,0,${textAlpha})`;
        ctx.lineWidth = 6;
        ctx.strokeText("GOAL!", FIELD.width / 2, FIELD.height / 2 - 20);
        ctx.fillText("GOAL!", FIELD.width / 2, FIELD.height / 2 - 20);
        ctx.font = "bold 30px Arial";
        const teamText = goalFlash.team === "player" ? "HOME TEAM SCORES!" : "AWAY TEAM SCORES!";
        ctx.fillStyle = `rgba(255,255,100,${textAlpha * 0.9})`;
        ctx.fillText(teamText, FIELD.width / 2, FIELD.height / 2 + 55);
        ctx.restore();
    }

    // Low-insulin vignette warning (story mode only)
    if (isStoryMatch && typeof updateOttoInsulin === "function" && ottoInsulin < 30) {
        const severity = 1 - ottoInsulin / 30;
        const vigAlpha = severity * 0.35;
        const grad = ctx.createRadialGradient(
            FIELD.width / 2, FIELD.height / 2, FIELD.width * 0.25,
            FIELD.width / 2, FIELD.height / 2, FIELD.width * 0.75
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, `rgba(160,0,0,${vigAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, FIELD.width, FIELD.height);
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
        "Controls: Arrow Keys / WASD move | N: quick pass (aim with arrow keys/WASD first, control auto-switches to recipient) | " +
        "Hold M or Space and aim then release to shoot — longer hold = stronger shot | " +
        "Hold X then release for charged pass | " +
        "Goalie auto-passes after 2 s if you don't act | " +
        "L or Z: tackle | K: switch player on defense | P: pause menu."
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

function drawPixelPlayer(p, color, isGoalie, isControlled) {
    const x = p.x;
    const y = p.y;
    const r = p.r;
    const bounce = Math.sin(p.animOffset || 0) * 1.5;
    const drawY = y + bounce;
    const legCycle = Math.sin(p.animOffset || 0);
    const headR = r * 0.72;
    const headY = drawY - r - headR * 0.55;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y + r + 6, r * 1.1, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet / cleats (drawn before body so body overlaps the base of the legs)
    const shoeW = r * 0.30;
    const shoeH = r * 0.16;
    const shoeY = drawY + r - 1;
    const footSwing = legCycle * r * 0.32;
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.ellipse(x - r * 0.25 - footSwing, shoeY + shoeH + 2, shoeW, shoeH, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + r * 0.25 + footSwing, shoeY + shoeH + 2, shoeW, shoeH, 0.18, 0, Math.PI * 2);
    ctx.fill();
    // Cleat accent stripe
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(x - r * 0.25 - footSwing, shoeY + shoeH, shoeW * 0.55, shoeH * 0.38, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + r * 0.25 + footSwing, shoeY + shoeH, shoeW * 0.55, shoeH * 0.38, 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Hands (skin-tone circles that swing opposite to feet)
    const handR = r * 0.24;
    const armSwing = legCycle * r * 0.22;
    ctx.fillStyle = "#f1c27d";
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x - r - handR * 0.7 + armSwing, drawY + r * 0.25, handR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + r + handR * 0.7 - armSwing, drawY + r * 0.25, handR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(x, drawY, r * 0.75, r * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = isControlled ? 3 : 2;
    ctx.strokeStyle = isControlled ? "yellow" : "black";
    ctx.stroke();

    // Goalie gloves
    if (isGoalie) {
        const gloveR = r * 0.32;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x - r - gloveR, drawY + r * 0.2, gloveR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + r + gloveR, drawY + r * 0.2, gloveR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Head (larger for anime proportions)
    ctx.beginPath();
    ctx.fillStyle = "#f1c27d";
    ctx.arc(x, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Hair (dark top — anime style)
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(x, headY, headR, Math.PI + 0.25, 2 * Math.PI - 0.25);
    ctx.lineTo(x, headY);
    ctx.closePath();
    ctx.fill();

    // Anime eyes (large with white shine dot)
    const eyeW = headR * 0.23;
    const eyeH = headR * 0.32;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.ellipse(x - headR * 0.3, headY - headR * 0.06, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + headR * 0.3, headY - headR * 0.06, eyeW, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x - headR * 0.23, headY - headR * 0.14, headR * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + headR * 0.37, headY - headR * 0.14, headR * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(x, headY + headR * 0.22, headR * 0.22, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = "#774422";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Jersey number (outfield only)
    if (!isGoalie && p.number !== undefined) {
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(p.number, x, drawY + 4);
        ctx.textAlign = "left";
    }

    // Stamina bar (above head)
    if (!isGoalie && p.team === "player" && p.stamina !== undefined) {
        const barY = headY - headR - 4;
        ctx.fillStyle = "black";
        ctx.fillRect(x - 10, barY, 20, 4);
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(x - 10, barY, (p.stamina / 100) * 20, 4);
    }

    // Tackle animation: expanding ring + label
    if (isControlled && tackleActive) {
        const tiltSpeed = Math.hypot(p.vx || 0, p.vy || 0);
        const label = tiltSpeed > 1.5 ? "SLIDE!" : "TACKLE!";
        // Fade from 0.9 → 0 over TACKLE_DURATION frames (step ≈ 0.9 / TACKLE_DURATION)
        const alpha = Math.max(0, 0.9 - tackleTimer * (0.9 / TACKLE_DURATION));
        ctx.save();
        ctx.strokeStyle = `rgba(255,200,50,${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, r + 8 + tackleTimer * 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,220,80,${alpha})`;
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(label, x, headY - headR - 10);
        ctx.textAlign = "left";
        ctx.restore();
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

function blockPlayerFromGoalArea(p) {
    if (p.y > FIELD.goalTop && p.y < FIELD.goalBottom) {
        if (p.x - p.r < FIELD.leftGoalX) p.x = FIELD.leftGoalX + p.r;
        if (p.x + p.r > FIELD.rightGoalX) p.x = FIELD.rightGoalX - p.r;
    }
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
    if ((key === "m" || key === " ") && !e.repeat) { shotState.held = true; shotState.charge = 0; shotState.aimX = controlState.dirX; shotState.aimY = controlState.dirY; }
    if (key === "l" && tackleCooldown <= 0) { tackleActive = true; tackleCooldown = TACKLE_COOLDOWN_FRAMES; tackleTimer = 0; }
    if (key === "z" && tackleCooldown <= 0) { tackleActive = true; tackleCooldown = TACKLE_COOLDOWN_FRAMES; tackleTimer = 0; }

    // K: switch to the player on the team nearest to the ball (best defensive position)
    // Search from index 1: players[0] is already controlled, so we never switch to them.
    if (key === "k" && players.length > 1 && possession.team !== "player") {
        let nearestIdx = 1; // default to next player if all are equidistant
        let nearestDist = Infinity;
        for (let i = 1; i < players.length; i++) {
            const d = distance(players[i].x, players[i].y, ball.x, ball.y);
            if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
        }
        players.unshift(...players.splice(nearestIdx, 1));
    }
});

document.addEventListener("keyup", e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    setDirection(key, false);

    if ((key === "m" || key === " ") && shotState.held) {
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
