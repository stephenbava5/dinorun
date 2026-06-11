import './styles.css';
import { Game } from './game/Game';
const canvas = document.getElementById('renderCanvas');
const uiRoot = document.getElementById('ui-root');
if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('renderCanvas not found or not a canvas element');
}
if (!uiRoot) {
    throw new Error('ui-root not found');
}
const game = new Game(canvas, uiRoot);
console.log('Loaded updated Vite TS game branch');
window.addEventListener('DOMContentLoaded', () => {
    game.start();
});
//# sourceMappingURL=main.js.map