// game/Controls.ts
import { Car } from "./Car";

export class Controls {
  private car: Car;
  private keys: { [key: string]: boolean } = {};

  constructor(car: Car) {
    this.car = car;

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // Add event listeners
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.key.toLowerCase()] = true;
    this.updateCarControls();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.key.toLowerCase()] = false;
    this.updateCarControls();
  }

  private updateCarControls(): void {
    // WASD controls
    const isAccelerating = this.keys["w"] || this.keys["arrowup"];
    const isBraking = this.keys["s"] || this.keys["arrowdown"];
    const isTurningLeft = this.keys["a"] || this.keys["arrowleft"];
    const isTurningRight = this.keys["d"] || this.keys["arrowright"];

    this.car.setAccelerating(isAccelerating);
    this.car.setBraking(isBraking);
    this.car.setTurningLeft(isTurningLeft);
    this.car.setTurningRight(isTurningRight);
  }

  public dispose(): void {
    // Remove event listeners
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
