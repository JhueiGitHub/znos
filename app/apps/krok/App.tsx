// App.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { DriftGame } from "./game/DriftGame";

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<DriftGame | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [treeCount, setTreeCount] = useState(0);

  useEffect(() => {
    // Only initialize once and when the container is available
    if (!containerRef.current || gameInstanceRef.current) return;

    // Create and initialize the game
    const game = new DriftGame(containerRef.current);
    game.init().then(() => {
      // Update tree count after initialization
      setTreeCount(game.getTreeCount());
    });
    game.start();
    gameInstanceRef.current = game;

    // Add keyboard shortcuts for tree system
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 't':
          // Toggle tree visibility
          game.toggleTrees();
          break;
        case 'd':
          // Toggle debug mode
          setIsDebugMode(prev => !prev);
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener
    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameInstanceRef.current) {
        gameInstanceRef.current.dispose();
        gameInstanceRef.current = null;
      }
    };

    return cleanup;


  }, []);

  // Update tree count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameInstanceRef.current) {
        setTreeCount(gameInstanceRef.current.getTreeCount());
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden"
        tabIndex={0} // Make it focusable for keyboard input
        style={{ position: 'relative' }}
      />
      {/* Game UI Overlay */}
      <div className="absolute top-4 right-4 text-white z-10 space-y-2">
        <div
          id="speed-display"
          className="bg-black/50 px-3 py-1 rounded text-lg font-mono"
        >
          Speed: 0 km/h
        </div>
        <div
          id="tree-display"
          className="bg-black/50 px-3 py-1 rounded text-sm font-mono"
        >
          Trees: {treeCount}
        </div>
      </div>

      {/* Debug Controls */}
      {isDebugMode && (
        <div className="absolute top-4 left-4 text-white z-10 bg-black/70 p-4 rounded space-y-2">
          <h3 className="text-lg font-bold text-green-400">🌲 Fristy Tree System</h3>
          <div className="text-sm space-y-1">
            <div>Tree Count: {treeCount}</div>
            <div className="text-xs text-gray-300">Press 'T' to toggle trees</div>
            <div className="text-xs text-gray-300">Press 'D' to toggle debug</div>
          </div>
          <div className="text-xs text-yellow-300">
            🌲 Fristy Stylize Modular Assets 2
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white z-10 bg-black/50 p-3 rounded text-sm">
        <div className="font-bold mb-1">🎮 Controls:</div>
        <div>WASD / Arrow Keys - Drive</div>
        <div>T - Toggle Trees</div>
        <div>D - Toggle Debug</div>
      </div>
    </div>
  );
};

export default App;
