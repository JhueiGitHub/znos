// app/apps/mila/hooks/useCanvasState.ts
import { useState, useEffect, useCallback } from "react";
import { Position } from "../types";

interface CanvasState {
  position: Position;
  scale: number;
}

interface CanvasStateOptions {
  profileId: string;
  boardId: string;
  defaultPosition?: Position;
  defaultScale?: number;
}

/**
 * Hook for persisting and restoring canvas position and zoom level
 * Stores canvas state in localStorage with a unique key for each user and board
 */
export const useCanvasState = ({
  profileId,
  boardId,
  defaultPosition = { x: 0, y: 0 },
  defaultScale = 1,
}: CanvasStateOptions) => {
  // Generate a unique storage key for this user and board
  const storageKey = `milanote_canvas_state_${profileId}_${boardId}`;

  // Initialize state from localStorage or defaults
  const [canvasPosition, setCanvasPosition] = useState<Position>(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState) as CanvasState;
        return parsed.position;
      }
    } catch (error) {
      console.warn("Error loading canvas state from localStorage:", error);
    }
    return defaultPosition;
  });

  const [scale, setScale] = useState<number>(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState) as CanvasState;
        return parsed.scale;
      }
    } catch (error) {
      console.warn("Error loading canvas scale from localStorage:", error);
    }
    return defaultScale;
  });

  // Save state to localStorage whenever it changes
  // Using useEffect because we want to save after render and not block UI
  useEffect(() => {
    try {
      const state: CanvasState = {
        position: canvasPosition,
        scale,
      };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn("Error saving canvas state to localStorage:", error);
    }
  }, [canvasPosition, scale, storageKey]);

  // Helper method to update canvas position
  const updatePosition = useCallback((newPosition: Position) => {
    setCanvasPosition(newPosition);
  }, []);

  // Helper method to update scale
  const updateScale = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  // Helper method to update both position and scale at once
  const updateCanvasState = useCallback(
    (newPosition: Position, newScale: number) => {
      setCanvasPosition(newPosition);
      setScale(newScale);
    },
    []
  );

  // Helper to reset canvas to default state
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
};
