// app/apps/drifting/types/game.ts

export type GameStatus = "menu" | "loading" | "playing" | "paused" | "gameOver";

export interface GameState {
  status: GameStatus;
  loading: boolean;
  speed: number;
  lapTime: number;
  bestLapTime: number;
  driftScore: number;
}

export interface GameStats {
  speed: number;
  lapTime: number;
  bestLapTime: number;
  driftScore: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export interface CarConfig {
  maxSpeed: number;
  acceleration: number;
  handling: number;
  driftability: number;
  braking: number;
  mass: number;
}

export interface TrackConfig {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  length: number;
  checkpoints: number;
}

export interface ControlsState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
}

export interface PlayerProgress {
  bestLaps: Record<string, number>; // track name -> best lap time
  highScores: Record<string, number>; // track name -> best score
  unlockedCars: string[];
  unlockedTracks: string[];
}

export interface LoadingStatus {
  assetsLoaded: number;
  totalAssets: number;
  progress: number;
  message: string;
}

export interface GraphicsSettings {
  quality: "low" | "medium" | "high";
  shadows: boolean;
  particles: boolean;
  postProcessing: boolean;
}
