// assets/config.ts
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

// Asset path prefix
const ASSET_PATH = "/assets/krok";

// Texture IDs
export enum TextureId {
  // Skybox
  SKYBOX_LEFT = "SKYBOX_LEFT",
  SKYBOX_RIGHT = "SKYBOX_RIGHT",
  SKYBOX_UP = "SKYBOX_UP",
  SKYBOX_DOWN = "SKYBOX_DOWN",
  SKYBOX_FRONT = "SKYBOX_FRONT",
  SKYBOX_BACK = "SKYBOX_BACK",
  
  // Effects
  SMOKE = "SMOKE",
  
  // Car textures
  CAR_YELLOW = "CAR_YELLOW",
  CAR_RED = "CAR_RED",
  CAR_LIGHT_BLUE = "CAR_LIGHT_BLUE",
  CAR_BLUE = "CAR_BLUE",
  CAR_GRAY = "CAR_GRAY",
}

// Model IDs
export enum ModelId {
  CAR = "CAR",
  LEVEL_GRAPHIC = "LEVEL_GRAPHIC",
  LEVEL_COLLISION = "LEVEL_COLLISION",
}

// Audio IDs
export enum AudioId {
  GAME_BACKGROUND = "GAME_BACKGROUND",
}

// Texture definitions
const textures = [
  // Skybox
  { id: TextureId.SKYBOX_LEFT, url: `${ASSET_PATH}/textures/skybox/left.webp` },
  { id: TextureId.SKYBOX_RIGHT, url: `${ASSET_PATH}/textures/skybox/right.webp` },
  { id: TextureId.SKYBOX_UP, url: `${ASSET_PATH}/textures/skybox/up.webp` },
  { id: TextureId.SKYBOX_DOWN, url: `${ASSET_PATH}/textures/skybox/down.webp` },
  { id: TextureId.SKYBOX_FRONT, url: `${ASSET_PATH}/textures/skybox/front.webp` },
  { id: TextureId.SKYBOX_BACK, url: `${ASSET_PATH}/textures/skybox/back.webp` },
  
  // Effects
  { id: TextureId.SMOKE, url: `${ASSET_PATH}/textures/effects/smoke.webp` },
  
  // Car textures
  { id: TextureId.CAR_YELLOW, url: `${ASSET_PATH}/textures/arcade-racing-car-tex-yellow.png` },
  { id: TextureId.CAR_RED, url: `${ASSET_PATH}/textures/arcade-racing-car-tex-red.png` },
  { id: TextureId.CAR_LIGHT_BLUE, url: `${ASSET_PATH}/textures/arcade-racing-car-tex-light-blue.png` },
  { id: TextureId.CAR_BLUE, url: `${ASSET_PATH}/textures/arcade-racing-car-tex-blue.png` },
  { id: TextureId.CAR_GRAY, url: `${ASSET_PATH}/textures/arcade-racing-car-tex-gray.png` },
];

// Model definitions
const models = [
  { id: ModelId.CAR, url: `${ASSET_PATH}/models/vehicles/arcade-racing-car.fbx`, type: "fbx" },
  { id: ModelId.LEVEL_GRAPHIC, url: `${ASSET_PATH}/models/world/drift-graphic.glb`, type: "gltf" },
  { id: ModelId.LEVEL_COLLISION, url: `${ASSET_PATH}/models/world/drift-collision.glb`, type: "gltf" },
];

// Audio definitions
const audio = [
  { id: AudioId.GAME_BACKGROUND, url: `${ASSET_PATH}/audio/music/game-theme.ogg` },
];

// Asset manager class
class AssetManager {
  private textureLoader: THREE.TextureLoader;
  private fbxLoader: FBXLoader;
  private gltfLoader: GLTFLoader;
  private audioLoader: THREE.AudioLoader;
  private loadedTextures: Map<string, THREE.Texture>;
  private loadedModels: Map<string, THREE.Group>;
  private loadedAudio: Map<string, AudioBuffer>;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.fbxLoader = new FBXLoader();
    this.gltfLoader = new GLTFLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.loadedTextures = new Map();
    this.loadedModels = new Map();
    this.loadedAudio = new Map();
  }

  async loadTexture(id: string, url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.loadedTextures.set(id, texture);
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  async loadFBX(id: string, url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        url,
        (model) => {
          this.loadedModels.set(id, model);
          resolve(model);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  async loadGLTF(id: string, url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.loadedModels.set(id, gltf.scene);
          resolve(gltf.scene);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  async loadAudioBuffer(id: string, url: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          this.loadedAudio.set(id, buffer);
          resolve(buffer);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  getTexture(id: string): THREE.Texture | undefined {
    return this.loadedTextures.get(id);
  }

  getModel(id: string): THREE.Group | undefined {
    return this.loadedModels.get(id);
  }

  getAudio(id: string): AudioBuffer | undefined {
    return this.loadedAudio.get(id);
  }

  // Load all textures, models, and audio
  async loadAll(
    onProgress?: (progress: number, total: number) => void
  ): Promise<void> {
    const totalAssets = textures.length + models.length + audio.length;
    let loadedAssets = 0;

    // Load textures
    const texturePromises = textures.map(async (texture) => {
      try {
        await this.loadTexture(texture.id, texture.url);
        loadedAssets++;
        if (onProgress) onProgress(loadedAssets, totalAssets);
      } catch (error) {
        console.error(`Failed to load texture: ${texture.url}`, error);
      }
    });

    // Load models
    const modelPromises = models.map(async (model) => {
      try {
        if (model.type === "fbx") {
          await this.loadFBX(model.id, model.url);
        } else if (model.type === "gltf") {
          await this.loadGLTF(model.id, model.url);
        }
        loadedAssets++;
        if (onProgress) onProgress(loadedAssets, totalAssets);
      } catch (error) {
        console.error(`Failed to load model: ${model.url}`, error);
      }
    });

    // Load audio
    const audioPromises = audio.map(async (audioItem) => {
      try {
        await this.loadAudioBuffer(audioItem.id, audioItem.url);
        loadedAssets++;
        if (onProgress) onProgress(loadedAssets, totalAssets);
      } catch (error) {
        console.error(`Failed to load audio: ${audioItem.url}`, error);
      }
    });

    // Wait for all assets to load
    await Promise.all([
      ...texturePromises,
      ...modelPromises,
      ...audioPromises,
    ]);
  }

  // Create a skybox from the loaded textures
  createSkybox(): THREE.CubeTexture {
    const urls = [
      this.getTexture(TextureId.SKYBOX_RIGHT)?.image.src,
      this.getTexture(TextureId.SKYBOX_LEFT)?.image.src,
      this.getTexture(TextureId.SKYBOX_UP)?.image.src,
      this.getTexture(TextureId.SKYBOX_DOWN)?.image.src,
      this.getTexture(TextureId.SKYBOX_FRONT)?.image.src,
      this.getTexture(TextureId.SKYBOX_BACK)?.image.src,
    ];

    // Create a new cube texture loader
    const loader = new THREE.CubeTextureLoader();
    return loader.load(urls as string[]);
  }
}

// Export a singleton instance of the asset manager
export const assetManager = new AssetManager();

// Main asset loading function
export async function loadAssets(
  onProgress?: (progress: number, total: number) => void
): Promise<void> {
  await assetManager.loadAll(onProgress);
}
