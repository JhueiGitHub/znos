"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Monster,
  Island,
  PlayerResources,
  MonsterPlacement,
  GameState,
  ElementType,
  BreedingPair,
} from "../types/game";
import { initialMonsters, initialIslands } from "../data/gameData";
import {
  generateMonsterSound,
  combineMonsterSounds,
} from "../utils/audioEngine";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "sonner";

interface MSMContextType {
  // Game state
  monsters: Monster[];
  islands: Island[];
  currentIslandId: string;
  resources: PlayerResources;
  monsterPlacements: MonsterPlacement[];
  breedingMonsters: BreedingPair | null;
  breedingTimeLeft: number | null;
  isPlaying: boolean;

  // Actions
  setCurrentIsland: (islandId: string) => void;
  purchaseMonster: (monsterId: string) => void;
  placeMonster: (monsterId: string, position: { x: number; y: number }) => void;
  moveMonster: (
    placementId: string,
    position: { x: number; y: number }
  ) => void;
  removeMonster: (placementId: string) => void;
  startBreeding: (monster1Id: string, monster2Id: string) => void;
  collectCoins: (placementId: string) => void;
  feedMonster: (placementId: string, amount: number) => void;
  buyIsland: (islandId: string) => void;
  togglePlay: () => void;
  resetGame: () => void;

  // Audio control
  playMonsterSound: (monsterId: string) => void;
  stopMonsterSound: (monsterId: string) => void;
  setVolume: (volume: number) => void;
  volume: number;
}

// Create the context
const MSMContext = createContext<MSMContextType | undefined>(undefined);

// Define the provider component
export const MSMProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Persistent game state
  const [gameState, setGameState] = useLocalStorage<GameState>(
    "msm-game-state",
    {
      unlockedMonsters: initialMonsters
        .filter((m) => m.initiallyUnlocked)
        .map((m) => m.id),
      unlockedIslands: initialIslands
        .filter((i) => i.initiallyUnlocked)
        .map((i) => i.id),
      monsterPlacements: [],
      resources: {
        coins: 1000,
        diamonds: 10,
        food: 50,
        starpower: 0,
      },
    }
  );

  // UI state (not persisted)
  const [currentIslandId, setCurrentIslandId] = useState<string>(
    initialIslands[0].id
  );
  const [monsters, setMonsters] = useState<Monster[]>(initialMonsters);
  const [islands, setIslands] = useState<Island[]>(initialIslands);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [breedingMonsters, setBreedingMonsters] = useState<BreedingPair | null>(
    null
  );
  const [breedingTimeLeft, setBreedingTimeLeft] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(0.7);

  // Audio references
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize from saved state
  useEffect(() => {
    // Update monsters with unlocked status
    setMonsters((prev) =>
      prev.map((monster) => ({
        ...monster,
        unlocked: gameState.unlockedMonsters.includes(monster.id),
      }))
    );

    // Update islands with unlocked status
    setIslands((prev) =>
      prev.map((island) => ({
        ...island,
        unlocked: gameState.unlockedIslands.includes(island.id),
      }))
    );
  }, [gameState]);

  // Breeding timer
  useEffect(() => {
    if (breedingMonsters && breedingTimeLeft) {
      const timer = setInterval(() => {
        setBreedingTimeLeft((prev) => {
          if (prev && prev > 0) {
            return prev - 1;
          } else {
            // Breeding complete
            clearInterval(timer);
            completeBreeding();
            return null;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [breedingMonsters, breedingTimeLeft]);

  // Music engine - coordinate monster sounds
  useEffect(() => {
    if (isPlaying) {
      // Start all monster sounds on the current island
      const currentIslandPlacements = gameState.monsterPlacements.filter(
        (p) => p.islandId === currentIslandId
      );

      currentIslandPlacements.forEach((placement) => {
        const monster = monsters.find((m) => m.id === placement.monsterId);
        if (monster) {
          playMonsterSound(monster.id);
        }
      });

      // Combine all sounds rhythmically
      combineMonsterSounds(audioRefs.current, volume);
    } else {
      // Stop all sounds
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    }

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [
    isPlaying,
    currentIslandId,
    gameState.monsterPlacements,
    monsters,
    volume,
  ]);

  // Complete breeding and create new monster
  const completeBreeding = useCallback(() => {
    if (!breedingMonsters) return;

    const { monster1Id, monster2Id } = breedingMonsters;
    const monster1 = monsters.find((m) => m.id === monster1Id);
    const monster2 = monsters.find((m) => m.id === monster2Id);

    if (!monster1 || !monster2) return;

    // Find possible offspring based on the combination of elements
    const possibleOffspring = monsters.filter((m) => {
      // For simplicity, we'll say a monster can be bred if it contains only elements
      // that are present in either parent
      const parentElements = [...monster1.elements, ...monster2.elements];
      return (
        m.elements.every((element) => parentElements.includes(element)) &&
        !gameState.unlockedMonsters.includes(m.id)
      );
    });

    if (possibleOffspring.length > 0) {
      // Select a random monster from possible offspring
      const newMonster =
        possibleOffspring[Math.floor(Math.random() * possibleOffspring.length)];

      // Unlock the new monster
      setGameState((prev) => ({
        ...prev,
        unlockedMonsters: [...prev.unlockedMonsters, newMonster.id],
      }));

      toast.success(`You bred a new ${newMonster.name}!`, {
        className: "msm-toast",
      });
    } else {
      toast.error("Breeding failed! Try a different combination.", {
        className: "msm-toast",
      });
    }

    setBreedingMonsters(null);
  }, [breedingMonsters, monsters, gameState.unlockedMonsters, setGameState]);

  // Play a single monster's sound
  const playMonsterSound = useCallback(
    (monsterId: string) => {
      const monster = monsters.find((m) => m.id === monsterId);
      if (!monster) return;

      if (!audioRefs.current[monsterId]) {
        // Create new audio element if it doesn't exist
        audioRefs.current[monsterId] = generateMonsterSound(monster);
      }

      const audio = audioRefs.current[monsterId];
      audio.volume = volume;
      audio.loop = true;
      audio.play().catch((err) => console.error("Error playing audio:", err));
    },
    [monsters, volume]
  );

  // Stop a single monster's sound
  const stopMonsterSound = useCallback((monsterId: string) => {
    if (audioRefs.current[monsterId]) {
      audioRefs.current[monsterId].pause();
      audioRefs.current[monsterId].currentTime = 0;
    }
  }, []);

  // Change the current island
  const setCurrentIsland = useCallback(
    (islandId: string) => {
      // Stop all currently playing monster sounds
      if (isPlaying) {
        Object.values(audioRefs.current).forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
      }

      setCurrentIslandId(islandId);

      // If music is playing, restart with monsters on the new island
      if (isPlaying) {
        const islandPlacements = gameState.monsterPlacements.filter(
          (p) => p.islandId === islandId
        );

        islandPlacements.forEach((placement) => {
          const monster = monsters.find((m) => m.id === placement.monsterId);
          if (monster) {
            playMonsterSound(monster.id);
          }
        });

        // Recombine all sounds
        combineMonsterSounds(audioRefs.current, volume);
      }
    },
    [isPlaying, gameState.monsterPlacements, monsters, playMonsterSound, volume]
  );

  // Purchase a new monster
  const purchaseMonster = useCallback(
    (monsterId: string) => {
      const monster = monsters.find((m) => m.id === monsterId);
      if (!monster) return;

      // Check if player has enough coins
      if (gameState.resources.coins < monster.cost.coins) {
        toast.error("Not enough coins!", { className: "msm-toast" });
        return;
      }

      // Deduct coins and add monster to collection
      setGameState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          coins: prev.resources.coins - monster.cost.coins,
        },
        unlockedMonsters: [...prev.unlockedMonsters, monsterId],
      }));

      toast.success(`You purchased a ${monster.name}!`, {
        className: "msm-toast",
      });
    },
    [monsters, gameState.resources, setGameState]
  );

  // Place a monster on the current island
  const placeMonster = useCallback(
    (monsterId: string, position: { x: number; y: number }) => {
      const placementId = `placement-${Date.now()}`;

      setGameState((prev) => ({
        ...prev,
        monsterPlacements: [
          ...prev.monsterPlacements,
          {
            id: placementId,
            monsterId,
            islandId: currentIslandId,
            position,
            level: 1,
            lastCollection: Date.now(),
          },
        ],
      }));

      // If music is playing, add this monster's sound
      if (isPlaying) {
        playMonsterSound(monsterId);
        // Recombine all sounds
        setTimeout(() => combineMonsterSounds(audioRefs.current, volume), 100);
      }
    },
    [currentIslandId, isPlaying, playMonsterSound, setGameState, volume]
  );

  // Move a placed monster to a new position
  const moveMonster = useCallback(
    (placementId: string, position: { x: number; y: number }) => {
      setGameState((prev) => ({
        ...prev,
        monsterPlacements: prev.monsterPlacements.map((placement) =>
          placement.id === placementId ? { ...placement, position } : placement
        ),
      }));
    },
    [setGameState]
  );

  // Remove a monster from an island
  const removeMonster = useCallback(
    (placementId: string) => {
      // Find the placement to get the monster ID
      const placement = gameState.monsterPlacements.find(
        (p) => p.id === placementId
      );
      if (!placement) return;

      // Stop the monster's sound if playing
      if (isPlaying && audioRefs.current[placement.monsterId]) {
        stopMonsterSound(placement.monsterId);
      }

      // Remove the placement
      setGameState((prev) => ({
        ...prev,
        monsterPlacements: prev.monsterPlacements.filter(
          (p) => p.id !== placementId
        ),
      }));

      // Recombine sounds if playing
      if (isPlaying) {
        setTimeout(() => combineMonsterSounds(audioRefs.current, volume), 100);
      }
    },
    [
      gameState.monsterPlacements,
      isPlaying,
      stopMonsterSound,
      setGameState,
      volume,
    ]
  );

  // Start breeding two monsters
  const startBreeding = useCallback(
    (monster1Id: string, monster2Id: string) => {
      // Check if both monsters are unlocked
      if (
        !gameState.unlockedMonsters.includes(monster1Id) ||
        !gameState.unlockedMonsters.includes(monster2Id)
      ) {
        toast.error("You don't have these monsters!", {
          className: "msm-toast",
        });
        return;
      }

      const monster1 = monsters.find((m) => m.id === monster1Id);
      const monster2 = monsters.find((m) => m.id === monster2Id);

      if (!monster1 || !monster2) return;

      // Set breeding time - in a real game this would depend on the monsters
      const breedingTime = 30; // seconds for demo purposes

      setBreedingMonsters({ monster1Id, monster2Id });
      setBreedingTimeLeft(breedingTime);

      toast.info("Breeding started! Check back soon...", {
        className: "msm-toast",
      });
    },
    [gameState.unlockedMonsters, monsters]
  );

  // Collect coins from a monster
  const collectCoins = useCallback(
    (placementId: string) => {
      const placement = gameState.monsterPlacements.find(
        (p) => p.id === placementId
      );
      if (!placement) return;

      const monster = monsters.find((m) => m.id === placement.monsterId);
      if (!monster) return;

      // Calculate coins based on level and time since last collection
      const timeSinceCollection =
        (Date.now() - placement.lastCollection) / 1000; // in seconds
      const baseCoinsPerMinute = monster.coinRate; // coins per minute
      const coinsPerSecond = baseCoinsPerMinute / 60;
      const levelMultiplier = 1 + (placement.level - 1) * 0.2; // 20% increase per level

      let coinsToCollect = Math.floor(
        coinsPerSecond * timeSinceCollection * levelMultiplier
      );
      coinsToCollect = Math.min(
        coinsToCollect,
        monster.maxCoins * levelMultiplier
      ); // Cap at max coins

      if (coinsToCollect <= 0) {
        toast.info("No coins to collect yet!", { className: "msm-toast" });
        return;
      }

      // Update resources and reset collection time
      setGameState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          coins: prev.resources.coins + coinsToCollect,
        },
        monsterPlacements: prev.monsterPlacements.map((p) =>
          p.id === placementId ? { ...p, lastCollection: Date.now() } : p
        ),
      }));

      toast.success(`Collected ${coinsToCollect} coins!`, {
        className: "msm-toast",
      });
    },
    [gameState.monsterPlacements, monsters, setGameState]
  );

  // Feed a monster to level it up
  const feedMonster = useCallback(
    (placementId: string, amount: number) => {
      // Check if player has enough food
      if (gameState.resources.food < amount) {
        toast.error("Not enough food!", { className: "msm-toast" });
        return;
      }

      const placement = gameState.monsterPlacements.find(
        (p) => p.id === placementId
      );
      if (!placement) return;

      // Calculate new level based on food (simplified)
      const foodPerLevel = 10; // Amount of food needed for each level
      const levelIncrease = Math.floor(amount / foodPerLevel);

      if (levelIncrease <= 0) {
        toast.info("Not enough food to level up!", { className: "msm-toast" });
        return;
      }

      const newLevel = Math.min(placement.level + levelIncrease, 15); // Cap at level 15

      // Update monster level and deduct food
      setGameState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          food: prev.resources.food - amount,
        },
        monsterPlacements: prev.monsterPlacements.map((p) =>
          p.id === placementId ? { ...p, level: newLevel } : p
        ),
      }));

      if (newLevel > placement.level) {
        toast.success(`Monster leveled up to level ${newLevel}!`, {
          className: "msm-toast",
        });
      }
    },
    [gameState.resources.food, gameState.monsterPlacements, setGameState]
  );

  // Buy a new island
  // Buy a new island
  const buyIsland = useCallback(
    (islandId: string) => {
      const island = islands.find((i) => i.id === islandId);
      if (!island) return;

      // Check if player has enough resources
      const diamondCost = island.cost.diamonds || 0;
      if (gameState.resources.diamonds < diamondCost) {
        toast.error("Not enough diamonds!", { className: "msm-toast" });
        return;
      }

      // Deduct resources and unlock island
      setGameState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          diamonds: prev.resources.diamonds - diamondCost,
        },
        unlockedIslands: [...prev.unlockedIslands, islandId],
      }));

      toast.success(`You unlocked ${island.name}!`, { className: "msm-toast" });
      setCurrentIslandId(islandId);
    },
    [islands, gameState.resources, setGameState, setCurrentIsland]
  );

  // Toggle play/pause for all monster sounds
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Reset the game (for testing)
  const resetGame = useCallback(() => {
    // Stop all audio
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Reset to initial state
    setGameState({
      unlockedMonsters: initialMonsters
        .filter((m) => m.initiallyUnlocked)
        .map((m) => m.id),
      unlockedIslands: initialIslands
        .filter((i) => i.initiallyUnlocked)
        .map((i) => i.id),
      monsterPlacements: [],
      resources: {
        coins: 1000,
        diamonds: 10,
        food: 50,
        starpower: 0,
      },
    });

    setCurrentIslandId(initialIslands[0].id);
    setIsPlaying(false);
    setBreedingMonsters(null);
    setBreedingTimeLeft(null);

    toast.success("Game reset!", { className: "msm-toast" });
  }, [setGameState]);

  // Provide context value
  const contextValue: MSMContextType = {
    // Game state
    monsters,
    islands,
    currentIslandId,
    resources: gameState.resources,
    monsterPlacements: gameState.monsterPlacements,
    breedingMonsters,
    breedingTimeLeft,
    isPlaying,

    // Actions
    setCurrentIsland,
    purchaseMonster,
    placeMonster,
    moveMonster,
    removeMonster,
    startBreeding,
    collectCoins,
    feedMonster,
    buyIsland,
    togglePlay,
    resetGame,

    // Audio control
    playMonsterSound,
    stopMonsterSound,
    setVolume,
    volume,
  };

  return (
    <MSMContext.Provider value={contextValue}>{children}</MSMContext.Provider>
  );
};

// Hook for using the MSM context
export const useMSM = () => {
  const context = useContext(MSMContext);
  if (context === undefined) {
    throw new Error("useMSM must be used within an MSMProvider");
  }
  return context;
};
