// App.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { DriftGame } from "./game/DriftGame";

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<DriftGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize once and when the container is available
    if (!containerRef.current || gameInstanceRef.current) return;

    // Create and initialize the game
    const initGame = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!containerRef.current) {
          throw new Error("Container reference is not available");
        }
        
        // Wait a moment to ensure the container is fully mounted and sized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const game = new DriftGame(containerRef.current);
        
        try {
          // Initialize the game
          await game.init();
          game.start();
          gameInstanceRef.current = game;
        } catch (initError) {
          console.error("Game initialization error:", initError);
          setError("Could not initialize the game properly. Please try again.");
          throw initError;
        }
      } catch (error) {
        console.error("Failed to create game instance:", error);
        setError("Game could not be loaded. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initGame();

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current.dispose();
        } catch (e) {
          console.error("Error disposing game:", e);
        }
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
      
      {/* Game UI elements */}
      <div
        id="speed-display"
        className="absolute top-4 right-4 text-white text-lg font-mono bg-black bg-opacity-50 px-2 py-1 rounded z-10"
      >
        Speed: 0 km/h
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded z-10">
        WASD or Arrow Keys to drive
      </div>
      
      {/* Loading overlay - hidden once loaded */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <div className="text-white text-xl">Loading Drift Game...</div>
        </div>
      )}
      
      {/* Error message */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-30">
          <div className="bg-red-900 text-white p-4 rounded-md max-w-md">
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p>{error}</p>
            <button 
              className="mt-4 bg-white text-red-900 px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Reload Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
