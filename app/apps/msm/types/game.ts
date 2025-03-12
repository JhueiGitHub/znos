// Element types that determine monster characteristics
export type ElementType =
  | "plant"
  | "air"
  | "water"
  | "earth"
  | "fire"
  | "crystal"
  | "shadow"
  | "magical"
  | "ethereal"
  | "cold";

// Monster sound characteristics
export interface SoundProfile {
  instrument: string; // The instrument sound (piano, drums, etc)
  notes: string[]; // Musical notes this monster can play
  rhythm: number[]; // Rhythm pattern (when to play in the measure)
  volume: number; // Base volume level (0-1)
  effects?: string[]; // Special audio effects
}

// Resource costs or rewards
export interface Resources {
  coins: number;
  diamonds?: number;
  food?: number;
  starpower?: number;
}

// Core monster data
export interface Monster {
  id: string;
  name: string;
  elements: ElementType[];
  description: string;
  imageUrl: string;
  soundProfile: SoundProfile;
  cost: Resources;
  coinRate: number; // How many coins per minute
  maxCoins: number; // Maximum coins that can be accumulated
  breedingChance?: number; // Chance of successful breeding (0-1)
  rarity: 1 | 2 | 3 | 4 | 5; // 1 = common, 5 = legendary
  unlocked: boolean;
  initiallyUnlocked: boolean;
}

// Island where monsters can be placed
export interface Island {
  id: string;
  name: string;
  description: string;
  elements: ElementType[]; // Elements supported on this island
  imageUrl: string;
  backgroundMusic?: string; // Optional background music
  cost: Resources;
  maxMonsters: number; // Maximum monsters that can be placed
  unlocked: boolean;
  initiallyUnlocked: boolean;
  environment?: {
    weather?: string; // Different weather effects
    timeOfDay?: string; // Day/night cycle
    specialEffects?: string[]; // Visual effects
  };
}

// Player's resources
export interface PlayerResources {
  coins: number;
  diamonds: number;
  food: number;
  starpower: number;
}

// A monster placed on an island
export interface MonsterPlacement {
  id: string;
  monsterId: string;
  islandId: string;
  position: {
    x: number;
    y: number;
  };
  level: number;
  lastCollection: number; // Timestamp of last coin collection
}

// Monsters that are currently breeding
export interface BreedingPair {
  monster1Id: string;
  monster2Id: string;
}

// Full game state that gets saved
export interface GameState {
  unlockedMonsters: string[];
  unlockedIslands: string[];
  monsterPlacements: MonsterPlacement[];
  resources: PlayerResources;
}
