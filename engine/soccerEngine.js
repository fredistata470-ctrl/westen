let canvas, ctx;
let ball;
let players = [];
let aiPlayers = [];
let score = { player: 0, ai: 0 };
let matchTimeLeft = 30;
let matchTimer = null;
let matchEndCallback = null;

function startMatch(chapter, onMatchEnd) {
    screen.innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    screen.appendChild(canvas);

    ctx = canvas.getContext("2d");
    matchEndCallback = onMatchEnd;

    initMatch();

    if (matchTimer) {
        clearInterval(matchTimer);
    }

    matchTimer = setInterval(() => {
        matchTimeLeft--;
        if (matchTimeLeft <= 0) {
            clearInterval(matchTimer);
            matchTimer = null;
            endMatch();
        }
    }, 1000);

    requestAnimationFrame(gameLoop);
}

function initMatch() {
    ball = { x: 600, y: 350, vx: 0, vy: 0 };
    players = [];
    aiPlayers = [];
    score = { player: 0, ai: 0 };
    matchTimeLeft = 30;

    for (let i = 0; i < 5; i++) {
        players.push({ x: 200, y: 150 + i * 80, team: "player" });
        aiPlayers.push({ x: 1000, y: 150 + i * 80, team: "ai" });
    }
}

function gameLoop() {
    if (!canvas || !ctx) {
        return;
    }

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    ball.vx *= 0.985;
    ball.vy *= 0.985;

    if (Math.abs(ball.vx) < 0.02) ball.vx = 0;
    if (Math.abs(ball.vy) < 0.02) ball.vy = 0;

    if (ball.x < 0 || ball.x > canvas.width) ball.vx *= -1;
    if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;

    if (ball.x <= 50 && ball.y > 250 && ball.y < 450) {
        score.ai++;
        resetBall();
    }

    if (ball.x >= 1150 && ball.y > 250 && ball.y < 450) {
        score.player++;
        resetBall();
    }

    aiPassLogic();
}

function aiPassLogic() {
    if (!aiPlayers.length) return;

    const nearest = aiPlayers.reduce((best, p) => {
        const d = (p.x - ball.x) ** 2 + (p.y - ball.y) ** 2;
        if (!best || d < best.d) return { p, d };
        return best;
    }, null).p;

    const dx = ball.x - nearest.x;
    const dy = ball.y - nearest.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 100 && Math.random() < 0.02) {
        ball.vx = -6 - Math.random() * 4;
        ball.vy = (Math.random() - 0.5) * 6;
    }
}

function endMatch() {
    canvas = null;
    ctx = null;
    screen.innerHTML = `
        <h2>Full Time</h2>
        <p>Player ${score.player} - ${score.ai} AI</p>
    `;

    setTimeout(() => {
        if (matchEndCallback) {
            const cb = matchEndCallback;
            matchEndCallback = null;
            cb();
        }
    }, 1200);
}

function resetBall() {
    ball.x = 600;
    ball.y = 350;
    ball.vx = 0;
    ball.vy = 0;
}

function draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 250, 50, 200);
    ctx.fillRect(1150, 250, 50, 200);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    players.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = "blue";
        ctx.fill();
    });

    aiPlayers.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Player ${score.player} - ${score.ai} AI`, 490, 32);
    ctx.fillText(`Time: ${matchTimeLeft}s`, 560, 62);
    ctx.font = "16px Arial";
    ctx.fillText("Controls: M pass | N shoot | K switch player | L tackle (placeholder)", 350, 92);
}

document.addEventListener("keydown", e => {
    if (!players.length || !ball) return;

    const selected = players[0];

    if (e.key === "m") {
        ball.vx = 5;
        ball.vy = 0;
    }

    if (e.key === "n") {
        ball.vx = 10;
    }

    if (e.key === "l") {
        // tackle logic placeholder
        ball.vx = selected.x < ball.x ? -2 : 2;
    }

    if (e.key === "k") {
        players.push(players.shift());
    }
});
