// /app/apps/drift/App.tsx
// INDIVIDUAL GAME COMPONENT - Uses Universal foundation

'use client';

import { useGameEngine } from '@/app/components/arcade';
import { DriftGameEngine } from './game/DriftGameEngine';
import { DRIFT_ASSET_PACK } from './config/assets';

export default function DriftGameApp() {
  // Game configuration
  const gameConfig = {
    targetFPS: 60,
    enablePhysics: true,
    enableAudio: true,
    maxAssetMemory: 256,
    renderDistance: 500,
    shadowQuality: 'medium' as const,
    pauseOnBlur: true,
    adaptiveQuality: true
  };

  // Use the shared game engine hook
  const {
    containerRef,
    game,
    isInitialized,
    isLoading,
    error,
    loadingProgress,
    fps
  } = useGameEngine(DriftGameEngine, gameConfig, DRIFT_ASSET_PACK);

  // Error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-red-900/20">
        <div className="text-red-400 text-center">
          <div className="text-2xl mb-2">🚫 Game Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 animate-spin">🏎️</div>
          <div className="text-xl mb-2">Loading Drift Game...</div>
          <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="text-sm mt-2">{loadingProgress}%</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-black relative">
      {/* 🎮 GAME CONTAINER - Perfect fit in Zenithos window */}
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ position: 'relative' }}
        tabIndex={0} // Make focusable for keyboard input
      />
      
      {/* 🎯 GAME UI OVERLAY */}
      <div className="absolute top-4 right-4 text-white z-10 space-y-2">
        <div className="bg-black/70 px-3 py-1 rounded text-lg font-mono">
          Speed: {Math.floor(game?.getCarSpeed() || 0)} km/h
        </div>
        <div className="bg-black/70 px-3 py-1 rounded text-sm font-mono">
          FPS: {fps}
        </div>
        <div className="bg-black/70 px-3 py-1 rounded text-xs">
          Status: {isInitialized ? '✅ Ready' : '⏳ Loading'}
        </div>
        {game && (
          <div className="bg-black/70 px-3 py-1 rounded text-xs">
            Trees: {game.getTreeCount()} 🌳 {game.getTreesInfo().hasTextures ? '✅ Textured' : '⚠️ Fallback'}
          </div>
        )}
      </div>

      {/* 🎮 CONTROLS INSTRUCTIONS */}
      <div className="absolute bottom-4 left-4 text-white z-10 bg-black/70 p-3 rounded">
        <div className="text-sm font-bold mb-2">🎮 Controls:</div>
        <div className="text-xs space-y-1">
          <div>W / ↑ - Accelerate</div>
          <div>S / ↓ - Brake/Reverse</div>
          <div>A / ← - Turn Left</div>
          <div>D / → - Turn Right</div>
        </div>
      </div>

      {/* 🏁 GAME INFO */}
      <div className="absolute top-4 left-4 text-white z-10 bg-black/70 p-3 rounded">
        <div className="text-lg font-bold text-blue-400">🏎️ Drift Racer</div>
        <div className="text-xs text-gray-300">Universal Game Engine v1.0</div>
        {game && (
          <div className="text-xs text-gray-300 mt-1">
            Position: {game.getCarPosition().x.toFixed(1)}, {game.getCarPosition().z.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
}
