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

    for (let i = 0; i < 5; i++) {
        players.push({ x: 220, y: 130 + i * 105, speed: 4.6, r: 15, team: "player" });
        aiPlayers.push({ x: 980, y: 130 + i * 105, speed: 3.2, r: 15, team: "ai" });
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
    moveControlledPlayer();
    updateAIOutfield();
    updateGoalie(goalies.player);
    updateGoalie(goalies.ai);

    ball.x += ball.vx;
    ball.y += ball.vy;

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

    ball.vx *= 0.985;
    ball.vy *= 0.985;

    if (Math.abs(ball.vx) < 0.03) ball.vx = 0;
    if (Math.abs(ball.vy) < 0.03) ball.vy = 0;

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
        selected.x += (dx / len) * selected.speed;
        selected.y += (dy / len) * selected.speed;
    }

    selected.x = clamp(selected.x, selected.r, FIELD.width - selected.r);
    selected.y = clamp(selected.y, selected.r, FIELD.height - selected.r);

    // light dribble if very close
    const dist = distance(selected.x, selected.y, ball.x, ball.y);
    if (dist < selected.r + 12) {
        ball.vx += (selected.x - ball.x) * -0.02;
        ball.vy += (selected.y - ball.y) * -0.02;
    }
}

function updateAIOutfield() {
    aiPlayers.forEach((p, i) => {
        const targetX = i === 0 ? ball.x : 920;
        const targetY = i === 0 ? ball.y : 130 + i * 105;

        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const d = Math.hypot(dx, dy) || 1;

        p.x += (dx / d) * p.speed;
        p.y += (dy / d) * p.speed;

        p.x = clamp(p.x, p.r, FIELD.width - p.r);
        p.y = clamp(p.y, p.r, FIELD.height - p.r);

        if (distance(p.x, p.y, ball.x, ball.y) < p.r + 10 && Math.random() < 0.06) {
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
        ball.vx = clearDir * (8 + Math.random() * 3);
        ball.vy = (ball.y - centerY) * 0.04;
    }
}

function resetBall() {
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

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Player ${score.player} - ${score.ai} AI`, 490, 32);
    ctx.font = "16px Arial";
    ctx.fillText("Move: Arrow Keys / WASD | M: Pass | N: Shoot | K: Switch Player | L: Tackle", 300, 60);
    ctx.fillText("Goalies stay in their own boxes and auto-defend.", 460, 84);
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
    if (key === "ArrowUp" || key === "w") input.up = pressed;
    if (key === "ArrowDown" || key === "s") input.down = pressed;
    if (key === "ArrowLeft" || key === "a") input.left = pressed;
    if (key === "ArrowRight" || key === "d") input.right = pressed;
}

document.addEventListener("keydown", e => {
    if (!matchRunning) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    setDirection(key, true);

    const selected = players[0];
    if (!selected) return;

    if (key === "m" && canKick(selected)) {
        ball.vx = 7;
        ball.vy = (Math.random() - 0.5) * 3;
    }

    if (key === "n" && canKick(selected)) {
        ball.vx = 13;
        ball.vy = (Math.random() - 0.5) * 4;
    }

    if (key === "l" && canKick(selected, 40)) {
        ball.vx = 5;
        ball.vy = (Math.random() - 0.5) * 8;
    }

    if (key === "k" && players.length > 1) {
        players.push(players.shift());
    }
});

document.addEventListener("keyup", e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    setDirection(key, false);
});
