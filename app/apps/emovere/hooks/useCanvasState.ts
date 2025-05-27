import { useState, useEffect, useCallback } from "react";

interface CanvasState {
  position: { x: number; y: number };
  scale: number;
}

interface UseCanvasStateProps {
  profileId: string;
  boardId: string;
  defaultPosition?: { x: number; y: number };
  defaultScale?: number;
}

export function useCanvasState({
  profileId,
  boardId,
  defaultPosition = { x: 0, y: 0 },
  defaultScale = 1,
}: UseCanvasStateProps) {
  const storageKey = `emovere_canvas_${profileId}_${boardId}`;

  const [canvasPosition, setCanvasPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.position || defaultPosition;
      }
    } catch (e) {
      console.error("Failed to load canvas position:", e);
    }
    return defaultPosition;
  });

  const [scale, setScale] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.scale || defaultScale;
      }
    } catch (e) {
      console.error("Failed to load canvas scale:", e);
    }
    return defaultScale;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: CanvasState = { position: canvasPosition, scale };
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save canvas state:", e);
    }
  }, [canvasPosition, scale, storageKey]);

  const updatePosition = useCallback((newPosition: { x: number; y: number }) => {
    setCanvasPosition(newPosition);
  }, []);

  const updateScale = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  const updateCanvasState = useCallback(
    (newPosition: { x: number; y: number }, newScale: number) => {
      setCanvasPosition(newPosition);
      setScale(newScale);
    },
    []
  );

  const resetCanvasState = useCallback(() => {
    setCanvasPosition(defaultPosition);
    setScale(defaultScale);
  }, [defaultPosition, defaultScale]);

  return {
    canvasPosition,
    scale,
    updatePosition,
    updateScale,
    updateCanvasState,
    resetCanvasState,
  };
}
