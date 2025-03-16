import * as THREE from "three";

export class Ghost {
  private mesh: THREE.Mesh;
  private speed: number = 3;
  private direction: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
  private vulnerable: boolean = false;
  private normalMaterial: THREE.MeshPhongMaterial;
  private vulnerableMaterial: THREE.MeshPhongMaterial;
  private vulnerableTimer: number = 0;

  constructor(position: THREE.Vector3, color: number = 0xff0000) {
    // Create ghost geometry (simple sphere for now)
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);

    // Create materials
    this.normalMaterial = new THREE.MeshPhongMaterial({ color });
    this.vulnerableMaterial = new THREE.MeshPhongMaterial({
      color: 0x0000ff,
      wireframe: true,
    });

    // Create mesh with normal material
    this.mesh = new THREE.Mesh(geometry, this.normalMaterial);
    this.mesh.position.copy(position);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public isVulnerable(): boolean {
    return this.vulnerable;
  }

  public setVulnerable(vulnerable: boolean): void {
    this.vulnerable = vulnerable;

    // Change material based on vulnerability
    this.mesh.material = vulnerable
      ? this.vulnerableMaterial
      : this.normalMaterial;

    // Slow down when vulnerable
    this.speed = vulnerable ? 2 : 3;
  }

  public update(
    deltaTime: number,
    playerPosition: THREE.Vector3 | undefined
  ): void {
    // If vulnerable, update timer
    if (this.vulnerable) {
      this.vulnerableTimer += deltaTime;

      // Blink when nearly done being vulnerable
      if (
        this.vulnerableTimer > 8 &&
        Math.floor(this.vulnerableTimer * 4) % 2 === 0
      ) {
        this.mesh.material = this.normalMaterial;
      } else {
        this.mesh.material = this.vulnerableMaterial;
      }

      // End vulnerability after 10 seconds
      if (this.vulnerableTimer > 10) {
        this.setVulnerable(false);
        this.vulnerableTimer = 0;
      }
    }

    // Basic ghost AI
    if (playerPosition && Math.random() < 0.02) {
      // Occasionally change direction based on player position
      if (this.vulnerable) {
        // Run away from player when vulnerable
        this.direction.copy(this.mesh.position).sub(playerPosition).normalize();
      } else {
        // Chase player when not vulnerable
        this.direction.copy(playerPosition).sub(this.mesh.position).normalize();
      }
    } else if (Math.random() < 0.01) {
      // Occasionally change to a random direction
      this.changeToRandomDirection();
    }

    // Move
    const movement = this.direction
      .clone()
      .multiplyScalar(this.speed * deltaTime);
    this.mesh.position.add(movement);

    // Wrap around edges
    this.wrapPosition();
  }

  public reset(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.setVulnerable(false);
    this.vulnerableTimer = 0;
    this.changeToRandomDirection();
  }

  private changeToRandomDirection(): void {
    // Choose a random direction (up, down, left, right)
    const rand = Math.floor(Math.random() * 4);

    switch (rand) {
      case 0:
        this.direction.set(1, 0, 0);
        break;
      case 1:
        this.direction.set(-1, 0, 0);
        break;
      case 2:
        this.direction.set(0, 1, 0);
        break;
      case 3:
        this.direction.set(0, -1, 0);
        break;
    }
  }

  private wrapPosition(): void {
    const position = this.mesh.position;

    // Simple wrapping for demo purposes
    // In a full game, would use the level bounds
    if (position.x < 0) position.x = 28;
    if (position.x > 28) position.x = 0;
    if (position.y < 0) position.y = 30;
    if (position.y > 30) position.y = 0;
  }
}
