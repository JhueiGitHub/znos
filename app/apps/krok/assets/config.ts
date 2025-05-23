// assets/config.ts
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

// Asset path prefix
const ASSET_PATH = "/assets/krok";

// Texture IDs
export enum TextureId {
  SKYBOX_LEFT = "SKYBOX_LEFT",
  SKYBOX_RIGHT = "SKYBOX_RIGHT",
  SKYBOX_UP = "SKYBOX_UP",
  SKYBOX_DOWN = "SKYBOX_DOWN",
  SKYBOX_FRONT = "SKYBOX_FRONT",
  SKYBOX_BACK = "SKYBOX_BACK",
  SMOKE = "SMOKE",
  CAR_YELLOW = "CAR_YELLOW",
  CAR_RED = "CAR_RED",
  CAR_LIGHT_BLUE = "CAR_LIGHT_BLUE",
  CAR_BLUE = "CAR_BLUE",
  CAR_GRAY = "CAR_GRAY",
  // 🌲 Fristy Tree Textures
  TREE_ALBEDO = "TREE_ALBEDO",
  TREE_NORMAL = "TREE_NORMAL",
  TREE_OCCLUSION = "TREE_OCCLUSION",
}

// Model IDs
export enum ModelId {
  CAR = "CAR",
  // 🌲 Fristy Stylize Trees
  TREE_3_1 = "TREE_3_1",
  TREE_3_2 = "TREE_3_2",
  TREE_3_3 = "TREE_3_3",
  TREE_3_4 = "TREE_3_4",
}

// Texture definitions
const textures = [
  { id: TextureId.SKYBOX_LEFT, url: `${ASSET_PATH}/textures/skybox/left.webp` },
  {
    id: TextureId.SKYBOX_RIGHT,
    url: `${ASSET_PATH}/textures/skybox/right.webp`,
  },
  { id: TextureId.SKYBOX_UP, url: `${ASSET_PATH}/textures/skybox/up.webp` },
  { id: TextureId.SKYBOX_DOWN, url: `${ASSET_PATH}/textures/skybox/down.webp` },
  {
    id: TextureId.SKYBOX_FRONT,
    url: `${ASSET_PATH}/textures/skybox/front.webp`,
  },
  { id: TextureId.SKYBOX_BACK, url: `${ASSET_PATH}/textures/skybox/back.webp` },
  { id: TextureId.SMOKE, url: `${ASSET_PATH}/textures/effects/smoke.webp` },
  {
    id: TextureId.CAR_YELLOW,
    url: `${ASSET_PATH}/textures/arcade-racing-car-tex-yellow.png`,
  },
  {
    id: TextureId.CAR_RED,
    url: `${ASSET_PATH}/textures/arcade-racing-car-tex-red.png`,
  },
  {
    id: TextureId.CAR_LIGHT_BLUE,
    url: `${ASSET_PATH}/textures/arcade-racing-car-tex-light-blue.png`,
  },
  {
    id: TextureId.CAR_BLUE,
    url: `${ASSET_PATH}/textures/arcade-racing-car-tex-blue.png`,
  },
  {
    id: TextureId.CAR_GRAY,
    url: `${ASSET_PATH}/textures/arcade-racing-car-tex-gray.png`,
  },
  // 🌲 Fristy Tree Textures
  {
    id: TextureId.TREE_ALBEDO,
    url: `${ASSET_PATH}/textures/trees/4_Trees_Albedo_.png`,
  },
  {
    id: TextureId.TREE_NORMAL,
    url: `${ASSET_PATH}/textures/trees/4_tree_normals.png`,
  },
  {
    id: TextureId.TREE_OCCLUSION,
    url: `${ASSET_PATH}/textures/trees/4_tree_occlusion.png`,
  },
];

// Model definitions
const models = [
  {
    id: ModelId.CAR,
    url: `${ASSET_PATH}/models/vehicles/arcade-racing-car.fbx`,
  },
  // 🌲 Fristy Stylize Trees
  {
    id: ModelId.TREE_3_1,
    url: `${ASSET_PATH}/models/trees/Tree_3_1.fbx`,
  },
  {
    id: ModelId.TREE_3_2,
    url: `${ASSET_PATH}/models/trees/Tree_3_2.fbx`,
  },
  {
    id: ModelId.TREE_3_3,
    url: `${ASSET_PATH}/models/trees/Tree_3_3.fbx`,
  },
  {
    id: ModelId.TREE_3_4,
    url: `${ASSET_PATH}/models/trees/Tree_3_4.fbx`,
  },
];

// Load textures
async function loadTextures(): Promise<Record<string, THREE.Texture>> {
  const textureLoader = new THREE.TextureLoader();
  const loadedTextures: Record<string, THREE.Texture> = {};

  // Load skybox textures
  const skyboxTextures: Record<string, string> = {
    left: textures.find((t) => t.id === TextureId.SKYBOX_LEFT)?.url || "",
    right: textures.find((t) => t.id === TextureId.SKYBOX_RIGHT)?.url || "",
    up: textures.find((t) => t.id === TextureId.SKYBOX_UP)?.url || "",
    down: textures.find((t) => t.id === TextureId.SKYBOX_DOWN)?.url || "",
    front: textures.find((t) => t.id === TextureId.SKYBOX_FRONT)?.url || "",
    back: textures.find((t) => t.id === TextureId.SKYBOX_BACK)?.url || "",
  };

  // Load car textures
  for (const texture of textures.filter((t) => t.id.includes("CAR_"))) {
    loadedTextures[texture.id] = await new Promise((resolve) => {
      textureLoader.load(texture.url, (tex) => resolve(tex));
    });
  }

  // Load smoke texture
  loadedTextures[TextureId.SMOKE] = await new Promise((resolve) => {
    textureLoader.load(
      textures.find((t) => t.id === TextureId.SMOKE)?.url || "",
      (tex) => resolve(tex)
    );
  });

  // 🌲 Load tree textures
  const treeTextureIds = [TextureId.TREE_ALBEDO, TextureId.TREE_NORMAL, TextureId.TREE_OCCLUSION];
  for (const textureId of treeTextureIds) {
    try {
      loadedTextures[textureId] = await new Promise((resolve, reject) => {
        textureLoader.load(
          textures.find((t) => t.id === textureId)?.url || "",
          (tex) => resolve(tex),
          undefined,
          (error) => {
            console.warn(`Failed to load tree texture ${textureId}:`, error);
            resolve(new THREE.Texture()); // Fallback to empty texture
          }
        );
      });
    } catch (error) {
      console.warn(`Error loading tree texture ${textureId}:`, error);
      loadedTextures[textureId] = new THREE.Texture();
    }
  }

  return {
    car: {
      yellow: loadedTextures[TextureId.CAR_YELLOW],
      red: loadedTextures[TextureId.CAR_RED],
      lightBlue: loadedTextures[TextureId.CAR_LIGHT_BLUE],
      blue: loadedTextures[TextureId.CAR_BLUE],
      gray: loadedTextures[TextureId.CAR_GRAY],
    },
    smoke: loadedTextures[TextureId.SMOKE],
    skybox: skyboxTextures,
    // 🌲 Tree textures
    trees: {
      albedo: loadedTextures[TextureId.TREE_ALBEDO],
      normal: loadedTextures[TextureId.TREE_NORMAL],
      occlusion: loadedTextures[TextureId.TREE_OCCLUSION],
    },
  };
}

// 🌲 Tree model loader
export async function loadTreeModels(): Promise<Record<string, THREE.Group>> {
  const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader");
  const loader = new FBXLoader();
  const treeModels: Record<string, THREE.Group> = {};

  const treeModelIds = [ModelId.TREE_3_1, ModelId.TREE_3_2, ModelId.TREE_3_3, ModelId.TREE_3_4];
  
  for (const modelId of treeModelIds) {
    try {
      const modelConfig = models.find(m => m.id === modelId);
      if (modelConfig) {
        const model = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            modelConfig.url,
            (result) => resolve(result),
            undefined,
            (error) => reject(error)
          );
        });
        treeModels[modelId] = model;
        console.log(`🌲 Loaded tree model: ${modelId}`);
      }
    } catch (error) {
      console.warn(`Failed to load tree model ${modelId}:`, error);
    }
  }

  return treeModels;
}

// Main asset loading function
export async function loadAssets(): Promise<Record<string, any>> {
  const textures = await loadTextures();

  return {
    textures,
    // We'll load models directly in the Car class for simplicity
  };
}
