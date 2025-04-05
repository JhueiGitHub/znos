import * as THREE from "three";

export class Player {
  private mesh: THREE.Mesh;
  private speed: number = 5;
  private direction: THREE.Vector3 = new THREE.Vector3(-1, 0, 0);

  // Add getter for direction to help camera positioning
  public getDirection(): THREE.Vector3 {
    return this.direction;
  }

  constructor(position: THREE.Vector3) {
    // Create pacman geometry
    const geometry = new THREE.SphereGeometry(0.5, 32, 32, 0.1, Math.PI * 1.8);

    // Create pacman material
    const material = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    // Set initial rotation
    this.updateRotation();
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public update(deltaTime: number, keys: { [key: string]: boolean }): void {
    // Handle input
    let directionChanged = false;

    if (keys["w"] || keys["arrowup"]) {
      this.direction.set(0, 1, 0);
      directionChanged = true;
    } else if (keys["s"] || keys["arrowdown"]) {
      this.direction.set(0, -1, 0);
      directionChanged = true;
    } else if (keys["a"] || keys["arrowleft"]) {
      this.direction.set(-1, 0, 0);
      directionChanged = true;
    } else if (keys["d"] || keys["arrowright"]) {
      this.direction.set(1, 0, 0);
      directionChanged = true;
    }

    // Update rotation if direction changed
    if (directionChanged) {
      this.updateRotation();
    }

    // Move
    const movement = this.direction
      .clone()
      .multiplyScalar(this.speed * deltaTime);
    this.mesh.position.add(movement);

    // Animate mouth
    this.animateMouth(deltaTime);
  }

  public reset(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.direction.set(-1, 0, 0);
    this.updateRotation();
  }

  private updateRotation(): void {
    // Orient pacman in the direction of movement
    if (this.direction.x !== 0 || this.direction.y !== 0) {
      const angle = Math.atan2(this.direction.y, this.direction.x);
      this.mesh.rotation.z = angle - Math.PI / 2;
    }
  }

  private animateMouth(deltaTime: number): void {
    // Simple mouth animation (open and close)
    // In a full implementation, would animate the mouth based on time
  }
}
