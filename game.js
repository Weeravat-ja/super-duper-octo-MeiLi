const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SCREEN_W = canvas.width;
const SCREEN_H = canvas.height;

const MAX_MISS = 3;
const SCORE_PER_LEVEL = 50;
const SPEED_INCREASE = 1.05;

const BASE_PADDLE_SPEED = 8;
const BASE_BALL_SPEED = 2.5;

const MAX_PADDLE_SPEED = 30;
const MAX_BALL_SPEED = 12;

const paddle = {
    width: 140,
    height: 30,
    x: 240,
    y: 520,
    speed: BASE_PADDLE_SPEED
};

const ball = {
    size: 42,
    x: 279,
    y: 0,
    speed: BASE_BALL_SPEED
};

let score = 0;
let missedBall = 0;
let gameOver = false;
let gameStarted = false;

let leftPressed = false;
let rightPressed = false;

const startPanel = document.getElementById("startPanel");
const gameOverPanel = document.getElementById("gameOverPanel");
const startButton = document.getElementById("startButton");
const playAgainButton = document.getElementById("playAgainButton");
const restartButton = document.getElementById("restartButton");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");

const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");
const finalMiss = document.getElementById("finalMiss");

function currentLevel() {
    return Math.floor(score / SCORE_PER_LEVEL) + 1;
}

function updateSpeed() {
    const speedLevel = Math.floor(score / SCORE_PER_LEVEL);

    paddle.speed = Math.min(
        BASE_PADDLE_SPEED * Math.pow(SPEED_INCREASE, speedLevel),
        MAX_PADDLE_SPEED
    );

    ball.speed = Math.min(
        BASE_BALL_SPEED * Math.pow(SPEED_INCREASE, speedLevel),
        MAX_BALL_SPEED
    );
}

function resetBall() {
    ball.x = Math.random() * (SCREEN_W - ball.size);
    ball.y = 0;
}

function resetGame() {
    score = 0;
    missedBall = 0;
    gameOver = false;
    gameStarted = true;

    leftPressed = false;
    rightPressed = false;

    paddle.speed = BASE_PADDLE_SPEED;
    ball.speed = BASE_BALL_SPEED;

    paddle.x = (SCREEN_W - paddle.width) / 2;
    paddle.y = SCREEN_H - 80;

    resetBall();

    startPanel.classList.add("hidden");
    gameOverPanel.classList.add("hidden");
}

function endGame() {
    gameOver = true;

    finalScore.textContent = `Final Score : ${score}`;
    finalLevel.textContent = `Level : ${currentLevel()}`;
    finalMiss.textContent = `❤️ : ${MAX_MISS - missedBall}`;

    gameOverPanel.classList.remove("hidden");
}

function startGame() {
    resetGame();
}

function collision() {
    return (
        paddle.x < ball.x + ball.size &&
        paddle.x + paddle.width > ball.x &&
        paddle.y < ball.y + ball.size &&
        paddle.y + paddle.height > ball.y
    );
}

function update() {
    if (!gameStarted || gameOver) return;

    if (leftPressed) paddle.x -= paddle.speed;
    if (rightPressed) paddle.x += paddle.speed;

    if (paddle.x < 0) {
        paddle.x = 0;
    }

    if (paddle.x + paddle.width > SCREEN_W) {
        paddle.x = SCREEN_W - paddle.width;
    }

    ball.y += ball.speed;

    if (collision()) {
        score += 10;
        updateSpeed();
        resetBall();
    }

    if (ball.y > SCREEN_H) {
        missedBall++;
        const missRemaining = MAX_MISS - missedBall;

        if (missRemaining === 0) {
            endGame();
        } else {
            resetBall();
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );
}

function drawBall() {
    const centerX = ball.x + ball.size / 2;
    const centerY = ball.y + ball.size / 2;
    const radius = ball.size / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}

function drawText() {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textBaseline = "top";

    ctx.textAlign = "left";
    ctx.fillText(`Score : ${score}`, 10, 8);

    ctx.textAlign = "center";
    ctx.fillText(`Level : ${currentLevel()}`, SCREEN_W / 2, 8);

    ctx.textAlign = "right";
    ctx.fillText(`❤️: ${MAX_MISS - missedBall}`, SCREEN_W - 70, 8);
}

function draw() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    if (gameStarted && !gameOver) {
        drawPaddle();
        drawBall();
    }

    drawText();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function setLeft(value) {
    leftPressed = value;
}

function setRight(value) {
    rightPressed = value;
}

document.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") {
        setLeft(true);
    }

    if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") {
        setRight(true);
    }

    if ((event.key === "r" || event.key === "R") && gameOver) {
        resetGame();
    }

    if (event.code === "Space" && !gameStarted) {
        startGame();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") {
        setLeft(false);
    }

    if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") {
        setRight(false);
    }
});

function holdButton(button, onStart, onEnd) {
    button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        onStart();
    });

    button.addEventListener("mouseup", (event) => {
        event.preventDefault();
        onEnd();
    });

    button.addEventListener("mouseleave", onEnd);

    button.addEventListener("touchstart", (event) => {
        event.preventDefault();
        onStart();
    }, { passive: false });

    button.addEventListener("touchend", (event) => {
        event.preventDefault();
        onEnd();
    }, { passive: false });

    button.addEventListener("touchcancel", onEnd);
}

holdButton(leftButton, () => setLeft(true), () => setLeft(false));
holdButton(rightButton, () => setRight(true), () => setRight(false));

canvas.addEventListener("mousemove", (event) => {
    if (!gameStarted || gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = SCREEN_W / rect.width;
    const mouseX = (event.clientX - rect.left) * scaleX;

    paddle.x = mouseX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > SCREEN_W) {
        paddle.x = SCREEN_W - paddle.width;
    }
});

canvas.addEventListener("touchmove", (event) => {
    if (!gameStarted || gameOver) return;

    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const scaleX = SCREEN_W / rect.width;
    const touchX = (event.touches[0].clientX - rect.left) * scaleX;

    paddle.x = touchX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > SCREEN_W) {
        paddle.x = SCREEN_W - paddle.width;
    }
}, { passive: false });

startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", resetGame);
restartButton.addEventListener("click", resetGame);

draw();
gameLoop();
