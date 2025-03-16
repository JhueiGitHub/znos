// app/apps/pacman/types.ts

export interface PacmanGameState {
  isPlaying: boolean;
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
}

export interface TextureAsset {
  id: string;
  url: string;
}

export interface SoundAsset {
  id: string;
  url: string;
}

export interface PacmanAssets {
  textures: TextureAsset[];
  sounds: SoundAsset[];
}

// Map related types
export interface MapPosition {
  x: number;
  y: number;
}

export interface MapCell {
  type: "wall" | "dot" | "pellet" | "empty" | "spawn";
  isWall?: boolean;
  isDot?: boolean;
  isPowerPellet?: boolean;
  isSpawn?: boolean;
  spawnType?: "pacman" | "ghost";
}

export interface GameMap {
  width: number;
  height: number;
  cells: MapCell[][];
  pacmanSpawn: MapPosition;
  ghostSpawn: MapPosition;
  numDots: number;
}
