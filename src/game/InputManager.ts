export class InputManager {
  private keys: Record<string, boolean> = {};

  constructor() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onKeyDown(event: KeyboardEvent) {
    this.keys[event.key] = true;
  }

  private onKeyUp(event: KeyboardEvent) {
    this.keys[event.key] = false;
  }

  public isPressed(key: string) {
    return !!this.keys[key];
  }

  public consume(key: string) {
    const pressed = !!this.keys[key];
    if (pressed) {
      this.keys[key] = false;
    }
    return pressed;
  }
}
