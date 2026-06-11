export class InputManager {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    onKeyDown(event) {
        this.keys[event.key] = true;
    }
    onKeyUp(event) {
        this.keys[event.key] = false;
    }
    isPressed(key) {
        return !!this.keys[key];
    }
    consume(key) {
        const pressed = !!this.keys[key];
        if (pressed) {
            this.keys[key] = false;
        }
        return pressed;
    }
}
//# sourceMappingURL=InputManager.js.map