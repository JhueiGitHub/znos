// game/Environment.ts
import * as THREE from "three";
import { assetManager, ModelId, TextureId } from "../assets/config";
import { Octree } from "three/examples/jsm/math/Octree";
import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper";

export class Environment {
  private scene: THREE.Scene;
  private terrain: THREE.Group | null = null;
  private collisionMesh: THREE.Group | null = null;
  private octree: Octree | null = null;
  private spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0);
  
  // Debug visualization elements
  private debugMode = false;
  private debugRayHelper: THREE.ArrowHelper | null = null;
  private debugOctreeHelper: OctreeHelper | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.octree = new Octree();
  }

  public async init(): Promise<void> {
    try {
      // Create debug elements for visualization
      this.createDebugElements();
      
      // Create skybox
      this.createSkybox();

      // Add lighting
      this.createLighting();

      // Load terrain
      await this.loadTerrain();

      // Set up collision
      await this.setupCollision();
    } catch (error) {
      console.error("Error during environment initialization:", error);
    }
  }

  private createDebugElements(): void {
    // Create debug ray helper (initially hidden)
    const rayOrigin = new THREE.Vector3(0, 10, 0);
    const rayDirection = new THREE.Vector3(0, -1, 0).normalize();
    const rayLength = 10;
    const rayColor = 0xff0000;
    this.debugRayHelper = new THREE.ArrowHelper(rayDirection, rayOrigin, rayLength, rayColor);
    this.debugRayHelper.visible = this.debugMode;
    this.scene.add(this.debugRayHelper);
  }

  public toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    
    // Toggle visibility of debug elements
    if (this.debugRayHelper) {
      this.debugRayHelper.visible = this.debugMode;
    }
    
    // Create and show octree helper if in debug mode
    if (this.debugMode && this.octree && !this.debugOctreeHelper) {
      this.debugOctreeHelper = new OctreeHelper(this.octree);
      this.debugOctreeHelper.visible = true;
      this.scene.add(this.debugOctreeHelper);
    } else if (!this.debugMode && this.debugOctreeHelper) {
      if (this.debugOctreeHelper.parent) {
        this.debugOctreeHelper.parent.remove(this.debugOctreeHelper);
      }
      this.debugOctreeHelper = null;
    }
    
    // Toggle visibility of collision mesh for debugging
    if (this.collisionMesh) {
      this.collisionMesh.visible = this.debugMode;
    }
    
    console.log(`Debug mode: ${this.debugMode ? 'enabled' : 'disabled'}`);
  }

  public updateDebugVisualizers(carPosition: THREE.Vector3): void {
    if (!this.debugMode) return;
    
    // Update ray helper position to match car
    if (this.debugRayHelper) {
      const rayStart = carPosition.clone().add(new THREE.Vector3(0, 10, 0));
      this.debugRayHelper.position.copy(rayStart);
    }
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
      console.log("Loading terrain models...");
      
      // Load the terrain graphic model
      const terrainModel = await assetManager.loadModel(ModelId.LEVEL_GRAPHIC);
      
      if (terrainModel) {
        console.log("Successfully loaded terrain graphic model");
        this.terrain = terrainModel;
        
        // Process the terrain model
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
              console.log("Found spawn point at", child.position);
              this.spawnPoint = child.position.clone();
              // Make the spawn point invisible
              child.visible = false;
            }
          }
        });
        
        // Add terrain to scene
        this.scene.add(this.terrain);
      } else {
        console.warn("Could not load terrain graphic model, using fallback");
        
        // Create a simple ground plane as fallback
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({
          color: 0x44aa44,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
      }
    } catch (error) {
      console.error("Error loading terrain:", error);
      
      // Fallback to a simple ground plane if an error occurs
      const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x44aa44,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);
    }
  }

  private async setupCollision(): Promise<void> {
    try {
      console.log("Setting up collision...");
      
      // Load the collision model
      const collisionModel = await assetManager.loadModel(ModelId.LEVEL_COLLISION);
      
      if (collisionModel && this.octree) {
        console.log("Successfully loaded collision model");
        this.collisionMesh = collisionModel;
        
        // Hide collision mesh but keep it in the scene for debugging if needed
        this.collisionMesh.visible = false;
        this.scene.add(this.collisionMesh);
        
        // CRITICAL: Don't modify the position of the collision mesh at all
        // It should be pre-aligned with the visual terrain in the modeling software
        
        // Create the octree from the collision mesh
        console.log("Building octree from collision mesh...");
        
        // Process all meshes in the collision model
        this.collisionMesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            // Use the world matrix to get the correct position/rotation/scale
            child.updateMatrixWorld(true);
            
            // Get the mesh geometry with transformations applied
            const positionAttribute = child.geometry.getAttribute('position');
            
            // Process the geometry in smaller chunks to avoid overloading the browser
            const countPerChunk = 300; // Process this many triangles at a time
            
            const worldMatrix = child.matrixWorld;
            const totalCount = Math.floor(positionAttribute.count / 3) * 3; // Ensure we have complete triangles
            
            console.log(`Processing ${totalCount / 3} triangles for octree...`);
            
            // Process triangles in chunks to avoid browser freezing
            for (let i = 0; i < totalCount; i += countPerChunk * 3) {
              const endIdx = Math.min(i + countPerChunk * 3, totalCount);
              
              for (let j = i; j < endIdx; j += 3) {
                try {
                  // Create triangles for the octree
                  const vertex1 = new THREE.Vector3()
                    .fromBufferAttribute(positionAttribute, j)
                    .applyMatrix4(worldMatrix);
                  
                  const vertex2 = new THREE.Vector3()
                    .fromBufferAttribute(positionAttribute, j + 1)
                    .applyMatrix4(worldMatrix);
                  
                  const vertex3 = new THREE.Vector3()
                    .fromBufferAttribute(positionAttribute, j + 2)
                    .applyMatrix4(worldMatrix);
                  
                  // Add triangle to octree - CRITICAL to use the original coordinates without Y-axis adjustments
                  this.octree?.addTriangle(vertex1, vertex2, vertex3);
                } catch (e) {
                  console.warn(`Error processing triangle ${j/3}:`, e);
                }
              }
            }
          }
        });
        
        console.log("Collision setup complete");
      } else {
        console.warn("Could not load collision model or octree not initialized");
      }
    } catch (error) {
      console.error("Error setting up collision:", error);
    }
  }

  public getSpawnPoint(): THREE.Vector3 {
    return this.spawnPoint.clone();
  }

  public getCollisionOctree(): Octree | null {
    return this.octree;
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

    // Remove debug visualizers
    if (this.debugRayHelper) {
      if (this.debugRayHelper.parent) {
        this.debugRayHelper.parent.remove(this.debugRayHelper);
      }
      this.debugRayHelper = null;
    }

    if (this.debugOctreeHelper) {
      if (this.debugOctreeHelper.parent) {
        this.debugOctreeHelper.parent.remove(this.debugOctreeHelper);
      }
      this.debugOctreeHelper = null;
    }

    // Clear octree
    this.octree = null;
  }
}
