// app/apps/pacman/App.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useStyles } from "@/app/hooks/useStyles";
import { PacmanGameController } from "./PacmanGameController";
import { useAppStore } from "@/app/store/appStore";

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PacmanGameController | null>(null);
  const { getColor } = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const updateAppState = useAppStore((state) => state.updateAppState);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create and initialize the game
    const game = new PacmanGameController(containerRef.current);
    gameRef.current = game;

    // Initialize game
    game.init().then(() => {
      setIsLoading(false);
    });

    // Clean up on component unmount
    return () => {
      game.dispose();
    };
  }, []);

  const handleStartGame = () => {
    if (gameRef.current && !gameStarted) {
      gameRef.current.start();
      setGameStarted(true);

      // Store game state in the app store
      updateAppState("pacman", {
        isPlaying: true,
        score: 0,
        lives: 3,
      });
    }
  };

  const handleShowHelp = () => {
    if (gameRef.current) {
      gameRef.current.toggleHelp();
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative flex-grow" ref={containerRef}>
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: getColor("Black") }}
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p
                className="text-lg"
                style={{ color: getColor("Text Primary (Hd)") }}
              >
                Loading Pacman 3D...
              </p>
            </div>
          </div>
        )}

        {!isLoading && !gameStarted && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <div
              className="text-center p-8 rounded-lg"
              style={{
                backgroundColor: getColor("Glass"),
                border: `1px solid ${getColor("Brd")}`,
              }}
            >
              <h2
                className="text-2xl mb-6"
                style={{ color: getColor("Text Primary (Hd)") }}
              >
                Pacman 3D
              </h2>
              <div className="mb-6">
                <p
                  className="mb-2"
                  style={{ color: getColor("Text Secondary (Bd)") }}
                >
                  Use WASD to move Pacman:
                </p>
                <p
                  className="mb-1"
                  style={{ color: getColor("Text Secondary (Bd)") }}
                >
                  W/S - Move forward/backward
                </p>
                <p
                  className="mb-1"
                  style={{ color: getColor("Text Secondary (Bd)") }}
                >
                  A/D - Turn left/right
                </p>
              </div>
              <button
                onClick={handleStartGame}
                className="px-6 py-2 rounded-md mr-4 transition-colors"
                style={{
                  backgroundColor: getColor("Lilac Accent"),
                  color: getColor("Text Primary (Hd)"),
                }}
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        <div id="lives" className="absolute top-4 right-4 z-20"></div>

        <button
          id="help-button"
          className="absolute top-4 left-4 z-20 px-3 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
          onClick={handleShowHelp}
          style={{
            backgroundColor: getColor("Glass"),
            color: getColor("Text Primary (Hd)"),
          }}
        >
          HELP
        </button>

        <div
          id="help-dialog"
          className="hidden absolute left-1/4 top-1/4 w-1/2 p-8 z-30 text-center rounded-lg"
          style={{
            backgroundColor: "rgba(0, 0, 30, 0.8)",
            color: "rgb(255, 255, 200)",
          }}
        >
          <h2 className="text-xl mb-4">CONTROLS</h2>
          <p className="mb-4">
            WASD: Use W/S to move forward/backward and A/D to turn left/right.
          </p>
          <p className="mb-6">
            After you collect all of the dots, the game will start over but
            pacman and the ghosts will get a little bit faster!
          </p>
          <button
            onClick={() => {
              if (gameRef.current) {
                gameRef.current.toggleHelp();
              }
            }}
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: getColor("Lilac Accent"),
              color: getColor("Text Primary (Hd)"),
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
