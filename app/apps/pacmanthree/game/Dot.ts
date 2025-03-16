import * as THREE from "three";

export class Dot {
  private mesh: THREE.Mesh;

  constructor(position: THREE.Vector3) {
    // Create dot geometry (small sphere)
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);

    // Create dot material
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }
}
