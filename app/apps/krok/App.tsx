// App.tsx
"use client";

import { useEffect, useRef } from "react";
import { DriftGame } from "./game/DriftGame";

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<DriftGame | null>(null);

  useEffect(() => {
    // Only initialize once and when the container is available
    if (!containerRef.current || gameInstanceRef.current) return;

    // Create and initialize the game
    const game = new DriftGame(containerRef.current);
    game.init();
    game.start();
    gameInstanceRef.current = game;

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.dispose();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden"
        tabIndex={0} // Make it focusable for keyboard input
        style={{ position: 'relative' }}
      />
      <div
        id="speed-display"
        className="absolute top-4 right-4 text-white z-10"
      />
    </div>
  );
};

export default App;
