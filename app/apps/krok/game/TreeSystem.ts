// game/TreeSystem.ts
// Simple tree system for adding Fristy Stylize trees to existing flat terrain

import * as THREE from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { loadTreeModels, TextureId, ModelId } from "../assets/config";

export interface TreeSystemConfig {
  treeCount: number;
  terrainSize: number;
  minScale: number;
  maxScale: number;
  exclusionRadius: number; // Radius around spawn point to avoid trees
  spawnPoint: THREE.Vector3;
}

export class TreeSystem {
  private scene: THREE.Scene;
  private assets: Record<string, any>;
  private treeInstances: THREE.InstancedMesh[] = [];
  private treeModels: Record<string, THREE.Group> = {};
  private isInitialized = false;

  // Default configuration
  private config: TreeSystemConfig = {
    treeCount: 150,
    terrainSize: 500, // Half the size of your 1000x1000 ground plane
    minScale: 0.8,
    maxScale: 1.4,
    exclusionRadius: 50, // No trees within 50 units of spawn
    spawnPoint: new THREE.Vector3(0, 0, 0),
  };

  constructor(scene: THREE.Scene, assets: Record<string, any>) {
    this.scene = scene;
    this.assets = assets;
  }

  /**
   * Initialize the tree system with Fristy Stylize trees
   */
  public async initialize(config?: Partial<TreeSystemConfig>): Promise<void> {
    // Merge custom config with defaults
    this.config = { ...this.config, ...config };

    console.log("🌲 Initializing Fristy Tree System...");

    try {
      // Load tree models
      this.treeModels = await loadTreeModels();
      
      if (Object.keys(this.treeModels).length === 0) {
        console.warn("⚠️ No tree models loaded, creating simple placeholder trees");
        this.createPlaceholderTrees();
        return;
      }

      // Create instanced tree meshes for performance
      this.createInstancedTrees();

      this.isInitialized = true;
      console.log(`✅ Tree system initialized with ${this.config.treeCount} trees`);

    } catch (error) {
      console.error("❌ Failed to initialize tree system:", error);
      this.createPlaceholderTrees();
    }
  }

  /**
   * Create instanced meshes from Fristy tree models
   */
  private createInstancedTrees(): void {
    const treeModelKeys = Object.keys(this.treeModels);
    const treesPerVariant = Math.ceil(this.config.treeCount / treeModelKeys.length);

    treeModelKeys.forEach((modelId, variantIndex) => {
      const treeModel = this.treeModels[modelId];
      
      // Extract geometry and material from the tree model
      const { geometry, material } = this.extractTreeGeometryAndMaterial(treeModel);
      
      if (geometry && material) {
        // Apply Fristy tree textures if available
        this.applyFristyTextures(material);

        // Create instanced mesh
        const instancedMesh = new THREE.InstancedMesh(
          geometry,
          material,
          treesPerVariant
        );

        // Position trees randomly on the flat terrain
        this.positionTreeInstances(instancedMesh, treesPerVariant, variantIndex);

        // Enable shadows
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        // Add to scene
        this.scene.add(instancedMesh);
        this.treeInstances.push(instancedMesh);

        console.log(`🌳 Created ${treesPerVariant} instances of ${modelId}`);
      }
    });
  }

  /**
   * Extract geometry and material from tree model
   */
  private extractTreeGeometryAndMaterial(treeModel: THREE.Group): {
    geometry: THREE.BufferGeometry | null;
    material: THREE.Material | null;
  } {
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.Material | null = null;

    treeModel.traverse((child) => {
      if (child instanceof THREE.Mesh && !geometry) {
        geometry = child.geometry.clone();
        material = child.material instanceof THREE.Material 
          ? child.material.clone() 
          : new THREE.MeshStandardMaterial({ color: 0x228B22 });
      }
    });

    return { geometry, material };
  }

  /**
   * Apply Fristy Stylize textures to tree material
   */
  private applyFristyTextures(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial && this.assets.textures?.trees) {
      const treeTextures = this.assets.textures.trees;

      // Apply albedo (diffuse) texture
      if (treeTextures.albedo && treeTextures.albedo.image) {
        material.map = treeTextures.albedo;
      }

      // Apply normal map
      if (treeTextures.normal && treeTextures.normal.image) {
        material.normalMap = treeTextures.normal;
      }

      // Apply ambient occlusion
      if (treeTextures.occlusion && treeTextures.occlusion.image) {
        material.aoMap = treeTextures.occlusion;
        material.aoMapIntensity = 0.8;
      }

      // Enhance material properties for better visuals
      material.roughness = 0.8;
      material.metalness = 0.1;
      material.needsUpdate = true;

      console.log("🎨 Applied Fristy textures to tree material");
    }
  }

  /**
   * Position tree instances randomly across the terrain
   */
  private positionTreeInstances(
    instancedMesh: THREE.InstancedMesh,
    count: number,
    variantIndex: number
  ): void {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const scale = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // Generate random position on flat terrain
      do {
        position.set(
          (Math.random() - 0.5) * this.config.terrainSize * 2,
          0, // Trees sit on the flat ground (Y = 0)
          (Math.random() - 0.5) * this.config.terrainSize * 2
        );
      } while (
        // Ensure trees don't spawn too close to the spawn point
        position.distanceTo(this.config.spawnPoint) < this.config.exclusionRadius
      );

      // Random rotation (only Y-axis for natural variety)
      rotation.set(0, Math.random() * Math.PI * 2, 0);

      // Random scale for size variety
      const randomScale = this.config.minScale + 
        Math.random() * (this.config.maxScale - this.config.minScale);
      scale.set(randomScale, randomScale, randomScale);

      // Apply transformation matrix
      matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
      instancedMesh.setMatrixAt(i, matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Create simple placeholder trees if Fristy models fail to load
   */
  private createPlaceholderTrees(): void {
    console.log("🌲 Creating placeholder trees...");

    const geometry = this.createPlaceholderTreeGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.8,
      metalness: 0.1,
    });

    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      Math.min(this.config.treeCount, 50) // Limit placeholder trees
    );

    this.positionTreeInstances(instancedMesh, instancedMesh.count, 0);

    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    this.scene.add(instancedMesh);
    this.treeInstances.push(instancedMesh);

    this.isInitialized = true;
    console.log("✅ Placeholder tree system ready");
  }

  /**
   * Create simple tree geometry for placeholders
   */
  private createPlaceholderTreeGeometry(): THREE.BufferGeometry {
    const group = new THREE.Group();

    // Tree trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 4),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    trunk.position.y = 2;
    group.add(trunk);

    // Tree leaves (simple sphere)
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(3, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x228B22 })
    );
    leaves.position.y = 5;
    group.add(leaves);

    // Merge geometries for performance
    return BufferGeometryUtils.mergeGeometries([
      trunk.geometry.clone().translate(0, 2, 0),
      leaves.geometry.clone().translate(0, 5, 0),
    ]) || new THREE.SphereGeometry(1);
  }

  /**
   * Update tree system (for LOD, culling, etc.)
   */
  public update(deltaTime: number, cameraPosition: THREE.Vector3): void {
    if (!this.isInitialized) return;

    // Implement distance-based culling for performance
    const maxRenderDistance = 200;

    this.treeInstances.forEach((instancedMesh) => {
      const distance = instancedMesh.position.distanceTo(cameraPosition);
      instancedMesh.visible = distance < maxRenderDistance;
    });
  }

  /**
   * Get tree count for UI display
   */
  public getTreeCount(): number {
    return this.treeInstances.reduce((total, mesh) => total + mesh.count, 0);
  }

  /**
   * Toggle tree visibility for debugging
   */
  public toggleVisibility(): void {
    this.treeInstances.forEach((instancedMesh) => {
      instancedMesh.visible = !instancedMesh.visible;
    });
  }

  /**
   * Dispose of tree system resources
   */
  public dispose(): void {
    this.treeInstances.forEach((instancedMesh) => {
      this.scene.remove(instancedMesh);

      // Dispose geometry
      instancedMesh.geometry.dispose();

      // Dispose material
      if (instancedMesh.material) {
        if (Array.isArray(instancedMesh.material)) {
          instancedMesh.material.forEach((mat) => mat.dispose());
        } else {
          instancedMesh.material.dispose();
        }
      }
    });

    this.treeInstances = [];
    this.treeModels = {};
    this.isInitialized = false;

    console.log("🗑️ Tree system disposed");
  }
}
