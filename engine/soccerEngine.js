let canvas, ctx;
let ball;
let players = [];
let aiPlayers = [];
let goalies = { player: null, ai: null };
let score = { player: 0, ai: 0 };
let matchRunning = false;
let onMatchComplete = null;

const FIELD = {
    width: 1200,
    height: 700,
    goalTop: 250,
    goalBottom: 450,
    leftGoalX: 50,
    rightGoalX: 1150,
    leftPostTop: { x: 50, y: 250 },
    leftPostBottom: { x: 50, y: 450 },
    rightPostTop: { x: 1150, y: 250 },
    rightPostBottom: { x: 1150, y: 450 },
    playerBox: { x: 0, y: 190, w: 190, h: 320 },
    aiBox: { x: 1010, y: 190, w: 190, h: 320 }
};

const FORMATION_Y = [150, 280, 420, 550];

const input = { up: false, down: false, left: false, right: false };

const possession = { owner: null, team: null, lockTimer: 0 };

const controlState = { dirX: 1, dirY: 0 };

function startMatch(chapter, done) {
    onMatchComplete = done || null;
    screen.innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.width = FIELD.width;
    canvas.height = FIELD.height;
    screen.appendChild(canvas);
    ctx = canvas.getContext("2d");

    initMatch();
    matchRunning = true;
    requestAnimationFrame(gameLoop);
}

function initMatch() {
    ball = { x: 600, y: 350, vx: 0, vy: 0, radius: 10 };
    players = [];
    aiPlayers = [];
    score = { player: 0, ai: 0 };
    possession.owner = null;
    possession.team = null;
    possession.lockTimer = 0;

    for (let i = 0; i < 4; i++) {
        players.push({ x: 250, y: FORMATION_Y[i], speed: 3.8, r: 15, team: "player" });
        aiPlayers.push({ x: 950, y: FORMATION_Y[i], speed: 1.4, r: 15, team: "ai" });
    }

    goalies.player = { x: 95, y: FIELD.height / 2, r: 17, speed: 3.3, box: FIELD.playerBox, team: "player" };
    goalies.ai = { x: 1105, y: FIELD.height / 2, r: 17, speed: 3.3, box: FIELD.aiBox, team: "ai" };
}

function gameLoop() {
    if (!matchRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (possession.lockTimer > 0) possession.lockTimer--;

    moveControlledPlayer();
    updateAIOutfield();
    updateGoalie(goalies.player);
    updateGoalie(goalies.ai);

    updatePlayerPossession();

    if (possession.owner) {
        carryBallWithOwner();
    } else {
        ball.x += ball.vx;
        ball.y += ball.vy;
    }

    handleFieldBoundariesAndPosts();
    detectGoals();

    if (!possession.owner) {
        ball.vx *= 0.985;
        ball.vy *= 0.985;
        if (Math.abs(ball.vx) < 0.03) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.03) ball.vy = 0;
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

function updateAIOutfield() {
    const aiCarrier = possession.team === "ai" ? possession.owner : null;
    const playerCarrier = possession.team === "player" ? possession.owner : null;

    const bestAttacker = findBestAIAttacker();

    aiPlayers.forEach((p, i) => {
        const isPressing = isClosestAIToBall(p);
        let targetX = 900;
        let targetY = FORMATION_Y[i];

        if (isPressing) {
            targetX = playerCarrier ? playerCarrier.x : ball.x;
            targetY = playerCarrier ? playerCarrier.y : ball.y;
        } else if (aiCarrier) {
            if (p === bestAttacker) {
                // primary runner goes to goal lane
                targetX = 760;
                targetY = clamp(aiCarrier.y + (Math.random() - 0.5) * 80, FIELD.goalTop + 20, FIELD.goalBottom - 20);
            } else {
                // support shape around ball carrier
                targetX = clamp(aiCarrier.x - 90 + (i * 25), 680, 980);
                targetY = clamp(aiCarrier.y + (i - 1.5) * 90, 80, FIELD.height - 80);
            }
        }

        const to = normalize(targetX - p.x, targetY - p.y);
        p.x += to.x * p.speed;
        p.y += to.y * p.speed;
        p.x = clamp(p.x, p.r, FIELD.width - p.r);
        p.y = clamp(p.y, p.r, FIELD.height - p.r);

        if (playerCarrier && possession.lockTimer <= 0) {
            const d = distance(p.x, p.y, playerCarrier.x, playerCarrier.y);
            if (d < p.r + playerCarrier.r + 7 && Math.random() < 0.06) {
                possession.owner = p;
                possession.team = "ai";
                possession.lockTimer = 10;
                ball.vx = 0;
                ball.vy = 0;
            }
        }
    });

    // AI attacking behavior: drive to goal, pass only if blocked, shoot near goal
    if (possession.team === "ai" && possession.owner) {
        const carrier = possession.owner;
        const closeToGoal = carrier.x < 420;
        const inShotLane = carrier.y > FIELD.goalTop - 20 && carrier.y < FIELD.goalBottom + 20;

        // dribble toward goal by default (less pointless side passing)
        const directToGoal = normalize(FIELD.leftGoalX - carrier.x, FIELD.height / 2 - carrier.y);
        carrier.x += directToGoal.x * 1.2;
        carrier.y += directToGoal.y * 0.8;

        // shoot when within realistic zone
        if (closeToGoal && inShotLane && Math.random() < 0.28) {
            const targetY = clamp(carrier.y + (Math.random() - 0.5) * 55, FIELD.goalTop + 12, FIELD.goalBottom - 12);
            const shotDir = normalize(FIELD.leftGoalX - ball.x, targetY - ball.y);
            releasePossession(shotDir.x * 18, shotDir.y * 6.5);
            return;
        }

        // pass only when pressure is high and teammate is in a better lane
        const nearestPlayerDef = players.reduce((best, pl) => {
            const d = distance(pl.x, pl.y, carrier.x, carrier.y);
            return d < best ? d : best;
        }, Infinity);

        if (nearestPlayerDef < 85 && Math.random() < 0.09) {
            const mate = findBestAIPassTarget(carrier);
            if (mate) {
                const passDir = normalize(mate.x - carrier.x, mate.y - carrier.y);
                releasePossession(passDir.x * 6.2, passDir.y * 5.2);
                possession.owner = mate;
                possession.team = "ai";
                possession.lockTimer = 12;
            }
        }
    }
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
        if (dist < 45) return;
        const towardGoal = -normalize(vx, vy).x;
        const score = towardGoal * 500 - Math.abs(vy) - dist * 0.2;
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
    const defendY = clamp(ball.y, FIELD.goalTop - 30, FIELD.goalBottom + 30);
    const defendX = goalie.team === "player" ? 105 : 1095;
    const to = normalize(defendX - goalie.x, defendY - goalie.y);

    goalie.x += to.x * goalie.speed;
    goalie.y += to.y * goalie.speed;
    goalie.x = clamp(goalie.x, goalie.box.x + goalie.r, goalie.box.x + goalie.box.w - goalie.r);
    goalie.y = clamp(goalie.y, goalie.box.y + goalie.r, goalie.box.y + goalie.box.h - goalie.r);

    if (distance(goalie.x, goalie.y, ball.x, ball.y) < goalie.r + 12) {
        if (possession.owner && possession.team !== goalie.team) {
            possession.owner = goalie;
            possession.team = goalie.team;
            possession.lockTimer = 10;
        } else if (!possession.owner) {
            const clearDir = goalie.team === "player" ? 1 : -1;
            ball.vx = clearDir * (8 + Math.random() * 3);
            ball.vy = (Math.random() - 0.5) * 4;
        }
    }
}

function updatePlayerPossession() {
    const selected = players[0];
    if (!selected) return;

    const dist = distance(selected.x, selected.y, ball.x, ball.y);
    if (!possession.owner && dist < selected.r + 18) {
        possession.owner = selected;
        possession.team = "player";
        possession.lockTimer = 24;
        ball.vx = 0;
        ball.vy = 0;
    }

    if (possession.team === "player" && possession.owner !== selected) {
        possession.owner = selected;
    }
}

function carryBallWithOwner() {
    const owner = possession.owner;
    if (!owner) return;

    let dirX = controlState.dirX;
    let dirY = controlState.dirY;

    if (possession.team === "ai") {
        dirX = -1;
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
    const selected = players[0];
    if (!selected) return;
    if (!ensurePlayerControlForAction(selected, 22)) return;

    const dir = normalize(controlState.dirX, controlState.dirY);
    const teammate = findBestPassTarget(selected, dir);

    if (teammate) {
        const toMate = normalize(teammate.x - selected.x, teammate.y - selected.y);
        releasePossession(toMate.x * 10.5, toMate.y * 10.5);
        setControlledPlayer(teammate);
        possession.owner = players[0];
        possession.team = "player";
        possession.lockTimer = 12;
    } else {
        releasePossession(dir.x * 9.5, dir.y * 9.5);
    }
}

function performShotToRightGoal() {
    let shooter = players[0];
    if (!shooter) return;

    if (possession.team === "player" && possession.owner && players.includes(possession.owner)) {
        shooter = possession.owner;
        setControlledPlayer(shooter);
    }

    // If selected player is not close enough, fallback to nearest teammate to the ball.
    if (!ensurePlayerControlForAction(shooter, 44)) {
        let nearest = players[0];
        let bestDist = Infinity;
        players.forEach(p => {
            const d = distance(p.x, p.y, ball.x, ball.y);
            if (d < bestDist) {
                bestDist = d;
                nearest = p;
            }
        });

        shooter = nearest;
        setControlledPlayer(shooter);

        // Final fallback: if still not in strict possession, allow a loose-ball shot when close.
        if (!ensurePlayerControlForAction(shooter, 52)) {
            const looseBallDistance = distance(shooter.x, shooter.y, ball.x, ball.y);
            if (looseBallDistance > shooter.r + 30) return;
            possession.owner = shooter;
            possession.team = "player";
            possession.lockTimer = 2;
        }
    }

    // Place ball in front of shooter and force a rightward strike direction.
    ball.x = shooter.x + shooter.r + ball.radius - 2;
    ball.y = shooter.y + controlState.dirY * 3;

    const targetX = FIELD.width - 2;
    const targetY = clamp(ball.y + controlState.dirY * 70, FIELD.goalTop + 8, FIELD.goalBottom - 8);
    const shot = normalize(targetX - ball.x, targetY - ball.y);

    const strongRightX = Math.max(0.82, shot.x);
    releasePossession(strongRightX * 24, shot.y * 6.2);
}

function findBestPassTarget(selected, dir) {
    let best = null;
    let bestScore = -Infinity;

    for (let i = 1; i < players.length; i++) {
        const mate = players[i];
        const vx = mate.x - selected.x;
        const vy = mate.y - selected.y;
        const dist = Math.hypot(vx, vy);
        if (dist < 40) continue;

        const n = normalize(vx, vy);
        const alignment = n.x * dir.x + n.y * dir.y;
        if (alignment < 0.15) continue;

        const score = alignment * 1200 - dist;
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

    if (possession.team === "ai" && possession.owner) {
        const enemy = possession.owner;
        const d = distance(selected.x, selected.y, enemy.x, enemy.y);
        if (d < selected.r + enemy.r + 14) {
            possession.owner = selected;
            possession.team = "player";
            possession.lockTimer = 20;
            ball.vx = 0;
            ball.vy = 0;
            return;
        }
    }

    if (!possession.owner && distance(selected.x, selected.y, ball.x, ball.y) < selected.r + 16) {
        possession.owner = selected;
        possession.team = "player";
        possession.lockTimer = 14;
        ball.vx = 0;
        ball.vy = 0;
    }
}

function handleFieldBoundariesAndPosts() {
    // top/bottom lines
    if (ball.y < ball.radius) {
        ball.y = ball.radius;
        ball.vy *= -0.8;
    }
    if (ball.y > FIELD.height - ball.radius) {
        ball.y = FIELD.height - ball.radius;
        ball.vy *= -0.8;
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
        ball.vx = Math.abs(ball.vx) + 2;
    }
    if (ball.x >= FIELD.rightGoalX && !sideOpen) {
        ball.x = FIELD.rightGoalX - ball.radius;
        ball.vx = -Math.abs(ball.vx) - 2;
    }
}

function detectGoals() {
    if (ball.x <= FIELD.leftGoalX && ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom) {
        score.ai++;
        resetBall();
    }

    if (ball.x >= FIELD.rightGoalX && ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom) {
        score.player++;
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
    ball.vx = kickVX;
    ball.vy = kickVY;
}

function resetBall() {
    possession.owner = null;
    possession.team = null;
    possession.lockTimer = 0;
    ball.x = FIELD.width / 2;
    ball.y = FIELD.height / 2;
    ball.vx = 0;
    ball.vy = 0;
}

function endMatch() {
    matchRunning = false;
    screen.innerHTML = `
        <h2>Match Finished</h2>
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

    const selected = players[0];
    if (selected) {
        ctx.beginPath();
        ctx.moveTo(selected.x, selected.y);
        ctx.lineTo(ball.x, ball.y);
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Player ${score.player} - ${score.ai} AI`, 490, 32);
    ctx.font = "16px Arial";
    ctx.fillText("Move: W A S D | Offense: N pass, M shoot | Defense: K switch, L tackle", 220, 60);
    ctx.fillText("AI pace reduced further for fairer build-up and ball recovery.", 290, 84);
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

    // body
    ctx.fillStyle = color;
    ctx.fillRect(x - 7, y - 9, 14, 18);

    // head
    ctx.fillStyle = "#ffd7b0";
    ctx.fillRect(x - 5, y - 15, 10, 6);

    // legs
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 6, y + 9, 4, 6);
    ctx.fillRect(x + 2, y + 9, 4, 6);

    // gloves for goalies
    if (isGoalie) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 11, y - 2, 4, 4);
        ctx.fillRect(x + 7, y - 2, 4, 4);
    }
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function setDirection(key, pressed) {
    if (key === "w") input.up = pressed;
    if (key === "s") input.down = pressed;
    if (key === "a") input.left = pressed;
    if (key === "d") input.right = pressed;
}

document.addEventListener("keydown", e => {
    if (!matchRunning) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    setDirection(key, true);

    const selected = players[0];
    if (!selected) return;

    if (key === "n") performPass();
    if (key === "m") performShotToRightGoal();
    if (key === "l") attemptTackle();

    // K only on defense (no player possession)
    if (key === "k" && players.length > 1 && possession.team !== "player") {
        players.push(players.shift());
    }
});

document.addEventListener("keyup", e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    setDirection(key, false);
});
