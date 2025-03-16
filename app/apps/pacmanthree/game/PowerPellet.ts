import * as THREE from "three";

export class PowerPellet {
  private mesh: THREE.Mesh;
  private pulsateSpeed: number = 2;
  private pulsateAmount: number = 0.3;
  private baseScale: number = 0.25;

  constructor(position: THREE.Vector3) {
    // Create pellet geometry (medium sphere)
    const geometry = new THREE.SphereGeometry(this.baseScale, 16, 16);

    // Create pellet material (glowing white)
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    // Start pulsating
    this.pulsate();
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  private pulsate(): void {
    // Create pulsating animation
    const scale = (time: number) => {
      const scaleFactor =
        this.baseScale +
        Math.sin(time * this.pulsateSpeed) * this.pulsateAmount;
      this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Request next frame
      requestAnimationFrame(scale);
    };

    // Start animation
    requestAnimationFrame(scale);
  }
}
