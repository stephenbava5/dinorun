// Dino Run Game - Web Version
// A learning game where you dodge obstacles and run from a dinosaur!

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Jungle-themed colors
const colors = {
    darkGreen: '#225723',
    lightGreen: '#4CAF50',
    golden: '#FFC107',
    brown: '#664321',
    darkBrown: '#3e2723',
    white: '#FFFFFF',
    red: '#E74C3C'
};

// Game states
const GAME_STATE = {
    WELCOME: 'welcome',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

// Game object - Main game logic
const game = {
    state: GAME_STATE.WELCOME,
    score: 0,
    obstaclesDodged: 0,
    gameTime: 0,
    
    // Player object
    player: {
        x: 400,
        y: 480,
        width: 40,
        height: 60,
        velocityY: 0,
        velocityX: 0,
        speed: 5,
        jumpPower: 15,
        isJumping: false,
        gravity: 0.6
    },
    
    // Dinosaur object
    dino: {
        x: 750,
        y: 420,
        width: 80,
        height: 80,
        speed: 2,
        direction: -1 // -1 for left, 1 for right
    },
    
    // Obstacles array
    obstacles: [],
    
    // Keyboard input tracking
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ' ': false
    }
};

// Event listeners for keyboard input
document.addEventListener('keydown', (e) => {
    if (e.key in game.keys) {
        game.keys[e.key] = true;
    }
    
    // Start game with space
    if (e.key === ' ' && game.state === GAME_STATE.WELCOME) {
        e.preventDefault();
        startGame();
    }
    
    // Return to welcome with ESC
    if (e.key === 'Escape') {
        game.state = GAME_STATE.WELCOME;
        game.score = 0;
        game.obstaclesDodged = 0;
        game.gameTime = 0;
        game.obstacles = [];
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in game.keys) {
        game.keys[e.key] = false;
    }
});

// Start the game
function startGame() {
    game.state = GAME_STATE.PLAYING;
    game.score = 0;
    game.obstaclesDodged = 0;
    game.gameTime = 0;
    game.obstacles = [];
    
    // Reset player position
    game.player.x = 400;
    game.player.y = 480;
    game.player.velocityX = 0;
    game.player.velocityY = 0;
    game.player.isJumping = false;
    
    // Reset dinosaur position
    game.dino.x = 750;
    game.dino.speed = 2;
}

// Draw functions
function drawWelcomeScreen() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.darkGreen);
    gradient.addColorStop(1, colors.lightGreen);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Decorative vines
    ctx.strokeStyle = colors.brown;
    ctx.lineWidth = 8;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(50 + i * 300, 0);
        ctx.lineTo(100 + i * 300, canvas.height);
        ctx.stroke();
    }
    
    // Title with shadow
    ctx.fillStyle = colors.darkBrown;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUN', canvas.width / 2 + 3, 100 + 3);
    
    ctx.fillStyle = colors.golden;
    ctx.fillText('DINO RUN', canvas.width / 2, 100);
    
    // Subtitle
    ctx.fillStyle = colors.white;
    ctx.font = '40px Arial';
    ctx.fillText('Jungle Adventure', canvas.width / 2, 170);
    
    // Instructions
    ctx.fillStyle = colors.white;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    
    const instructions = [
        'A dinosaur is chasing you through the jungle!',
        'Avoid obstacles and survive as long as you can!',
        '',
        'Use ARROW KEYS to move',
        'Press SPACE to Start',
        'Press ESC to Quit'
    ];
    
    let yPos = 300;
    for (let instruction of instructions) {
        if (instruction) {
            ctx.fillText(instruction, canvas.width / 2, yPos);
        }
        yPos += 50;
    }
    
    // Footer
    ctx.fillStyle = colors.golden;
    ctx.font = '18px Arial';
    ctx.fillText('Learn Python game development with your son!', canvas.width / 2, canvas.height - 40);
}

function drawGameScreen() {
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.darkGreen);
    gradient.addColorStop(1, colors.lightGreen);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = colors.brown;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Draw obstacles
    for (let obstacle of game.obstacles) {
        drawObstacle(obstacle);
    }
    
    // Draw player
    drawPlayer();
    
    // Draw dinosaur
    drawDinosaur();
    
    // Draw score
    ctx.fillStyle = colors.golden;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${game.score}`, 20, 40);
    ctx.fillText(`Dodged: ${game.obstaclesDodged}`, 20, 70);
}

function drawPlayer() {
    // Simple rectangle player
    ctx.fillStyle = '#FF6B9D';
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
    
    // Draw eyes
    ctx.fillStyle = colors.white;
    ctx.fillRect(game.player.x + 10, game.player.y + 15, 8, 8);
    ctx.fillRect(game.player.x + 22, game.player.y + 15, 8, 8);
}

function drawObstacle(obstacle) {
    ctx.fillStyle = colors.darkBrown;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Add some detail
    ctx.strokeStyle = colors.brown;
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
}

function drawDinosaur() {
    const x = game.dino.x;
    const y = game.dino.y;
    const w = game.dino.width;
    const h = game.dino.height;
    
    // Body
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h/2, w/2.5, h/2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.ellipse(x + w - 20, y + 20, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = colors.golden;
    ctx.beginPath();
    ctx.arc(x + w - 10, y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Teeth (simple lines for mouth)
    ctx.strokeStyle = colors.white;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w - 45, y + 35);
    ctx.lineTo(x + w - 35, y + 35);
    ctx.stroke();
}

// Update game logic
function update() {
    if (game.state === GAME_STATE.WELCOME) {
        return;
    }
    
    if (game.state === GAME_STATE.PLAYING) {
        game.gameTime++;
        game.score = Math.floor(game.gameTime / 10);
        
        // Update player position
        updatePlayer();
        
        // Update dinosaur
        updateDinosaur();
        
        // Create obstacles periodically
        if (game.gameTime % 60 === 0) {
            createObstacle();
        }
        
        // Update obstacles
        updateObstacles();
        
        // Check collisions
        checkCollisions();
    }
}

function updatePlayer() {
    // Horizontal movement
    if (game.keys['ArrowLeft'] && game.player.x > 0) {
        game.player.x -= game.player.speed;
    }
    if (game.keys['ArrowRight'] && game.player.x + game.player.width < canvas.width) {
        game.player.x += game.player.speed;
    }
    
    // Jumping
    if (game.keys[' '] && !game.player.isJumping) {
        game.player.velocityY = -game.player.jumpPower;
        game.player.isJumping = true;
    }
    
    // Apply gravity
    game.player.velocityY += game.player.gravity;
    game.player.y += game.player.velocityY;
    
    // Ground collision
    const groundLevel = canvas.height - 100 - game.player.height;
    if (game.player.y >= groundLevel) {
        game.player.y = groundLevel;
        game.player.velocityY = 0;
        game.player.isJumping = false;
    }
}

function updateDinosaur() {
    // Simple back and forth movement that accelerates over time
    game.dino.speed = 2 + (game.gameTime / 500);
    game.dino.x += game.dino.speed * game.dino.direction;
    
    // Bounce off edges
    if (game.dino.x <= 0 || game.dino.x + game.dino.width >= canvas.width) {
        game.dino.direction *= -1;
    }
}

function createObstacle() {
    const obstacle = {
        x: Math.random() * (canvas.width - 40),
        y: 0,
        width: 40,
        height: 40,
        speed: 3 + (game.gameTime / 1000)
    };
    game.obstacles.push(obstacle);
}

function updateObstacles() {
    for (let i = game.obstacles.length - 1; i >= 0; i--) {
        game.obstacles[i].y += game.obstacles[i].speed;
        
        // Remove obstacles that are off-screen
        if (game.obstacles[i].y > canvas.height) {
            game.obstacles.splice(i, 1);
            game.obstaclesDodged++;
        }
    }
}

function checkCollisions() {
    // Check collision with obstacles
    for (let obstacle of game.obstacles) {
        if (rectanglesCollide(game.player, obstacle)) {
            game.state = GAME_STATE.GAME_OVER;
        }
    }
    
    // Check collision with dinosaur
    if (rectanglesCollide(game.player, game.dino)) {
        game.state = GAME_STATE.GAME_OVER;
    }
}

function rectanglesCollide(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function drawGameOverScreen() {
    // Darken the screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over text
    ctx.fillStyle = colors.red;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, 150);
    
    // Score
    ctx.fillStyle = colors.golden;
    ctx.font = '40px Arial';
    ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, 250);
    ctx.fillText(`Obstacles Dodged: ${game.obstaclesDodged}`, canvas.width / 2, 310);
    
    // Restart instructions
    ctx.fillStyle = colors.white;
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to Play Again', canvas.width / 2, 400);
    ctx.fillText('or ESC to Return to Menu', canvas.width / 2, 450);
}

// Main draw function
function draw() {
    if (game.state === GAME_STATE.WELCOME) {
        drawWelcomeScreen();
    } else if (game.state === GAME_STATE.PLAYING) {
        drawGameScreen();
    } else if (game.state === GAME_STATE.GAME_OVER) {
        drawGameScreen();
        drawGameOverScreen();
    }
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
