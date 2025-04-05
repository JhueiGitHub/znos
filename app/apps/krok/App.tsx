"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStyles } from "@/app/hooks/useStyles";
import { useAppStore } from "@/app/store/appStore";
import MenuScreen from "./components/MenuScreen";
import PauseScreen from "./components/PauseScreen";
import GameOverScreen from "./components/GameOverScreen";
import GameUI from "./components/GameUI";
import ThreeJsErrorChecker from "./components/ThreeJsErrorChecker";
import DriftingGame from "./DriftingGame";
import { GameState } from "./types/game";

const App: React.FC = () => {
  const { getColor } = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<DriftingGame | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    status: "menu",
    loading: false,
    speed: 0,
    lapTime: 0,
    bestLapTime: 0,
    driftScore: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [keyState, setKeyState] = useState<{ [key: string]: boolean }>({});
  const updateAppState = useAppStore((state) => state.updateAppState);

  // Initialize game
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code
        )
      ) {
        e.preventDefault();
        setKeyState((prev) => ({ ...prev, [e.code]: true }));
      }

      // Handle escape key for pause
      if (e.code === "Escape" && gameState.status === "playing") {
        handlePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code
        )
      ) {
        setKeyState((prev) => ({ ...prev, [e.code]: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      // Cleanup game instance
      if (gameInstanceRef.current) {
        gameInstanceRef.current.dispose();
      }
    };
  }, [gameState.status]);

  // Pass control state to game instance
  useEffect(() => {
    if (gameInstanceRef.current && gameState.status === "playing") {
      // Update game controls with current key state
      gameInstanceRef.current.updateControls(keyState);
    }
  }, [keyState, gameState.status]);

  // Start the game
  const handleStartGame = () => {
    console.log("Starting game...");
    setError(null);
    setGameState((prev) => ({ ...prev, status: "loading", loading: true }));

    try {
      // Create new game instance
      if (!gameInstanceRef.current && containerRef.current) {
        console.log("Creating game instance...");
        gameInstanceRef.current = new DriftingGame(containerRef.current);

        // Register update callback
        gameInstanceRef.current.onUpdate = (stats) => {
          setGameState((prev) => ({
            ...prev,
            speed: stats.speed,
            lapTime: stats.lapTime,
            driftScore: stats.driftScore,
            bestLapTime:
              stats.bestLapTime > 0 ? stats.bestLapTime : prev.bestLapTime,
          }));
        };

        // Register game over callback
        gameInstanceRef.current.onGameOver = () => {
          setGameState((prev) => ({ ...prev, status: "gameOver" }));
          updateAppState("drifting", { isPlaying: false });
        };

        // Initialize the game
        console.log("Initializing game...");
        gameInstanceRef.current
          .init()
          .then(() => {
            console.log("Game initialized successfully!");
            setGameState((prev) => ({
              ...prev,
              status: "playing",
              loading: false,
              speed: 0,
              lapTime: 0,
              driftScore: 0,
            }));

            // Start the game engine
            gameInstanceRef.current?.start();
            console.log("Game started!");

            // Update app store
            updateAppState("drifting", {
              isPlaying: true,
              score: 0,
            });
          })
          .catch((err) => {
            console.error("Error initializing game:", err);
            setError(
              "Failed to initialize game: " + (err.message || "Unknown error")
            );
            setGameState((prev) => ({
              ...prev,
              status: "menu",
              loading: false,
            }));
          });
      } else {
        console.log("Game instance already exists or container not available");
        if (!containerRef.current) {
          setError("Game container not found");
        }
        setGameState((prev) => ({ ...prev, status: "menu", loading: false }));
      }
    } catch (err: any) {
      console.error("Exception in game initialization:", err);
      setError("Error starting game: " + (err.message || "Unknown error"));
      setGameState((prev) => ({ ...prev, status: "menu", loading: false }));
    }
  };

  // Pause the game
  const handlePause = () => {
    if (gameState.status === "playing") {
      console.log("Pausing game");
      setGameState((prev) => ({ ...prev, status: "paused" }));
      if (gameInstanceRef.current) {
        gameInstanceRef.current.pause();
      } else {
        console.warn("Game instance not available to pause");
      }
    } else if (gameState.status === "paused") {
      console.log("Resuming game from pause button");
      setGameState((prev) => ({ ...prev, status: "playing" }));
      if (gameInstanceRef.current) {
        gameInstanceRef.current.resume();
      } else {
        console.warn("Game instance not available to resume");
      }
    }
  };

  // Resume the game
  const handleResume = () => {
    console.log("Resuming game");
    setGameState((prev) => ({ ...prev, status: "playing" }));
    if (gameInstanceRef.current) {
      gameInstanceRef.current.resume();
    } else {
      console.warn("Game instance not available to resume");
      // Fallback to restart if instance is missing
      handleRestart();
    }
  };

  // Restart the game
  const handleRestart = () => {
    console.log("Restarting game");
    try {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.dispose();
        gameInstanceRef.current = null;
      }

      setGameState({
        status: "menu",
        loading: false,
        speed: 0,
        lapTime: 0,
        bestLapTime: 0,
        driftScore: 0,
      });
      setError(null);
    } catch (err: any) {
      console.error("Error restarting game:", err);
      setError("Error restarting game: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="drifting-container" ref={containerRef}>
      {/* Check if THREE.js can initialize properly */}
      {gameState.status === "menu" && (
        <ThreeJsErrorChecker onError={setError} />
      )}

      {/* Game Canvas Container */}
      <div className="relative h-full w-full">
        {/* Menu Screen */}
        {gameState.status === "menu" && (
          <MenuScreen
            onStart={handleStartGame}
            getColor={getColor}
            error={error}
          />
        )}

        {/* Loading Screen */}
        {gameState.loading && (
          <div
            className="menu-overlay"
            style={{ backgroundColor: `${getColor("Black")}` }}
          >
            <div
              className="loading-spinner"
              style={{
                borderColor: `${getColor("Brd")}`,
                borderTopColor: "transparent",
              }}
            />
            <p
              className="mt-4"
              style={{ color: getColor("Text Primary (Hd)") }}
            >
              Loading...
            </p>
          </div>
        )}

        {/* Game UI */}
        {gameState.status === "playing" && (
          <GameUI
            speed={gameState.speed}
            lapTime={gameState.lapTime}
            bestLapTime={gameState.bestLapTime}
            driftScore={gameState.driftScore}
            onPause={handlePause}
            getColor={getColor}
          />
        )}

        {/* Pause Screen */}
        {gameState.status === "paused" && (
          <PauseScreen
            onResume={handleResume}
            onRestart={handleRestart}
            getColor={getColor}
          />
        )}

        {/* Game Over Screen */}
        {gameState.status === "gameOver" && (
          <GameOverScreen
            score={gameState.driftScore}
            bestLapTime={gameState.bestLapTime}
            onRestart={handleRestart}
            getColor={getColor}
          />
        )}
      </div>
    </div>
  );
};

export default App;
