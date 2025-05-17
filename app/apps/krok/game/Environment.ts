// game/Environment.ts
import * as THREE from "three";
import { assetManager, ModelId, TextureId } from "../assets/config";
import { Octree } from "three/examples/jsm/math/Octree";

export class Environment {
  private scene: THREE.Scene;
  private terrain: THREE.Group | null = null;
  private collisionMesh: THREE.Group | null = null;
  private octree: Octree | null = null;
  private spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.octree = new Octree();
  }

  public async init(): Promise<void> {
    // Create skybox
    this.createSkybox();

    // Add lighting
    this.createLighting();

    // Load terrain
    await this.loadTerrain();

    // Set up collision - disabled for now since it causes errors
    // this.setupCollision();
  }

  private createSkybox(): void {
    try {
      // Create a simple color skybox for now
      this.scene.background = new THREE.Color(0x88ccee);

      // Try to create a proper skybox if assets are available
      try {
        const skybox = assetManager.createSkybox();
        if (skybox) {
          this.scene.background = skybox;
        }
      } catch (e) {
        console.log("Using fallback skybox color");
      }
    } catch (error) {
      console.error("Failed to create skybox:", error);
      // Fallback to a solid color
      this.scene.background = new THREE.Color(0x88ccee);
    }
  }

  private createLighting(): void {
    // Hemisphere light for ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
    this.scene.add(hemisphereLight);

    // Directional light for shadows and directional lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 40, 150);
    directionalLight.castShadow = true;

    // Configure shadow properties
    const d = 200;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.radius = 1;
    directionalLight.shadow.bias = -0.00006;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;

    this.scene.add(directionalLight);

    // Add fog to the scene
    this.scene.fog = new THREE.Fog(0x88ccee, 0, 300);
  }

  private async loadTerrain(): Promise<void> {
    try {
      // Fallback to a simple ground plane for now to ensure it works
      console.log("Creating basic terrain plane");
      const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x44aa44,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);

      // Try to load the actual terrain model if available
      try {
        // Get the terrain model from the asset manager
        this.terrain =
          assetManager.getModel(ModelId.LEVEL_GRAPHIC)?.clone() ?? null;

        if (this.terrain) {
          this.terrain.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Apply textures
              if (child.material.map) {
                child.material.map.anisotropy = 4;
              }

              // Set up shadow properties
              child.castShadow = true;
              child.receiveShadow = true;

              // Check for spawn point
              if (child.name === "spawn-01") {
                this.spawnPoint = child.position.clone();
                // Make the spawn point invisible
                child.visible = false;
              }
            }
          });

          this.scene.add(this.terrain);
        }
      } catch (e) {
        console.log("Using basic terrain plane");
      }
    } catch (error) {
      console.error("Error loading terrain:", error);
    }
  }

  private setupCollision(): void {
    // Skip collision setup for now as it's causing errors
    // When we implement this properly, we'll use the correct Octree methods
    console.log("Skipping collision setup for now");
  }

  public getSpawnPoint(): THREE.Vector3 {
    return this.spawnPoint.clone();
  }

  public getCollisionOctree(): Octree | null {
    // Return null to disable collision checking for now
    return null;
  }

  public update(deltaTime: number): void {
    // Optional animations or updates to the environment
  }

  public dispose(): void {
    // Clean up resources

    // Remove terrain from scene
    if (this.terrain) {
      this.scene.remove(this.terrain);

      // Dispose of geometries and materials
      this.terrain.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }

          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });

      this.terrain = null;
    }

    // Remove collision mesh from scene
    if (this.collisionMesh) {
      this.scene.remove(this.collisionMesh);
      this.collisionMesh = null;
    }

    // Clear octree
    this.octree = null;
  }
}
