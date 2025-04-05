// app/apps/drifting/hooks/useGameState.ts
import { useState, useEffect } from "react";
import { GameState, GameStats, PlayerProgress } from "../types/game";

/**
 * Custom hook to manage game state and persistent storage
 */
export const useGameState = () => {
  // Game state with default values
  const [gameState, setGameState] = useState<GameState>({
    status: "menu",
    loading: false,
    speed: 0,
    lapTime: 0,
    bestLapTime: 0,
    driftScore: 0,
  });

  // Player progress with persistent storage
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>({
    bestLaps: {},
    highScores: {},
    unlockedCars: [],
    unlockedTracks: [],
  });

  // Load saved progress on first render
  useEffect(() => {
    const savedProgress = localStorage.getItem("drifting_player_progress");

    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress) as PlayerProgress;
        setPlayerProgress(parsedProgress);
      } catch (error) {
        console.error("Failed to parse saved progress:", error);
      }
    }
  }, []);

  // Update stats from game engine
  const updateGameStats = (stats: GameStats) => {
    setGameState((prev) => ({
      ...prev,
      speed: stats.speed,
      lapTime: stats.lapTime,
      driftScore: stats.driftScore,
      bestLapTime: stats.bestLapTime > 0 ? stats.bestLapTime : prev.bestLapTime,
    }));
  };

  // Update game status
  const setGameStatus = (status: GameState["status"]) => {
    setGameState((prev) => ({ ...prev, status }));
  };

  // Save lap time and check if it's a new best
  const saveLapTime = (trackName: string, time: number) => {
    const currentBest = playerProgress.bestLaps[trackName] || Infinity;

    if (time < currentBest) {
      const updatedProgress = {
        ...playerProgress,
        bestLaps: {
          ...playerProgress.bestLaps,
          [trackName]: time,
        },
      };

      setPlayerProgress(updatedProgress);
      localStorage.setItem(
        "drifting_player_progress",
        JSON.stringify(updatedProgress)
      );
      return true; // Indicates a new best lap
    }

    return false;
  };

  // Save drift score and check if it's a new high score
  const saveDriftScore = (trackName: string, score: number) => {
    const currentBest = playerProgress.highScores[trackName] || 0;

    if (score > currentBest) {
      const updatedProgress = {
        ...playerProgress,
        highScores: {
          ...playerProgress.highScores,
          [trackName]: score,
        },
      };

      setPlayerProgress(updatedProgress);
      localStorage.setItem(
        "drifting_player_progress",
        JSON.stringify(updatedProgress)
      );
      return true; // Indicates a new high score
    }

    return false;
  };

  // Reset the game state
  const resetGame = () => {
    setGameState({
      status: "menu",
      loading: false,
      speed: 0,
      lapTime: 0,
      bestLapTime: 0,
      driftScore: 0,
    });
  };

  return {
    gameState,
    playerProgress,
    updateGameStats,
    setGameStatus,
    saveLapTime,
    saveDriftScore,
    resetGame,
  };
};

export default useGameState;
