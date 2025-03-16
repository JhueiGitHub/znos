"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useStyles } from "@/app/hooks/useStyles";
import { PacmanGame } from "./game/PacmanGame";

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<PacmanGame | null>(null);
  const { getColor } = useStyles();

  useEffect(() => {
    // Only initialize once and when the container is available
    if (!containerRef.current || gameInstanceRef.current) return;

    const game = new PacmanGame(containerRef.current);
    game.init();
    game.start();
    gameInstanceRef.current = game;

    // Cleanup function for when component unmounts
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.dispose();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="h-full w-full relative bg-black"
      style={{ backgroundColor: getColor("Black") }}
    >
      {/* Game container - absolute positioned to fill the parent div */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        tabIndex={0} // Make it focusable for keyboard input
      />

      {/* Lives display - positioned absolutely in top right */}
      <div
        id="lives-display"
        className="absolute top-4 right-4 flex space-x-2 z-10"
      />

      {/* Score display - positioned absolutely in top center */}
      <div
        id="score-display"
        className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white z-10"
      />
    </div>
  );
};

export default App;
