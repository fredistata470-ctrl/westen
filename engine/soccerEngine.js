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
    playerBox: { x: 0, y: 190, w: 190, h: 320 },
    aiBox: { x: 1010, y: 190, w: 190, h: 320 }
};

const input = {
    up: false,
    down: false,
    left: false,
    right: false
};

const possession = {
    owner: null,
    team: null,
    lockTimer: 0
};

const controlState = {
    dirX: 1,
    dirY: 0
};

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

    for (let i = 0; i < 5; i++) {
        players.push({ x: 220, y: 130 + i * 105, speed: 5.8, r: 15, team: "player" });
        aiPlayers.push({ x: 980, y: 130 + i * 105, speed: 2.8, r: 15, team: "ai" });
    }

    goalies.player = {
        x: 90,
        y: FIELD.height / 2,
        r: 17,
        speed: 3.4,
        box: FIELD.playerBox,
        team: "player"
    };

    goalies.ai = {
        x: 1110,
        y: FIELD.height / 2,
        r: 17,
        speed: 3.4,
        box: FIELD.aiBox,
        team: "ai"
    };
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

    // Ball never leaves the field
    if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.vx *= -0.8;
    }
    if (ball.x > FIELD.width - ball.radius) {
        ball.x = FIELD.width - ball.radius;
        ball.vx *= -0.8;
    }
    if (ball.y < ball.radius) {
        ball.y = ball.radius;
        ball.vy *= -0.8;
    }
    if (ball.y > FIELD.height - ball.radius) {
        ball.y = FIELD.height - ball.radius;
        ball.vy *= -0.8;
    }

    // Goal detection (front line only)
    if (ball.x <= FIELD.leftGoalX && ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom) {
        score.ai++;
        resetBall();
    }

    if (ball.x >= FIELD.rightGoalX && ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom) {
        score.player++;
        resetBall();
    }

    if (!possession.owner) {
        ball.vx *= 0.985;
        ball.vy *= 0.985;

        if (Math.abs(ball.vx) < 0.03) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.03) ball.vy = 0;
    }

    if (score.player >= 3 || score.ai >= 3) {
        endMatch();
    }
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
    aiPlayers.forEach((p, i) => {
        const pressureTargetX = possession.team === "player" && possession.owner ? possession.owner.x : ball.x;
        const pressureTargetY = possession.team === "player" && possession.owner ? possession.owner.y : ball.y;
        const targetX = i === 0 ? pressureTargetX : 920;
        const targetY = i === 0 ? pressureTargetY : 130 + i * 105;

        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const d = Math.hypot(dx, dy) || 1;

        p.x += (dx / d) * p.speed;
        p.y += (dy / d) * p.speed;

        p.x = clamp(p.x, p.r, FIELD.width - p.r);
        p.y = clamp(p.y, p.r, FIELD.height - p.r);

        const ballDist = distance(p.x, p.y, ball.x, ball.y);
        if (
            possession.team === "player" &&
            possession.owner &&
            possession.lockTimer <= 0 &&
            ballDist < p.r + 4 &&
            Math.random() < 0.02
        ) {
            possession.owner = p;
            possession.team = "ai";
            possession.lockTimer = 8;
            ball.vx = 0;
            ball.vy = 0;
        }

        if (!possession.owner && ballDist < p.r + 10 && Math.random() < 0.04) {
            ball.vx = -7 - Math.random() * 3;
            ball.vy = (Math.random() - 0.5) * 7;
        }
    });
}

function updateGoalie(goalie) {
    const centerY = FIELD.height / 2;

    // Stay in box and defend only goal area
    const defendY = clamp(ball.y, FIELD.goalTop - 35, FIELD.goalBottom + 35);
    const defendX = goalie.team === "player" ? 105 : 1095;

    const dx = defendX - goalie.x;
    const dy = defendY - goalie.y;
    const d = Math.hypot(dx, dy) || 1;

    goalie.x += (dx / d) * goalie.speed;
    goalie.y += (dy / d) * goalie.speed;

    goalie.x = clamp(goalie.x, goalie.box.x + goalie.r, goalie.box.x + goalie.box.w - goalie.r);
    goalie.y = clamp(goalie.y, goalie.box.y + goalie.r, goalie.box.y + goalie.box.h - goalie.r);

    if (distance(goalie.x, goalie.y, ball.x, ball.y) < goalie.r + 12) {
        const clearDir = goalie.team === "player" ? 1 : -1;
        if (possession.owner && possession.team !== goalie.team) {
            possession.owner = goalie;
            possession.team = goalie.team;
            possession.lockTimer = 10;
        } else if (!possession.owner) {
            ball.vx = clearDir * (8 + Math.random() * 3);
            ball.vy = (ball.y - centerY) * 0.04;
        }
    }
}


function updatePlayerPossession() {
    const selected = players[0];
    if (!selected) return;

    const dist = distance(selected.x, selected.y, ball.x, ball.y);

    if (!possession.owner && dist < selected.r + 14) {
        possession.owner = selected;
        possession.team = "player";
        possession.lockTimer = 28;
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
        const attackDir = -1;
        dirX = attackDir;
        dirY = 0;
    }

    const holdDistance = owner.r + ball.radius - 4;
    const targetX = owner.x + dirX * holdDistance;
    const targetY = owner.y + dirY * holdDistance;

    // Strong foot-lock so ball stays controlled while turning/running
    ball.x += (targetX - ball.x) * 0.78;
    ball.y += (targetY - ball.y) * 0.78;
    ball.vx = 0;
    ball.vy = 0;
}

function ensurePlayerControlForAction(selected, range = 18) {
    if (!selected) return false;

    if (possession.owner === selected && possession.team === "player") {
        return true;
    }

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
    if (!ensurePlayerControlForAction(selected, 20)) return;

    const dir = normalize(controlState.dirX, controlState.dirY);
    const teammate = findBestPassTarget(selected, dir);

    if (teammate) {
        const toMate = normalize(teammate.x - selected.x, teammate.y - selected.y);
        releasePossession(toMate.x * 10.5, toMate.y * 10.5);
        setControlledPlayer(teammate);
    } else {
        // fallback forward pass in move direction
        releasePossession(dir.x * 9.5, dir.y * 9.5);
    }
}

function performShotToRightGoal() {
    const selected = players[0];
    if (!selected) return;
    if (!ensurePlayerControlForAction(selected, 22)) return;

    const goalTargetX = FIELD.rightGoalX + 8;
    const goalTargetY = clamp(selected.y, FIELD.goalTop + 10, FIELD.goalBottom - 10);
    const shotDir = normalize(goalTargetX - ball.x, goalTargetY - ball.y);
    releasePossession(shotDir.x * 15.5, shotDir.y * 6.5);
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
        if (alignment < 0.2) continue;

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
        if (d < selected.r + enemy.r + 8) {
            possession.owner = selected;
            possession.team = "player";
            possession.lockTimer = 20;
            ball.vx = 0;
            ball.vy = 0;
            return;
        }
    }

    if (!possession.owner && distance(selected.x, selected.y, ball.x, ball.y) < selected.r + 14) {
        possession.owner = selected;
        possession.team = "player";
        possession.lockTimer = 16;
        ball.vx = 0;
        ball.vy = 0;
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

    // Mid line
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(FIELD.width / 2, 0);
    ctx.lineTo(FIELD.width / 2, FIELD.height);
    ctx.stroke();

    // Goalie boxes
    ctx.strokeStyle = "#f0f0f0";
    ctx.strokeRect(FIELD.playerBox.x, FIELD.playerBox.y, FIELD.playerBox.w, FIELD.playerBox.h);
    ctx.strokeRect(FIELD.aiBox.x, FIELD.aiBox.y, FIELD.aiBox.w, FIELD.aiBox.h);

    // Goals
    ctx.fillStyle = "white";
    ctx.fillRect(0, FIELD.goalTop, FIELD.leftGoalX, FIELD.goalBottom - FIELD.goalTop);
    ctx.fillRect(FIELD.rightGoalX, FIELD.goalTop, FIELD.width - FIELD.rightGoalX, FIELD.goalBottom - FIELD.goalTop);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    // Ball locator ring (easier tracking)
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Outfield players
    players.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? "#5ff0ff" : "blue";
        ctx.fill();
    });

    aiPlayers.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });

    // Goalies
    drawGoalie(goalies.player, "#f8d96a");
    drawGoalie(goalies.ai, "#ff9a9a");

    // Selected player helper line to ball
    const selected = players[0];
    if (selected) {
        ctx.beginPath();
        ctx.moveTo(selected.x, selected.y);
        ctx.lineTo(ball.x, ball.y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Player ${score.player} - ${score.ai} AI`, 490, 32);
    ctx.font = "16px Arial";
    ctx.fillText("Move: W A S D | Offense: N pass, M shoot | Defense: K switch, L tackle", 220, 60);
    ctx.fillText("Goalies stay in their own boxes and auto-defend.", 460, 84);
    ctx.fillText(`Ball: ${Math.round(ball.x)}, ${Math.round(ball.y)}`, 20, 30);
    ctx.fillText("Tip: keep moving while close to the ball for FIFA-style close control.", 20, 54);
}

function drawGoalie(goalie, color) {
    if (!goalie) return;
    ctx.beginPath();
    ctx.arc(goalie.x, goalie.y, goalie.r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function canKick(player, range = 34) {
    return player && distance(player.x, player.y, ball.x, ball.y) <= range;
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

    if (key === "n") {
        performPass();
    }

    if (key === "m") {
        performShotToRightGoal();
    }

    if (key === "l") {
        attemptTackle();
    }

    if (key === "k" && players.length > 1) {
        players.push(players.shift());
    }
});

document.addEventListener("keyup", e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    setDirection(key, false);
});
