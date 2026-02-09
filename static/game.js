// Dino Run Game - Timber Run Style!
// Run away from dinosaurs! Jump over obstacles and collect coins!

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Jungle-themed colors
const colors = {
    darkGreen: '#225723',
    lightGreen: '#4CAF50',
    skyBlue: '#87CEEB',
    golden: '#FFC107',
    brown: '#664321',
    darkBrown: '#3e2723',
    white: '#FFFFFF',
    red: '#E74C3C',
    gray: '#888888'
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
    coinsCollected: 0,
    gameTime: 0,
    speed: 5,
    
    // Player object - human running away (now can be stunned)
    player: {
        lane: 1, // 0 = left, 1 = middle, 2 = right
        y: 320, // Position on screen (running in place)
        width: 40,
        height: 60,
        velocityY: 0,
        jumpPower: 14,
        isJumping: false,
        gravity: 0.6,
        stunned: false,
        stunTimer: 0,
        stunDuration: 90 // frames (~1.5s)
    },
    
    // Dinosaurs chasing (background threat) — now track distance (z) to player
    dinosaurs: [
        { x: 50, y: 250, width: 60, height: 60, baseSpeed: 2.8, z: 420 },
        { x: 250, y: 280, width: 70, height: 65, baseSpeed: 2.6, z: 520 }
    ],
    
    // Path turning
    pathOffset: 0, // How much the path curves left/right
    
    // Obstacles array (tree limbs and coins)
    obstacles: [],
    coins: [],
    
    // Background scroll
    scrollOffset: 0,
    
    // Keyboard input tracking
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ' ': false
    },
    
    // Mario commentary system
    mario: {
        visible: false,
        x: 650,
        y: 150,
        width: 40,
        height: 50,
        messageIndex: 0,
        messageTimer: 0,
        messageDisplayTime: 120,
        isYapping: false
    }
};

// Mario's funny commentary
const marioCommentary = [
    'Mamma mia! RUN!',
    'Let\'s-a-go faster!',
    'So spicy! So jump!',
    'Wahoo! Jump jump!',
    'It\'s dangerous to go-a alone!',
    'Okie dokie!',
    'Yippee! Collect those coins!',
    'Oof! That was close!',
    'WAHOO! Keep going!',
    'Mamma! The dinosaurs!',
    'Grazie for running!',
    'So beautiful, so jump!',
    'Let\'s-a-gooooo!',
    'Pipe up your game!',
    'Yahoo! Almost there!',
    'Bottoms up! And away!'
];

// Sound effect generator using Web Audio API
function playMarioSound(frequency = 880, duration = 100, type = 'jump') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'jump') {
            // Ascending jump sound
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        } else if (type === 'coin') {
            // Coin collect sound
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
        } else if (type === 'message') {
            // Message bloop
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContext.currentTime + duration / 1000);
        }
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        // Audio context not supported, silently fail
    }
}

// Show Mario's message
function showMarioMessage() {
    if (!game.mario.isYapping) {
        game.mario.isYapping = true;
        game.mario.messageTimer = game.mario.messageDisplayTime;
        game.mario.messageIndex = Math.floor(Math.random() * marioCommentary.length);
        game.mario.visible = true;
        playMarioSound(600, 150, 'message');
    }
}

// Event listeners for keyboard input
document.addEventListener('keydown', (e) => {
    if (e.key in game.keys) {
        game.keys[e.key] = true;
    }
    
    // Start game with space
    if ((e.key === ' ' || e.key === 'Enter') && game.state === GAME_STATE.WELCOME) {
        e.preventDefault();
        startGame();
    }
    
    // Return to welcome with ESC
    if (e.key === 'Escape') {
        game.state = GAME_STATE.WELCOME;
        game.score = 0;
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
    game.coinsCollected = 0;
    game.gameTime = 0;
    game.obstacles = [];
    game.coins = [];
    game.scrollOffset = 0;
    game.pathOffset = 0;
    
    // Reset player position
    game.player.lane = 1;
    game.player.velocityY = 0;
    game.player.isJumping = false;
    
    // Reset dinosaurs
    game.dinosaurs[0].x = 50;
    game.dinosaurs[1].x = 250;
    
    // Reset Mario
    game.mario.visible = true;
    game.mario.isYapping = false;
    game.mario.messageTimer = 0;
    playMarioSound(800, 80, 'jump');
    
    // Show initial Mario message
    setTimeout(() => showMarioMessage(), 200);
}

// Draw functions
function drawWelcomeScreen() {
    // Sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.skyBlue);
    gradient.addColorStop(1, colors.lightGreen);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw jungle scenery
    drawBackgroundTrees(0);
    
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
    ctx.fillText('Timber Run Adventure!', canvas.width / 2, 170);
    
    // Instructions
    ctx.fillStyle = colors.white;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    
    const instructions = [
        'RUN AWAY FROM THE DINOSAURS!',
        'Jump over tree limbs with UP ARROW',
        'Collect coins for points',
        'Move left and right to dodge obstacles',
        '',
        'Press SPACE or ENTER to Start',
        'Press ESC to Quit'
    ];
    
    let yPos = 280;
    for (let instruction of instructions) {
        if (instruction) {
            ctx.fillText(instruction, canvas.width / 2, yPos);
        }
        yPos += 40;
    }
}

function drawGameScreen() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.skyBlue);
    gradient.addColorStop(0.4, '#90EE90');
    gradient.addColorStop(1, colors.lightGreen);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background trees (far away, small)
    drawBackgroundTrees(game.scrollOffset * 0.2);
    
    // Draw path/ground with perspective
    drawPath();
    
    // Draw dinosaurs chasing (background)
    drawDinosaursChasingBackground();
    
    // Draw coins
    for (let coin of game.coins) {
        drawCoin(coin);
    }
    
    // Draw obstacles (tree limbs)
    for (let obstacle of game.obstacles) {
        drawObstacle(obstacle);
    }
    
    // Draw player (human running)
    drawPlayerRunning();
    
    // Draw Mario on the side
    if (game.mario.visible) {
        drawMario();
        if (game.mario.isYapping) {
            drawMarioMessage();
        }
    }
    
    // Draw HUD
    ctx.fillStyle = colors.golden;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Distance: ${game.score}m`, 20, 40);
    ctx.fillText(`Coins: ${game.coinsCollected}`, 20, 70);
    ctx.fillText(`Speed: ${game.speed.toFixed(1)}`, 20, 100);
    // Show nearest dinosaur distance (chaser)
    const nearest = Math.min(...game.dinosaurs.map(d => Math.max(0, Math.floor(d.z))));
    ctx.fillText(`Chaser Dist: ${nearest}m`, 20, 130);
}

function drawPath() {
    // Perspective path drawing - appears to go into distance
    const pathWidth = 150;
    const centerX = canvas.width / 2 + game.pathOffset;
    
    // Draw multiple road segments to create 3D effect
    for (let i = 0; i < 15; i++) {
        const z = i * 40; // Distance from camera
        const screenY = 400 + z;
        
        if (screenY > canvas.height) continue;
        
        // Calculate perspective scaling
        const newZ = (i + 1) * 40;
        const nextScreenY = 400 + newZ;
        
        // Road segment (trapezoid for perspective)
        const width1 = pathWidth * (1 - i * 0.05);
        const width2 = pathWidth * (1 - (i + 1) * 0.05);
        
        ctx.fillStyle = i % 2 === 0 ? '#8B7355' : '#A0826D';
        ctx.beginPath();
        ctx.moveTo(centerX - width1 / 2, screenY);
        ctx.lineTo(centerX + width1 / 2, screenY);
        ctx.lineTo(centerX + width2 / 2, nextScreenY);
        ctx.lineTo(centerX - width2 / 2, nextScreenY);
        ctx.closePath();
        ctx.fill();
        
        // Lane dividers
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - width1 / 6, screenY);
        ctx.lineTo(centerX - width2 / 6, nextScreenY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + width1 / 6, screenY);
        ctx.lineTo(centerX + width2 / 6, nextScreenY);
        ctx.stroke();
    }
}

function drawBackgroundTrees(offset) {
    // Left trees
    for (let i = 0; i < 3; i++) {
        const x = -200 + i * 300 + offset;
        ctx.fillStyle = colors.brown;
        ctx.fillRect(x, 100, 40, 150);
        ctx.fillStyle = colors.darkGreen;
        ctx.beginPath();
        ctx.ellipse(x + 20, 80, 60, 80, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Right trees
    for (let i = 0; i < 3; i++) {
        const x = canvas.width - 100 + i * 300 + offset;
        ctx.fillStyle = colors.brown;
        ctx.fillRect(x, 120, 40, 130);
        ctx.fillStyle = colors.darkGreen;
        ctx.beginPath();
        ctx.ellipse(x + 20, 100, 55, 75, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawDinosaursChasingBackground() {
    // Draw each dino with perspective based on their z (distance)
    for (let dino of game.dinosaurs) {
        const centerX = canvas.width / 2 + game.pathOffset;
        // Convert z distance to screen Y and scale
        const screenY = Math.min(canvas.height - 120, 380 - dino.z * 0.35);
        const scale = Math.max(0.5, 1.6 - dino.z / 400);
        const xOffset = (dino.x - centerX) * 0.6; // nudge towards center
        
        // Draw a shadow under the dinosaur
        const shadowRadius = 40 * scale;
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(centerX + xOffset, screenY + (30 * scale), shadowRadius, shadowRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        drawDinosaurAtPosition(centerX + xOffset - (30 * scale), screenY - (10 * scale), 80 * scale, scale);
    }
}

function drawDinosaurAtPosition(x, y, size, scale) {
    const w = size * scale;
    const h = size * scale;
    const tailOffset = Math.sin(game.gameTime * 0.06) * 8 * scale;
    
    // Body with gradient
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#154d15');
    grad.addColorStop(1, '#2b7b2b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2.2, h / 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.fillStyle = '#1a4d1a';
    ctx.beginPath();
    ctx.ellipse(x - w / 6 + tailOffset, y + h / 2, w / 5, h / 6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Head with shadow
    ctx.fillStyle = '#0e3a0e';
    ctx.beginPath();
    ctx.ellipse(x + w - 12, y + 12, 18 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth glow
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.ellipse(x + w - 10, y + 20, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye (menacing)
    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(x + w - 2, y + 8, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Teeth (sharper)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5 * scale;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + w - 18 + i * 6 * scale, y + 22);
        ctx.lineTo(x + w - 14 + i * 6 * scale, y + 28);
        ctx.stroke();
    }
    
    // Some scales texture
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(x + (i * 8 - 10) * scale, y + (i * 3) * scale, 5 * scale, 3 * scale, 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlayerRunning() {
    const centerX = canvas.width / 2 + game.pathOffset;
    const x = centerX - game.player.width / 2;
    const y = game.player.y;
    const w = game.player.width;
    const h = game.player.height;
    
    ctx.save();
    // shadow under player
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h, w*0.6, 10, 0, 0, Math.PI*2);
    ctx.fill();
    
    // If stunned, show tumble pose
    if (game.player.stunned) {
        // body slumped, arms flailing
        ctx.fillStyle = '#7B5E2B';
        ctx.fillRect(x, y + 18, w, h - 20);
        // head tilted
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(x + w / 2 + 6, y - 4, w / 2.2, w / 2.6, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // flailing legs
        const legAngle = Math.sin(game.gameTime * 0.2) * 6;
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 4, y + h - 10 + legAngle, 4, 14);
        ctx.fillRect(x + w - 8, y + h - 10 - legAngle, 4, 14);
        // dust puff
        ctx.fillStyle = 'rgba(200,200,200,0.6)';
        ctx.beginPath();
        ctx.arc(x + w/2 + 10, y + h - 8, 10, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // normal running style but improved
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(x, y + 10, w, h - 20);
        // head
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.arc(x + w / 2, y, w / 2.2, 0, Math.PI * 2);
        ctx.fill();
        // backpack with highlight
        ctx.fillStyle = '#5b3b1a';
        ctx.fillRect(x + w / 4, y + 6, w / 2, h / 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + w / 4 + 2, y + 8, w / 2 - 4, h / 2 - 4);
        // legs animated
        const legOffset = Math.sin(game.gameTime * 0.14) * 5;
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 4, y + h - 15 + legOffset, 6, 15);
        ctx.fillRect(x + w - 12, y + h - 15 - legOffset, 6, 15);
    }
    ctx.restore();
}

function drawObstacle(obstacle) {
    const screenY = 400 + obstacle.z * 2;
    
    // Only draw if on screen
    if (screenY > 200 && screenY < canvas.height) {
        const centerX = canvas.width / 2 + game.pathOffset;
        
        // Perspective scaling
        const scale = 1 - obstacle.z / 500;
        const width = 80 * scale;
        
        // Get lane position
        const laneX = createLanePosition(obstacle.lane, centerX, screenY);
        
        // Draw tree limb (log)
        ctx.fillStyle = colors.darkBrown;
        ctx.beginPath();
        ctx.ellipse(laneX, screenY, width / 2, 8 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Wood texture
        ctx.strokeStyle = colors.brown;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(laneX - width / 3, screenY - 6 * scale);
        ctx.lineTo(laneX - width / 3, screenY + 6 * scale);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(laneX, screenY - 6 * scale);
        ctx.lineTo(laneX, screenY + 6 * scale);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(laneX + width / 3, screenY - 6 * scale);
        ctx.lineTo(laneX + width / 3, screenY + 6 * scale);
        ctx.stroke();
    }
}

function drawCoin(coin) {
    const screenY = 400 + coin.z * 2;
    
    // Only draw if on screen
    if (screenY > 200 && screenY < canvas.height) {
        const centerX = canvas.width / 2 + game.pathOffset;
        const scale = 1 - coin.z / 500;
        const radius = 8 * scale;
        
        const laneX = createLanePosition(coin.lane, centerX, screenY);
        
        // Coin body (gold with shimmer)
        ctx.fillStyle = colors.golden;
        ctx.beginPath();
        ctx.arc(laneX, screenY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin edge
        ctx.strokeStyle = '#CC8800';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(laneX, screenY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Coin shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(laneX - radius / 3, screenY - radius / 3, radius / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createLanePosition(lane, centerX, screenY) {
    // Create lane positions with perspective
    const pathWidth = 150 * (1 - (500 - (screenY - 400) / 2) / 500);
    const laneWidth = pathWidth / 3;
    
    let laneX = centerX;
    if (lane === 0) laneX -= laneWidth / 2;
    else if (lane === 2) laneX += laneWidth / 2;
    
    return laneX;
}

function drawMario() {
    const x = game.mario.x;
    const y = game.mario.y;
    const w = game.mario.width;
    const h = game.mario.height;
    
    // Mario's iconic red hat
    ctx.fillStyle = '#E63946';
    ctx.fillRect(x + 5, y, w - 10, h / 3);
    ctx.fillRect(x, y + h / 3, w, h / 6);
    
    // White circle on hat
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Face (yellow/tan)
    ctx.fillStyle = '#F4D03F';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (big and expressive)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + w / 3, y + h / 2.2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + (2 * w) / 3, y + h / 2.2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + w / 3 + 1, y + h / 2.2 - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + (2 * w) / 3 + 1, y + h / 2.2 - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Mustache (iconic!)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 1.8, 6, 0, Math.PI, true);
    ctx.stroke();
    
    // Smile
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 1.6, 5, 0, Math.PI);
    ctx.stroke();
    
    // Body (blue overalls)
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(x, y + h / 1.5, w, h / 3);
    
    // Overalls buttons
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + w / 3, y + h / 1.3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + (2 * w) / 3, y + h / 1.3, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawMarioMessage() {
    const message = marioCommentary[game.mario.messageIndex];
    const bubbleX = game.mario.x - 80;
    const bubbleY = game.mario.y - 40;
    const bubbleWidth = 160;
    const bubbleHeight = 35;
    
    // Speech bubble background (rounded)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
    ctx.fill();
    
    // Speech bubble border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
    ctx.stroke();
    
    // Speech bubble tail pointing to Mario
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(game.mario.x + 20, game.mario.y);
    ctx.lineTo(game.mario.x + 10, game.mario.y - 5);
    ctx.lineTo(game.mario.x + 25, game.mario.y - 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2);
}

// Update game logic
function update() {
    if (game.state === GAME_STATE.WELCOME) {
        return;
    }
    
    if (game.state === GAME_STATE.PLAYING) {
        game.gameTime++;
        game.score = Math.floor(game.gameTime / 20); // Display distance in meters
        
        // Increase speed over time - dinosaurs get faster!
        game.speed = 5 + (game.gameTime / 400);
        
        // Update scroll offset for animation
        game.scrollOffset += game.speed;
        
        // Update dinosaurs - they're catching up!
        updateDinosaurs();
        
        // Update player position
        updatePlayer();
        
        // Handle path turning
        updatePathTurning();
        
        // Create obstacles and coins periodically
        const spawnRate = Math.max(30, 80 - game.gameTime / 60);
        if (game.gameTime % spawnRate === 0) {
            createObstacleOrCoin();
        }
        
        // Update obstacles and coins
        updateObstacles();
        updateCoins();
        
        // Check collisions
        checkCollisions();
    }
}

function updateDinosaurs() {
    // Dinosaurs close the gap over time; if the player trips they accelerate
    for (let dino of game.dinosaurs) {
        // base speed that increases slowly over time
        const speedFactor = dino.baseSpeed + (game.gameTime / 800);
        const catchUpBoost = game.player.stunned ? 2.4 : 0.6;
        
        // Reduce z to move dinos closer to the player
        dino.z -= (speedFactor + catchUpBoost) * (1 + game.gameTime / 20000);
        
        // Slight lateral nudging so dinos aim toward the path center
        const targetX = canvas.width / 2 + game.pathOffset - 80;
        if (dino.x < targetX) {
            dino.x += Math.min(2.5, speedFactor * 0.5);
        } else if (dino.x > targetX) {
            dino.x -= Math.min(2.5, speedFactor * 0.5);
        }
        
        // When a dinosaur reaches very close, it's game over
        if (dino.z <= 40) {
            game.state = GAME_STATE.GAME_OVER;
        }
    }
}

function updatePlayer() {
    // If stunned, disable controls and play tumble animation until recovery
    if (game.player.stunned) {
        game.player.stunTimer--;
        // small tumble physics
        game.player.velocityY += game.player.gravity * 0.5;
        game.player.y += game.player.velocityY;
        if (game.player.y > 340) {
            game.player.y = 340;
            game.player.velocityY = 0;
        }
        if (game.player.stunTimer <= 0) {
            game.player.stunned = false;
            game.player.stunTimer = 0;
            // give a small pop to resume running
            game.player.velocityY = -6;
            game.player.isJumping = true;
        }
        return; // no lane change or jump while stunned
    }

    // Lane switching with left/right arrows
    if (game.keys['ArrowLeft'] && game.player.lane > 0) {
        game.player.lane--;
        game.keys['ArrowLeft'] = false;
    }
    if (game.keys['ArrowRight'] && game.player.lane < 2) {
        game.player.lane++;
        game.keys['ArrowRight'] = false;
    }
    
    // Jumping with up arrow or space
    if ((game.keys['ArrowUp'] || game.keys[' ']) && !game.player.isJumping) {
        game.player.velocityY = -game.player.jumpPower;
        game.player.isJumping = true;
        game.keys['ArrowUp'] = false;
        game.keys[' '] = false;
    }
    
    // Apply gravity
    game.player.velocityY += game.player.gravity;
    game.player.y += game.player.velocityY;
    
    // Ground collision - keep player on ground
    const groundLevel = 320;
    if (game.player.y >= groundLevel) {
        game.player.y = groundLevel;
        game.player.velocityY = 0;
        game.player.isJumping = false;
    }
}

function updatePathTurning() {
    // Path curves slightly - creates turning effect
    const sineWave = Math.sin(game.gameTime * 0.005) * 30;
    game.pathOffset = sineWave;
}

function createObstacleOrCoin() {
    const rand = Math.random();
    const lane = Math.floor(Math.random() * 3);
    
    if (rand < 0.7) {
        // 70% chance for tree limb obstacle
        game.obstacles.push({
            lane: lane,
            z: 500
        });
    } else {
        // 30% chance for coin
        game.coins.push({
            lane: lane,
            z: 500,
            collected: false
        });
    }
}

function updateObstacles() {
    for (let i = game.obstacles.length - 1; i >= 0; i--) {
        game.obstacles[i].z -= game.speed;
        
        // Remove obstacles that have passed  
        if (game.obstacles[i].z < -50) {
            game.obstacles.splice(i, 1);
        }
    }
}

function updateCoins() {
    for (let i = game.coins.length - 1; i >= 0; i--) {
        game.coins[i].z -= game.speed;
        
        // Remove coins that have passed
        if (game.coins[i].z < -50) {
            game.coins.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Check collision with obstacles (tree limbs) - now make a trip/stumble instead of immediate death
    for (let i = game.obstacles.length - 1; i >= 0; i--) {
        let obstacle = game.obstacles[i];
        // Collision if obstacle is near the player zone and in same lane
        if (obstacle.z < 30 && obstacle.z > -30 && obstacle.lane === game.player.lane) {
            // If not jumping high enough, player trips and is stunned briefly
            if (game.player.y > 300 && !game.player.stunned) {
                game.player.stunned = true;
                game.player.stunTimer = game.player.stunDuration;
                playMarioSound(220, 400, 'message');
                // remove the obstacle so it doesn't trip repeatedly
                game.obstacles.splice(i, 1);
            }
        }
    }
    
    // Check coin collection
    for (let i = game.coins.length - 1; i >= 0; i--) {
        const coin = game.coins[i];
        // Collect if coin is at player's zone and in same lane
        if (coin.z > 360 && coin.z < 400 && coin.lane === game.player.lane && !coin.collected) {
            coin.collected = true;
            game.coinsCollected += 1;
            game.coins.splice(i, 1);
        }
    }
    
    // Check if dinosaurs caught you (game over) based on their z distance
    for (let dino of game.dinosaurs) {
        if (dino.z <= 40) {
            game.state = GAME_STATE.GAME_OVER;
        }
    }
}

function drawGameOverScreen() {
    // Darken the screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over text
    ctx.fillStyle = colors.red;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CRASHED!', canvas.width / 2, 150);
    
    // Score
    ctx.fillStyle = colors.golden;
    ctx.font = '40px Arial';
    ctx.fillText(`Distance: ${game.score}m`, canvas.width / 2, 250);
    ctx.fillText(`Time Survived: ${Math.floor(game.gameTime / 60)}s`, canvas.width / 2, 310);
    
    // Restart instructions
    ctx.fillStyle = colors.white;
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to Run Again', canvas.width / 2, 400);
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
