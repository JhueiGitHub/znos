// /app/components/arcade/index.ts
// SHARED ARCADE SYSTEM EXPORTS

export { UniversalGameEngine } from './GameEngine';
export type { GameConfiguration } from './GameEngine';

export { UniversalAssetManager } from './AssetManager';
export type { AssetDefinition, AssetPack } from './AssetManager';

export { useGameEngine } from './useGameEngine';

// Re-export common ThreeJS types for convenience
export type { 
  Scene,
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  Group,
  Vector3,
  Quaternion
} from 'three';
