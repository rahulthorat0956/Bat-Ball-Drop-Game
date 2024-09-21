const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const exitBtn = document.getElementById('exitBtn');

let batWidth = 200, batHeight = 15;
let ballRadius = 8;
let batX = (canvas.width - batWidth) / 2;
let balls = [{ x: canvas.width / 2, y: canvas.height / 2, speedX: getRandomSpeed(), speedY: getRandomSpeed() }];
let score = 0;
let gameActive = false;

// Obstacles
const obstacles = [];
const obstacleWidth = 50;
const obstacleHeight = 20;

// Helper function to generate random speed for balls
function getRandomSpeed() {
    const speed = 1; // Speed between 1 and 4
    return Math.random() < 1 ? speed : -speed; // Random direction
}

// Draw the bat, balls, and obstacles
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the bat
    ctx.fillStyle = 'blue';
    ctx.fillRect(batX, canvas.height - batHeight, batWidth, batHeight);

    // Draw the balls
    ctx.fillStyle = 'red';
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw the obstacles
    ctx.fillStyle = 'green';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
    });

    // Display the score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

// Update game objects
function update() {
    if (!gameActive) return;

    balls.forEach(ball => {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Ball collision with walls
        if (ball.x + ballRadius > canvas.width || ball.x - ballRadius < 0) {
            ball.speedX = -ball.speedX; // Reverse horizontal direction
        }
        if (ball.y - ballRadius < 0) {
            ball.speedY = -ball.speedY; // Reverse vertical direction
        }

        // Check for collisions with obstacles
        obstacles.forEach(obstacle => {
            if (ball.y + ballRadius > obstacle.y && ball.y - ballRadius < obstacle.y + obstacleHeight &&
                ball.x + ballRadius > obstacle.x && ball.x - ballRadius < obstacle.x + obstacleWidth) {
                
                // Determine which side of the obstacle the ball hit
                let offsetX = ball.x - (obstacle.x + obstacleWidth / 2);
                let offsetY = ball.y - (obstacle.y + obstacleHeight / 2);

                // Reflect ball direction based on collision angle
                if (Math.abs(offsetX) > Math.abs(offsetY)) {
                    // Horizontal collision
                    ball.speedX = -ball.speedX; // Reverse horizontal direction
                } else {
                    // Vertical collision
                    ball.speedY = -ball.speedY; // Reverse vertical direction
                }
            }
        });

        // Ball collision with bat
        if (ball.y + ballRadius > canvas.height - batHeight) {
            if (ball.x > batX && ball.x < batX + batWidth) {
                let hitPosition = (ball.x - (batX + batWidth / 2)) / (batWidth / 2);
                ball.speedX += hitPosition * 2; // Adjust horizontal speed
                ball.speedY = -ball.speedY; // Reverse vertical direction
                score++; // Increment score only when hitting the bat

                // Check for obstacle creation
                if (score % 5 === 0) {
                    createObstacle();
                }

                // Check for new ball creation
                if (score % 10 === 0) {
                    createNewBall();
                }
            } else if (ball.y + ballRadius > canvas.height) {
                gameOver();
            }
        }
    });

    // Remove balls that fall below the bat, game over if any ball crosses the canvas
    balls.forEach(ball => {
        if (ball.y - ballRadius > canvas.height) {
            gameOver();
        }
    });
}

// Function to create a new obstacle
function createObstacle() {
    const obstacleX = Math.random() * (canvas.width - obstacleWidth);
    const obstacleY = Math.random() * (canvas.height - 100); // keep it above the bat
    obstacles.push({ x: obstacleX, y: obstacleY });
}

// Function to create a new ball at random positions
function createNewBall() {
    const randomX = Math.random() * (canvas.width - 2 * ballRadius) + ballRadius;
    const randomY = Math.random() * (canvas.height / 2); // spawn anywhere in the upper half of the canvas
    balls.push({ 
        x: randomX, 
        y: randomY, 
        speedX: getRandomSpeed(), 
        speedY: getRandomSpeed() 
    });
}

// Function to reset the game state
function resetGame() {
    score = 0;
    balls = [{ x: canvas.width / 2, y: canvas.height / 2, speedX: getRandomSpeed(), speedY: getRandomSpeed() }];
    obstacles.length = 0; // Clear obstacles
    gameActive = true;
    restartBtn.style.display = 'none';
    exitBtn.style.display = 'none';
}

// Handle mouse movement
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    batX = mouseX - batWidth / 2;
    if (batX < 0) batX = 0;
    if (batX + batWidth > canvas.width) batX = canvas.width - batWidth;
});

// Game loop
function gameLoop() {
    draw();
    update();
    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game
function startGame() {
    gameActive = true;
    startBtn.style.display = 'none';
    gameLoop();
}

// Game Over function
function gameOver() {
    gameActive = false;
    alert('Game Over! Your score: ' + score);
    restartBtn.style.display = 'block';
    exitBtn.style.display = 'block';
}

// Event listeners for buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    resetGame();
    gameLoop();
});
exitBtn.addEventListener('click', () => {
    alert('Exiting game...');
    window.location.reload();
});
