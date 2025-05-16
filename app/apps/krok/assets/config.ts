// assets/config.ts
import * as THREE from "three";

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
}

// Model IDs
export enum ModelId {
  CAR = "CAR",
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
];

// Model definitions
const models = [
  {
    id: ModelId.CAR,
    url: `${ASSET_PATH}/models/vehicles/arcade-racing-car.fbx`,
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
  };
}

// Main asset loading function
export async function loadAssets(): Promise<Record<string, any>> {
  // For now, just load textures
  const textures = await loadTextures();

  return {
    textures,
    // We'll load models directly in the Car class for simplicity
  };
}
