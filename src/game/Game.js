import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { Player } from './Player';
import { DinoChaser } from './DinoChaser';
import { Track } from './Track';
import { Coins } from './Coins';
import { Obstacles } from './Obstacles';
import { Shop } from './Shop';
import { UI } from './UI';
import { GameState } from './GameState';
const spawnIntervals = [120, 220, 320, 420];
export class Game {
    constructor(canvas, uiRoot) {
        this.canvas = canvas;
        this.uiRoot = uiRoot;
        this.dinos = [];
        this.state = GameState.MENU;
        this.previousState = GameState.MENU;
        this.gameTime = 0;
        this.bestDistance = 0;
        this.spawnCounter = 0;
        this.catchComments = [
            'Uh-oh, the dinos just turned you into a snack! That was rawr-some.',
            'Your explorer hat is stylish, but now it belongs to the dinosaur fashion show.',
            'If dinosaurs had a joke book, this would be the punchline. You got gobbled!',
            'You just got fossilized in record time. Clean, friendly, and full of dino giggles.',
            'Your coins are safe... in the dino bank. You are not.',
            'Whoops! The dinosaur thinks you are a great new chew toy.',
            'Dinosaur says: "No refunds, no returns, you are now dino dinner!"'
        ];
        this.sceneManager = new SceneManager(canvas);
        this.input = new InputManager();
        this.player = new Player(this.sceneManager.scene);
        this.track = new Track(this.sceneManager.scene);
        this.coins = new Coins(this.sceneManager.scene);
        this.obstacles = new Obstacles(this.sceneManager.scene);
        this.shop = new Shop();
        this.ui = new UI(uiRoot, this.shop, () => this.openShop());
        this.sceneManager.camera.setTarget(this.player.mesh.position);
        this.sceneManager.camera.radius = 18;
        this.sceneManager.camera.alpha = Math.PI / 2;
        this.sceneManager.camera.beta = Math.PI / 3.4;
        this.registerInput();
    }
    start() {
        this.ui.showMessage('Welcome to Dino Run', 'Press SPACE to begin your chase.');
        this.sceneManager.startRenderLoop(() => this.update());
    }
    registerInput() {
        window.addEventListener('keydown', (event) => {
            if (event.key === ' ' || event.key === 'Enter') {
                if (this.state === GameState.MENU) {
                    this.startGame();
                }
                else if (this.state === GameState.GAME_OVER) {
                    this.startGame();
                }
            }
            if (event.key === 'Escape') {
                if (this.state === GameState.SHOP) {
                    this.closeShop();
                }
                else if (this.state === GameState.PLAYING) {
                    this.pauseGame();
                }
                else if (this.state === GameState.PAUSED) {
                    this.resumeGame();
                }
            }
            if (event.key.toLowerCase() === 's') {
                if (this.state === GameState.MENU || this.state === GameState.PAUSED) {
                    this.openShop();
                }
            }
        });
    }
    startGame() {
        this.state = GameState.PLAYING;
        this.resetGame();
        this.ui.hideMessage();
    }
    pauseGame() {
        this.state = GameState.PAUSED;
        this.ui.showMessage('Paused', 'Press ESC to resume.');
    }
    resumeGame() {
        this.state = GameState.PLAYING;
        this.ui.hideMessage();
    }
    openShop() {
        this.previousState = this.state;
        this.state = GameState.SHOP;
        this.ui.openShop();
    }
    closeShop() {
        this.state = this.previousState;
        this.ui.closeShop();
        if (this.state === GameState.PLAYING) {
            this.ui.hideMessage();
        }
    }
    resetGame() {
        this.ui.hideMessage();
        this.player.reset();
        this.dinos = [
            new DinoChaser(this.sceneManager.scene, 0, 10),
            new DinoChaser(this.sceneManager.scene, 2, 13)
        ];
        this.track = new Track(this.sceneManager.scene);
        this.coins = new Coins(this.sceneManager.scene);
        this.obstacles = new Obstacles(this.sceneManager.scene);
        this.gameTime = 0;
        this.spawnCounter = 0;
        this.player.lives = 3;
        this.player.distance = 0;
        this.player.coins = 0;
        this.shop.balance = 0;
        this.ui.updateHud(0, this.bestDistance, 0);
    }
    update() {
        if (this.state === GameState.PLAYING) {
            this.gameTime += 1;
            const speed = 0.13 + Math.min(0.12, this.gameTime * 0.0003);
            this.player.distance = Math.floor(this.gameTime / 6);
            if (this.player.distance > this.bestDistance) {
                this.bestDistance = this.player.distance;
            }
            const effectiveSpeed = this.player.isTripped
                ? speed * Math.max(0.4, 1 - 0.18 * this.player.tripCount)
                : speed;
            this.track.update(effectiveSpeed);
            this.player.update();
            this.dinos.forEach((dino) => dino.update(this.player.lane, speed, this.player.isTripped ? this.player.tripCount : 0));
            this.coins.update(effectiveSpeed);
            this.obstacles.update(effectiveSpeed);
            this.spawnObjects();
            this.checkCollisions();
            this.updateCamera();
            if (this.input.consume('ArrowLeft') || this.input.consume('a') || this.input.consume('A')) {
                this.player.moveLeft();
            }
            if (this.input.consume('ArrowRight') || this.input.consume('d') || this.input.consume('D')) {
                this.player.moveRight();
            }
            if (this.input.consume('ArrowUp') || this.input.consume('w') || this.input.consume('W') || this.input.consume(' ')) {
                this.player.jump();
            }
            if (this.input.consume('ArrowDown') || this.input.consume('s') || this.input.consume('S')) {
                this.player.slide();
            }
            this.ui.updateHud(this.player.distance, this.bestDistance, this.player.coins);
        }
    }
    updateCamera() {
        const target = this.player.mesh.position.clone();
        target.z -= 6;
        this.sceneManager.camera.setTarget(target);
    }
    spawnObjects() {
        this.spawnCounter += 1;
        if (this.spawnCounter % 120 === 0) {
            const lane = Math.floor(Math.random() * 3);
            const pattern = Math.random();
            if (pattern < 0.5) {
                this.coins.spawnLine(lane, -18);
            }
            else {
                const obstacleType = Math.random() < 0.5 ? 'jump' : 'slide';
                this.obstacles.spawnObstacle(lane, -18, obstacleType);
            }
        }
    }
    checkCollisions() {
        const playerX = this.player.mesh.position.x;
        const playerZ = this.player.mesh.position.z;
        if (this.coins.checkCollection(playerX, playerZ)) {
            this.player.coins += 1;
            this.shop.balance += 1;
        }
        const obstacle = this.obstacles.checkCollision(playerX, this.player.position.y, playerZ, this.player.isSliding, this.player.isJumping);
        if (obstacle) {
            obstacle.mesh.dispose();
            if (!this.player.isTripped) {
                this.player.isTripped = true;
                this.player.tripCount = 1;
            }
            else {
                this.player.tripCount += 1;
            }
            this.dinos.forEach((dino) => dino.setCatching(true));
            const recoveryTime = 3000 + this.player.tripCount * 500;
            setTimeout(() => {
                if (this.state === GameState.PLAYING && this.player.isTripped) {
                    this.player.isTripped = false;
                    this.player.tripCount = 0;
                    this.dinos.forEach((dino) => dino.setCatching(false));
                }
            }, recoveryTime);
        }
        // Check if any dino catches the player while tripped
        if (this.player.isTripped) {
            for (const dino of this.dinos) {
                if (dino.isNearPlayer(playerZ)) {
                    const comment = this.getRandomCatchComment();
                    this.player.lives = 0;
                    this.handleGameOver(comment, comment);
                    return;
                }
            }
        }
    }
    handleGameOver(message, speechText) {
        this.state = GameState.GAME_OVER;
        this.ui.showMessage('Game Over', message);
        this.playDeathAudio(speechText ?? message);
    }
    getRandomCatchComment() {
        return this.catchComments[Math.floor(Math.random() * this.catchComments.length)];
    }
    playDeathAudio(text) {
        const playDeathSong = () => {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx)
                    return;
                const audioContext = new AudioCtx();
                const gain = audioContext.createGain();
                gain.gain.setValueAtTime(0.25, audioContext.currentTime);
                gain.connect(audioContext.destination);
                const notes = [220, 196, 165, 174, 147, 165, 196, 220];
                const durations = [0.24, 0.18, 0.18, 0.18, 0.24, 0.18, 0.18, 0.24];
                let start = audioContext.currentTime;
                for (let i = 0; i < notes.length; i++) {
                    const osc = audioContext.createOscillator();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(notes[i], start);
                    osc.connect(gain);
                    osc.start(start);
                    osc.stop(start + durations[i]);
                    start += durations[i];
                }
            }
            catch {
                // If audio fails, silently continue.
            }
        };
        const playRoar = () => {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx)
                    return;
                const audioContext = new AudioCtx();
                const carrier = audioContext.createOscillator();
                const modulator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                const modGain = audioContext.createGain();
                carrier.type = 'sawtooth';
                carrier.frequency.setValueAtTime(120, audioContext.currentTime);
                modulator.type = 'triangle';
                modulator.frequency.setValueAtTime(6, audioContext.currentTime);
                modGain.gain.setValueAtTime(30, audioContext.currentTime);
                modulator.connect(modGain);
                modGain.connect(carrier.frequency);
                gain.gain.setValueAtTime(0.4, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 1.4);
                carrier.connect(gain);
                gain.connect(audioContext.destination);
                const now = audioContext.currentTime;
                carrier.frequency.exponentialRampToValueAtTime(70, now + 0.8);
                carrier.frequency.exponentialRampToValueAtTime(50, now + 1.4);
                carrier.start(now);
                modulator.start(now);
                carrier.stop(now + 1.6);
                modulator.stop(now + 1.6);
                setTimeout(() => playDeathSong(), 1600);
            }
            catch {
                playDeathSong();
            }
        };
        if ('speechSynthesis' in window) {
            const speak = () => {
                const utterance = new SpeechSynthesisUtterance(text ?? 'You died! The dinosaurs got you!');
                utterance.pitch = 0.4;
                utterance.rate = 0.9;
                utterance.volume = 1;
                utterance.onend = () => playRoar();
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            };
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    speak();
                    window.speechSynthesis.onvoiceschanged = null;
                };
            }
            else {
                speak();
            }
        }
        else {
            playRoar();
        }
    }
}
//# sourceMappingURL=Game.js.map