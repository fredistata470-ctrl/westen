let canvas, ctx;
let ball;
let players = [];
let aiPlayers = [];
let score = { player: 0, ai: 0 };
let matchRunning = false;
let onMatchComplete = null;

function startMatch(chapter, done) {
    onMatchComplete = done || null;
    screen.innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    screen.appendChild(canvas);

    ctx = canvas.getContext("2d");

    initMatch();
    matchRunning = true;
    requestAnimationFrame(gameLoop);
}

function initMatch() {
    ball = { x: 600, y: 350, vx: 0, vy: 0 };
    players = [];
    aiPlayers = [];
    score = { player: 0, ai: 0 };

    for (let i = 0; i < 5; i++) {
        players.push({ x: 200, y: 150 + i * 80, team: "player" });
        aiPlayers.push({ x: 1000, y: 150 + i * 80, team: "ai" });
    }
}

function gameLoop() {
    if (!matchRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

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

    ball.vx *= 0.99;
    ball.vy *= 0.99;

    aiPassLogic();

    if (score.player >= 2 || score.ai >= 2) {
        endMatch();
    }
}

function aiPassLogic() {
    if (!aiPlayers.length) return;

    const chaser = aiPlayers[0];
    const dx = ball.x - chaser.x;
    const dy = ball.y - chaser.y;

    chaser.x += dx * 0.01;
    chaser.y += dy * 0.01;

    if (Math.hypot(dx, dy) < 40 && Math.random() < 0.05) {
        ball.vx = -5 - Math.random() * 2;
        ball.vy = (Math.random() - 0.5) * 6;
    }
}

function resetBall() {
    ball.x = 600;
    ball.y = 350;
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
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 250, 50, 200);
    ctx.fillRect(1150, 250, 50, 200);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    players.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? "cyan" : "blue";
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
    ctx.fillText(`Player ${score.player} - ${score.ai} AI`, 500, 30);
}

document.addEventListener("keydown", e => {
    if (!players.length || !ball || !matchRunning) return;

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
    }

    if (e.key === "k") {
        players.push(players.shift());
    }

    if (e.key === "ArrowUp") selected.y -= 15;
    if (e.key === "ArrowDown") selected.y += 15;
    if (e.key === "ArrowLeft") selected.x -= 15;
    if (e.key === "ArrowRight") selected.x += 15;
});
