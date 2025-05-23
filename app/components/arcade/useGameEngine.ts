// /app/components/arcade/useGameEngine.ts
// SHARED REACT HOOK - Used by all game components

import { useEffect, useRef, useState } from 'react';
import { UniversalGameEngine, GameConfiguration } from './GameEngine';
import { UniversalAssetManager, AssetPack } from './AssetManager';

export function useGameEngine<T extends UniversalGameEngine>(
  GameEngineClass: new (container: HTMLElement, config: GameConfiguration) => T,
  config: GameConfiguration,
  assetPack?: AssetPack
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<T | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const initializeGame = async () => {
      try {
        if (!containerRef.current) return;

        setIsLoading(true);
        setError(null);

        // Load asset pack if provided
        if (assetPack) {
          const assetManager = UniversalAssetManager.getInstance();
          
          // Track loading progress
          const checkProgress = setInterval(() => {
            const progress = assetManager.getPackProgress(assetPack);
            setLoadingProgress(progress.percent);
            
            if (progress.percent === 100) {
              clearInterval(checkProgress);
            }
          }, 100);

          await assetManager.loadAssetPack(assetPack);
          clearInterval(checkProgress);
        }

        // Create and initialize game engine
        if (isMounted && containerRef.current) {
          const game = new GameEngineClass(containerRef.current, config);
          gameRef.current = game;

          await game.initialize();
          game.start();
          
          setIsInitialized(true);
          setIsLoading(false);
          setLoadingProgress(100);
        }

      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initializeGame();

    // Cleanup function
    return () => {
      isMounted = false;
      
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
      
      setIsInitialized(false);
      setIsLoading(false);
      setError(null);
      setLoadingProgress(0);
    };
  }, []); // Initialize once

  return {
    containerRef,
    game: gameRef.current,
    isInitialized,
    isLoading,
    error,
    loadingProgress,
    fps: gameRef.current?.getCurrentFPS() || 0
  };
}
