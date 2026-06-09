// Dino Run Game - Timber Run Style!
// Run away from dinosaurs! Jump over obstacles and collect coins!

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Jungle-themed colors
const colors = {
    darkGreen: '#1e3d1f',
    lightGreen: '#2f6a38',
    skyBlue: '#3f6b7f',
    golden: '#f4c542',
    brown: '#6b4e32',
    darkBrown: '#2f1f13',
    white: '#f5f2dd',
    red: '#d14f31',
    gray: '#7c7c7c'
};

// Game states
const GAME_STATE = {
    WELCOME: 'welcome',
    SHOP: 'shop',
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
    wallet: 0,
    selectedSkin: 'default',
    skins: [
        { id: 'default', name: 'Runner', cost: 0, unlocked: true },
        { id: 'godzilla', name: 'Godzilla Skin', cost: 30, unlocked: false },
        { id: 'kingkong', name: 'King Kong Skin', cost: 35, unlocked: false },
        { id: 'homer', name: 'Homer Skin', cost: 20, unlocked: false },
        { id: 'bart', name: 'Bart Skin', cost: 25, unlocked: false }
    ],
    
    // Player object - human running away (now can be stunned)
    player: {
        lane: 1, // 0 = left, 1 = middle, 2 = right
        y: 450, // Position on screen (running in place near the foreground)
        width: 40,
        height: 60,
        velocityY: 0,
        jumpPower: 14,
        isJumping: false,
        gravity: 0.6,
        stunned: false,
        stunTimer: 0,
        stunDuration: 90, // frames (~1.5s)
        // trip/slow mechanic: count of recent trips; two trips -> caught
        trips: 0,
        slowTimer: 0
    },
    
    // Dinosaurs chasing from behind - z is distance behind the player
    dinosaurs: [
        { x: 50, y: 250, width: 60, height: 60, baseSpeed: 2.8, z: 90 },
        { x: 250, y: 280, width: 70, height: 65, baseSpeed: 2.6, z: 110 }
    ],
    
    // Path turning
    pathOffset: 0, // How much the path curves left/right
    
    // Obstacles array (tree limbs and coins)
    obstacles: [],
    coins: [],
    monkeys: [],
    
    // Background scroll
    scrollOffset: 0,
    // Speed scale applied when slowed by obstacles
    speedScale: 1,
    
    // Keyboard input tracking
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ' ': false
    }
};

// Sound effect generator using Web Audio API
function playSoundEffect(frequency = 880, duration = 100, type = 'jump') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'jump') {
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        } else if (type === 'coin') {
            oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1300, audioContext.currentTime + 0.1);
        } else if (type === 'hit') {
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + duration / 1000);
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

// Parallax layer updater (animates CSS background layers to create Temple Run feel)
function updateParallaxLayers() {
    try {
        const far = document.querySelector('.layer-far');
        const mid = document.querySelector('.layer-mid');
        const near = document.querySelector('.layer-near');

        if (far) {
            const fx = -((game.scrollOffset * 0.06) + (game.pathOffset * 0.12));
            far.style.transform = `translateX(${fx}px)`;
        }
        if (mid) {
            const mx = -((game.scrollOffset * 0.12) + (game.pathOffset * 0.18));
            mid.style.transform = `translateX(${mx}px)`;
        }
        if (near) {
            const nx = -((game.scrollOffset * 0.36) + (game.pathOffset * 0.28));
            near.style.transform = `translateX(${nx}px)`;
        }
    } catch (e) {
        // DOM might not be ready in some embed contexts; ignore failures
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

    if ((e.key === 's' || e.key === 'S') && game.state === GAME_STATE.WELCOME) {
        game.state = GAME_STATE.SHOP;
    }

    if (game.state === GAME_STATE.SHOP) {
        if (e.key === 'b' || e.key === 'B') {
            game.state = GAME_STATE.WELCOME;
        }
        if (['1','2','3','4','5'].includes(e.key)) {
            handleShopInput(parseInt(e.key, 10) - 1);
        }
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
    game.monkeys = [];
    game.scrollOffset = 0;
    game.pathOffset = 0;
    game.speedScale = 1;
    
    // Reset player position
    game.player.lane = 1;
    game.player.y = 450;
    game.player.velocityY = 0;
    game.player.isJumping = false;
    game.player.stunned = false;
    game.player.stunTimer = 0;
    game.player.slowTimer = 0;
    game.player.trips = 0;
    
    // Reset dinosaurs
    const centerX = canvas.width / 2 + game.pathOffset;
    const playerY = game.player.y;
    const laneX = createLanePosition(game.player.lane, centerX, playerY);
    game.dinosaurs[0].x = laneX - 80;
    game.dinosaurs[0].z = 92;
    game.dinosaurs[1].x = laneX + 80;
    game.dinosaurs[1].z = 108;
}


// Draw functions
function drawWelcomeScreen() {
    // Sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.skyBlue);
    gradient.addColorStop(0.6, colors.darkGreen);
    gradient.addColorStop(1, '#121e12');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw temple scenery
    drawTempleRuins(0);
    
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
    ctx.fillText('Temple Run Escape!', canvas.width / 2, 170);
    
    // Instructions
    ctx.fillStyle = colors.white;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    
    const instructions = [
        'RUN FROM THE TEMPLE DINO HORDES!',
        'Jump over ruins and obstacles with UP ARROW',
        'Collect coins and stay ahead',
        'Dodge left/right to keep the chase going',
        '',
        'Press SPACE or ENTER to Start',
        'Press S for Shop',
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

function drawShopScreen() {
    ctx.fillStyle = 'rgba(8, 20, 14, 0.96)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.golden;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SHOP', canvas.width / 2, 80);

    ctx.fillStyle = colors.white;
    ctx.font = '24px Arial';
    ctx.fillText('Wallet: ' + game.wallet + ' coins', canvas.width / 2, 120);
    ctx.fillText('Press 1-5 to Choose/Buy, B to go back', canvas.width / 2, 150);

    const boxWidth = 140;
    const boxHeight = 200;
    const spacing = 18;
    const startX = canvas.width / 2 - (boxWidth * game.skins.length + spacing * (game.skins.length - 1)) / 2;
    const startY = 180;

    for (let i = 0; i < game.skins.length; i++) {
        const skin = game.skins[i];
        const x = startX + i * (boxWidth + spacing);
        const y = startY;
        const selected = game.selectedSkin === skin.id;

        ctx.fillStyle = selected ? 'rgba(196, 160, 76, 0.2)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeStyle = selected ? colors.golden : 'rgba(255,255,255,0.18)';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        drawShopSkinPreview(x + boxWidth / 2, y + 65, skin.id);

        ctx.fillStyle = colors.white;
        ctx.font = '18px Arial';
        ctx.fillText((i + 1) + '. ' + skin.name, x + boxWidth / 2, y + 130);

        ctx.font = '16px Arial';
        if (skin.unlocked) {
            ctx.fillStyle = colors.golden;
            ctx.fillText('OWNED', x + boxWidth / 2, y + 155);
        } else {
            ctx.fillStyle = colors.white;
            ctx.fillText('Cost: ' + skin.cost, x + boxWidth / 2, y + 155);
        }
    }
}

function handleShopInput(index) {
    const skin = game.skins[index];
    if (!skin) return;
    if (skin.unlocked) {
        game.selectedSkin = skin.id;
        playSoundEffect(780, 100, 'coin');
        return;
    }
    if (game.wallet >= skin.cost) {
        game.wallet -= skin.cost;
        skin.unlocked = true;
        game.selectedSkin = skin.id;
        playSoundEffect(920, 140, 'coin');
    } else {
        playSoundEffect(200, 220, 'hit');
    }
}

function drawShopSkinPreview(cx, cy, skinId) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#3c3c3c';
    ctx.fillRect(-32, -28, 64, 56);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.strokeRect(-32, -28, 64, 56);

    if (skinId === 'default') {
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(-14, -18, 28, 32);
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.arc(0, -24, 10, 0, Math.PI * 2);
        ctx.fill();
    } else if (skinId === 'godzilla') {
        ctx.fillStyle = '#1f5e1f';
        ctx.fillRect(-16, -18, 32, 34);
        ctx.fillStyle = '#2ba72b';
        for (let i = -16; i <= 16; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, -18);
            ctx.lineTo(i + 4, -28);
            ctx.lineTo(i + 8, -18);
            ctx.fill();
        }
    } else if (skinId === 'kingkong') {
        ctx.fillStyle = '#422a14';
        ctx.fillRect(-18, -22, 36, 38);
        ctx.fillStyle = '#2f1f0f';
        ctx.beginPath();
        ctx.arc(0, -26, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4d2e14';
        ctx.fillRect(-12, -2, 24, 18);
    } else if (skinId === 'homer') {
        ctx.fillStyle = '#f7d54c';
        ctx.fillRect(-14, -22, 28, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -28, 28, 8);
    } else if (skinId === 'bart') {
        ctx.fillStyle = '#f7d54c';
        ctx.beginPath();
        ctx.arc(0, -28, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f26422';
        ctx.fillRect(-18, -6, 36, 20);
        ctx.fillStyle = '#444';
        ctx.fillRect(-22, 10, 44, 8);
    }
    ctx.restore();
}

function drawGameScreen() {
    // Update parallax layers behind the canvas
    updateParallaxLayers();

    // Apply subtle camera shake when the player is stunned (trip effect)
    ctx.save();
    if (game.player.stunned) {
        const intensity = Math.min(6, (game.player.stunTimer / game.player.stunDuration) * 6);
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        ctx.translate(shakeX, shakeY);
    }

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.skyBlue);
    gradient.addColorStop(0.4, colors.darkGreen);
    gradient.addColorStop(1, '#122010');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw temple ruins and towers in the distance
    drawTempleRuins(game.scrollOffset * 0.2);

    // Draw monkeys in the midground
    for (let m of game.monkeys) {
        drawMonkey(m);
    }
    
    // Draw path/ground with perspective
    drawPath();
    
    // Draw dinosaurs chasing (background) - always drawn behind the player
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
    
    // Draw HUD
    ctx.fillStyle = colors.golden;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Distance: ${game.score}m`, 20, 40);
    ctx.fillText(`Coins: ${game.coinsCollected}`, 20, 70);
    ctx.fillText(`Wallet: ${game.wallet}`, 20, 100);
    ctx.fillText(`Speed: ${game.speed.toFixed(1)}`, 20, 130);
    // Show nearest dinosaur distance (chaser)
    const nearest = Math.min(...game.dinosaurs.map(d => Math.max(0, Math.floor(d.z))));
    ctx.fillText(`Chaser Dist: ${nearest}m`, 20, 160);

    ctx.restore();
}

function drawPath() {
    const centerX = canvas.width / 2 + game.pathOffset;
    const horizonY = 140;
    const legs = 16;

    for (let i = 0; i < legs; i++) {
        const t = i / (legs - 1);
        const screenY = horizonY + t * (canvas.height - horizonY - 40);
        const nextY = horizonY + (i + 1) / (legs - 1) * (canvas.height - horizonY - 40);
        const width1 = 100 + t * 320;
        const width2 = 100 + ((i + 1) / (legs - 1)) * 320;

        ctx.fillStyle = i % 2 === 0 ? '#5b451f' : '#6d5731';
        ctx.beginPath();
        ctx.moveTo(centerX - width1 / 2, screenY);
        ctx.lineTo(centerX + width1 / 2, screenY);
        ctx.lineTo(centerX + width2 / 2, nextY);
        ctx.lineTo(centerX - width2 / 2, nextY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - width1 / 2, screenY);
        ctx.lineTo(centerX - width2 / 2, nextY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + width1 / 2, screenY);
        ctx.lineTo(centerX + width2 / 2, nextY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(245, 210, 125, 0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([14, 18]);
        ctx.beginPath();
        ctx.moveTo(centerX - width1 / 6, screenY);
        ctx.lineTo(centerX - width2 / 6, nextY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + width1 / 6, screenY);
        ctx.lineTo(centerX + width2 / 6, nextY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawTempleRuins(offset) {
    const centerX = canvas.width / 2;
    // distant temple mound & fading jungle
    ctx.fillStyle = 'rgba(50, 80, 50, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.quadraticCurveTo(200, 300, 400, 360);
    ctx.quadraticCurveTo(600, 300, 800, 420);
    ctx.lineTo(800, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();

    // temple towers and broken archways
    const ruins = [120, 260, 520, 680];
    for (let i = 0; i < ruins.length; i++) {
        const x = ruins[i] + Math.sin((game.gameTime + i * 30) * 0.002) * 12 + offset * 0.1;
        const height = 120 + (i % 2) * 30;
        ctx.fillStyle = '#241a10';
        ctx.fillRect(x - 16, 340 - height, 32, height);
        ctx.fillStyle = '#3b2f22';
        ctx.fillRect(x - 24, 340 - (height * 0.5), 8, height * 0.5);
        ctx.fillRect(x + 16, 340 - (height * 0.5), 8, height * 0.5);
        if (i % 2 === 0) {
            ctx.fillStyle = '#5e432e';
            ctx.fillRect(x - 12, 340 - height + 10, 24, 20);
        }
    }

    // temple lanterns along horizon
    for (let i = 0; i < 6; i++) {
        const x = 80 + i * 120 + offset * 0.15;
        ctx.fillStyle = '#c9983c';
        ctx.beginPath();
        ctx.ellipse(x, 365, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawDinosaursChasingBackground() {
    // Draw each dino as a chaser behind the player
    for (let dino of game.dinosaurs) {
        const centerX = canvas.width / 2 + game.pathOffset;
        const playerY = game.player.y;
        const screenY = playerY + 24 + dino.z * 0.22;
        const scale = Math.max(0.48, Math.min(0.85, 0.85 - dino.z * 0.0028));
        const xOffset = (dino.x - centerX) * 0.6;

        const shadowRadius = Math.max(18, 40 * scale);
        const shadowAlpha = Math.max(0.05, Math.min(0.28, (1 - dino.z / 160)));
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(centerX + xOffset, screenY + (18 * scale), shadowRadius, shadowRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        drawDinosaurAtPosition(centerX + xOffset - (28 * scale), screenY - (12 * scale), 80 * scale, scale);
    }
}

function drawDinosaurAtPosition(x, y, size, scale) {
    const w = size * scale;
    const h = size * scale;
    const tailOffset = Math.sin(game.gameTime * 0.06) * 8 * scale;
    
    // Slight body tilt to make the shape more organic
    const bodyGrad = ctx.createLinearGradient(x - w/4, y, x + w, y + h);
    bodyGrad.addColorStop(0, '#123d12');
    bodyGrad.addColorStop(0.6, '#2a6e2a');
    bodyGrad.addColorStop(1, '#185018');

    // Main torso
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2.1, h / 2.6, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Back ridge / scales
    ctx.fillStyle = '#0f3b0f';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const rx = x + w/4 + i * (w*0.18);
        const ry = y + h/6 + Math.sin(game.gameTime * 0.08 + i) * 1.5 * scale;
        ctx.ellipse(rx, ry, 6*scale, 10*scale, -0.5, 0, Math.PI*2);
        ctx.fill();
    }

    // Tail (dynamic)
    ctx.fillStyle = '#163e16';
    ctx.beginPath();
    ctx.ellipse(x - w / 6 + tailOffset, y + h / 2 + 6 * scale, w / 6, h / 8, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Leg - suggestive but simple silhouette (keeps performance)
    ctx.fillStyle = '#122e12';
    ctx.beginPath();
    ctx.ellipse(x + w/3, y + h - 6*scale, w/8, h/6, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + (2*w)/3, y + h - 6*scale, w/8, h/6, 0, 0, Math.PI*2);
    ctx.fill();

    // Head with sharper muzzle
    ctx.fillStyle = '#0c3a0c';
    ctx.beginPath();
    ctx.ellipse(x + w - 12 * scale, y + 10 * scale, 16 * scale, 20 * scale, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils / mouth details
    ctx.fillStyle = '#b23b3b';
    ctx.beginPath();
    ctx.ellipse(x + w - 10 * scale, y + 18 * scale, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye (small, focused)
    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(x + w - 2 * scale, y + 7 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Teeth hint
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + w - 14 + i * 5 * scale, y + 20 * scale);
        ctx.lineTo(x + w - 12 + i * 5 * scale, y + 24 * scale);
        ctx.stroke();
    }

    // Subtle highlights for realism
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.ellipse(x + w/3, y + h/3, w/6, h/8, 0, 0, Math.PI*2);
    ctx.fill();
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
        ctx.fillStyle = '#7B5E2B';
        ctx.fillRect(x, y + 18, w, h - 20);
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(x + w / 2 + 6, y - 4, w / 2.2, w / 2.6, -0.4, 0, Math.PI * 2);
        ctx.fill();
        const legAngle = Math.sin(game.gameTime * 0.2) * 6;
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 4, y + h - 10 + legAngle, 4, 14);
        ctx.fillRect(x + w - 8, y + h - 10 - legAngle, 4, 14);
        ctx.fillStyle = 'rgba(200,200,200,0.6)';
        ctx.beginPath();
        ctx.arc(x + w/2 + 10, y + h - 8, 10, 0, Math.PI * 2);
        ctx.fill();
    } else {
        drawSelectedSkinPlayer(x, y, w, h);
    }
    ctx.restore();
}

function drawSelectedSkinPlayer(x, y, w, h) {
    const skin = game.selectedSkin;
    if (skin === 'godzilla') {
        ctx.fillStyle = '#2f6f2f';
        ctx.fillRect(x, y + 10, w, h - 24);
        ctx.fillStyle = '#1f4f1f';
        ctx.fillRect(x + 4, y + 6, w - 8, 18);
        ctx.fillStyle = '#79c879';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            const px = x + 6 + i * 8;
            ctx.moveTo(px, y + 4);
            ctx.lineTo(px + 4, y - 6);
            ctx.lineTo(px + 8, y + 4);
            ctx.fill();
        }
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 10, y + h - 15, 6, 16);
        ctx.fillRect(x + w - 16, y + h - 15, 6, 16);
    } else if (skin === 'kingkong') {
        ctx.fillStyle = '#4f321e';
        ctx.fillRect(x, y + 6, w, h - 20);
        ctx.fillStyle = '#3b220f';
        ctx.fillRect(x, y + 6, w, 20);
        ctx.fillStyle = '#2d1c0d';
        ctx.beginPath();
        ctx.arc(x + w / 2, y - 6, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1b0f06';
        ctx.fillRect(x + 8, y + h - 16, 8, 16);
        ctx.fillRect(x + w - 16, y + h - 16, 8, 16);
    } else if (skin === 'homer') {
        ctx.fillStyle = '#f3d756';
        ctx.fillRect(x, y + 4, w, h - 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 6, w - 8, 18);
        ctx.fillStyle = '#f3d756';
        ctx.beginPath();
        ctx.arc(x + w / 2, y - 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + w / 3 - 4, y + h - 16, 8, 16);
        ctx.fillRect(x + (2 * w) / 3 - 4, y + h - 16, 8, 16);
    } else if (skin === 'bart') {
        ctx.fillStyle = '#f3d756';
        ctx.beginPath();
        ctx.arc(x + w / 2, y - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6200';
        ctx.fillRect(x, y + 4, w, h - 20);
        ctx.fillStyle = '#444';
        ctx.fillRect(x - 6, y + h - 4, w + 12, 6);
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(x + w - 12, y + 10, 4, 24);
    } else {
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(x, y + 10, w, h - 20);
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.arc(x + w / 2, y, w / 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5b3b1a';
        ctx.fillRect(x + w / 4, y + 6, w / 2, h / 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + w / 4 + 2, y + 8, w / 2 - 4, h / 2 - 4);
    }
    const legOffset = Math.sin(game.gameTime * 0.14) * 5;
    ctx.fillStyle = '#555555';
    ctx.fillRect(x + 4, y + h - 15 + legOffset, 6, 15);
    ctx.fillRect(x + w - 12, y + h - 15 - legOffset, 6, 15);
}

function drawObstacle(obstacle) {
    const screenY = projectZ(obstacle.z);
    
    // Only draw if on screen
    if (screenY > 120 && screenY < canvas.height) {
        const centerX = canvas.width / 2 + game.pathOffset;
        
        // Perspective scaling
        const scale = Math.max(0.3, 1 - obstacle.z / 500);
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
    const screenY = projectZ(coin.z);
    
    // Only draw if on screen
    if (screenY > 120 && screenY < canvas.height) {
        const centerX = canvas.width / 2 + game.pathOffset;
        const scale = Math.max(0.35, 1 - coin.z / 500);
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

function projectZ(z) {
    // Convert world distance to screen Y for perspective
    // Larger z = farther away, closer to the horizon.
    const minY = 140;
    const maxY = 520;
    const clampedZ = Math.max(0, Math.min(560, z));
    return maxY - clampedZ * 0.65;
}

function createLanePosition(lane, centerX, screenY) {
    // Create lane positions with perspective based on screen Y
    const minPathWidth = 120;
    const maxPathWidth = 420;
    const horizonY = 140;
    const normalized = Math.max(0, Math.min(1, (screenY - horizonY) / (canvas.height - horizonY)));
    const pathWidth = minPathWidth + (maxPathWidth - minPathWidth) * normalized;
    const laneOffset = (lane - 1) * (pathWidth / 3);
    return centerX + laneOffset;
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
        const baseSpeed = 5 + (game.gameTime / 400);
        // Apply temporary slow multiplier (from trips)
        if (game.player.slowTimer > 0) {
            game.player.slowTimer--;
            game.speedScale = 0.6;
            if (game.player.slowTimer <= 0) {
                game.speedScale = 1;
            }
        }
        game.speed = baseSpeed * (game.speedScale || 1);

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
            // occasionally spawn a dinosaur alongside obstacles for simultaneous threats
            if (Math.random() < 0.28) {
                spawnDinosaur();
            }
            // occasionally spawn a monkey for visual/obstacle variety
            if (Math.random() < 0.12) {
                spawnMonkey();
            }
        }
        
        // Update obstacles, coins and monkeys
        updateObstacles();
        updateCoins();
        updateMonkeys();
        
        // Check collisions
        checkCollisions();
    }
}

function updateDinosaurs() {
    for (let i = game.dinosaurs.length - 1; i >= 0; i--) {
        const dino = game.dinosaurs[i];
        const speedFactor = dino.baseSpeed + (game.gameTime / 1000);
        const desiredZ = game.player.stunned ? 18 : 92 + Math.sin(game.gameTime * 0.016) * 5;
        const smoothing = Math.min(0.24, 0.08 + speedFactor * 0.01);
        dino.z += (desiredZ - dino.z) * smoothing;

        const centerX = canvas.width / 2 + game.pathOffset;
        const playerY = game.player.y;
        const desiredX = createLanePosition(game.player.lane, centerX, playerY + 24 + dino.z * 0.22);
        const lateralSpeed = Math.min(3.0, speedFactor * 0.6);
        if (dino.x < desiredX - 2) dino.x += lateralSpeed;
        else if (dino.x > desiredX + 2) dino.x -= lateralSpeed;

        if (dino.z < 0) {
            dino.z = 0;
        }
    }
}

function spawnDinosaur() {
    // Spawn a new dinosaur behind the player
    const lane = Math.floor(Math.random() * 3);
    const centerX = canvas.width / 2 + game.pathOffset;
    const playerY = game.player.y;
    const spawnZ = 90 + Math.random() * 30;
    const x = createLanePosition(lane, centerX, playerY);
    const newDino = {
        x: x,
        y: 280,
        width: 64,
        height: 64,
        baseSpeed: 2.4 + Math.random() * 1.0,
        z: spawnZ
    };
    game.dinosaurs.push(newDino);
}

function updatePlayer() {
    // If stunned, disable controls and play tumble animation until recovery
    if (game.player.stunned) {
        game.player.stunTimer--;
        // small tumble physics
        game.player.velocityY += game.player.gravity * 0.5;
        game.player.y += game.player.velocityY;
        if (game.player.y > 450) {
            game.player.y = 450;
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
        playSoundEffect(560, 120, 'jump');
    }
    
    // Apply gravity
    game.player.velocityY += game.player.gravity;
    game.player.y += game.player.velocityY;
    
    // Ground collision - keep player on ground
    const groundLevel = 450;
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
            // If not jumping high enough, player trips and stumbles
            if (game.player.y > 300 && !game.player.stunned) {
                game.player.trips = (game.player.trips || 0) + 1;
                game.player.stunned = true;
                game.player.stunTimer = 60;
                game.player.slowTimer = 120;
                game.speedScale = 0.6;
                playSoundEffect(260, 180, 'hit');
                game.obstacles.splice(i, 1);

                if (game.player.trips >= 2) {
                    game.state = GAME_STATE.GAME_OVER;
                }
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
            game.wallet += 1;
            game.coins.splice(i, 1);
            playSoundEffect(920, 140, 'coin');
        }
    }
    
    // Check if dinosaurs caught you (game over) based on their z distance
    for (let dino of game.dinosaurs) {
        const captureDistance = 28;
        if (dino.z <= captureDistance) {
            const jumpClearY = 280;
            const playerAirborne = game.player.y < jumpClearY || game.player.isJumping;
            if (!playerAirborne) {
                game.state = GAME_STATE.GAME_OVER;
            }
        }
    }
}

// Monkeys: visual NPCs that occasionally run across lanes
function spawnMonkey() {
    const lane = Math.floor(Math.random() * 3);
    const centerX = canvas.width / 2 + game.pathOffset;
    const spawnZ = 520 + Math.random() * 80;
    const spawnY = projectZ(spawnZ);
    const x = createLanePosition(lane, centerX, spawnY);
    game.monkeys.push({
        lane: lane,
        x: x,
        z: spawnZ,
        dir: Math.random() < 0.5 ? -1 : 1,
        wobble: Math.random() * Math.PI * 2
    });
}

function updateMonkeys() {
    for (let i = game.monkeys.length - 1; i >= 0; i--) {
        const m = game.monkeys[i];
        // monkeys move forward with the world
        m.z -= game.speed * 0.9;
        m.wobble += 0.08;
        // small lateral sway
        m.x += Math.sin(m.wobble) * 0.6 * m.dir;
        if (m.z < -80) game.monkeys.splice(i, 1);
    }
}

function drawMonkey(monkey) {
    const centerX = canvas.width / 2 + game.pathOffset;
    const screenY = projectZ(monkey.z);
    if (screenY <= 120 || screenY >= canvas.height) return;
    const scale = Math.max(0.35, 1 - monkey.z / 600);
    const x = monkey.x;
    const y = screenY - 10 * scale;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(x, y + 18 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#6b3f1a';
    ctx.beginPath();
    ctx.ellipse(x, y, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.fillStyle = '#8b5a33';
    ctx.beginPath();
    ctx.arc(x + 8 * scale, y - 8 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    // tail
    ctx.strokeStyle = '#6b3f1a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 8 * scale, y + 2 * scale);
    ctx.quadraticCurveTo(x - 18 * scale, y - 6 * scale, x - 12 * scale, y - 14 * scale);
    ctx.stroke();
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
    } else if (game.state === GAME_STATE.SHOP) {
        drawShopScreen();
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
