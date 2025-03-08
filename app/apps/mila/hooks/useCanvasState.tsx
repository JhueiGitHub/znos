// app/apps/milanote/hooks/useCanvasState.ts
import { useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Position } from "../types";

export interface CanvasState {
  position: Position;
  scale: number;
  timestamp: number;
}

// Generate a storage key for each board and user
const getStorageKey = (boardId: string, userId?: string) => {
  const userPart = userId ? `-${userId}` : "";
  return `milanote-canvas-state-${boardId}${userPart}`;
};

export const useCanvasState = (boardId: string, userId?: string) => {
  // Save canvas state to localStorage
  // Save canvas state to localStorage
  const saveState = useCallback(
    (position: Position, scale: number) => {
      const state: CanvasState = {
        position,
        scale,
        timestamp: Date.now(),
      };

      try {
        const key = getStorageKey(boardId, userId);
        localStorage.setItem(key, JSON.stringify(state));
        console.log(`Canvas state saved for board ${boardId}:`, state);
      } catch (error) {
        console.warn("Failed to save canvas state to localStorage:", error);
      }
    },
    [boardId, userId]
  );

  // Create a debounced version of saveState to avoid excessive writes
  const debouncedSaveState = useCallback(
    debounce((position: Position, scale: number) => {
      saveState(position, scale);
    }, 300),
    [saveState]
  );

  // Load canvas state from localStorage
  // Load canvas state from localStorage
  const loadState = useCallback((): CanvasState | null => {
    try {
      const key = getStorageKey(boardId, userId);
      const storedState = localStorage.getItem(key);

      if (!storedState) {
        console.log(`No saved state found for board ${boardId}`);
        return null;
      }

      const parsedState = JSON.parse(storedState) as CanvasState;
      console.log(`Canvas state loaded for board ${boardId}:`, parsedState);
      return parsedState;
    } catch (error) {
      console.warn("Failed to load canvas state from localStorage:", error);
      return null;
    }
  }, [boardId, userId]);

  // Clear saved state (useful if needed)
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey(boardId, userId));
    } catch (error) {
      console.warn("Failed to clear canvas state from localStorage:", error);
    }
  }, [boardId, userId]);

  // Clean up old board states to prevent localStorage from becoming too full
  useEffect(() => {
    const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    try {
      // Get all milanote-related keys
      const allKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("milanote-canvas-state-")
      );

      // Check each key for expired data
      allKeys.forEach((key) => {
        try {
          const stateStr = localStorage.getItem(key);
          if (!stateStr) return;

          const state = JSON.parse(stateStr) as CanvasState;
          if (now - state.timestamp > MAX_AGE_MS) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // If we can't parse it, just remove it
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Error cleaning up old canvas states:", error);
    }
  }, []);

  return {
    saveState,
    debouncedSaveState,
    loadState,
    clearState,
  };
};
