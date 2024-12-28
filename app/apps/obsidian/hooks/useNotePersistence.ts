// hooks/useNotePersistence.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface NoteState {
  noteId: string | undefined;
  scrollPositions: Record<string, number>;
}

const STORAGE_KEY = "obsidian_note_state";

export const useNotePersistence = () => {
  // Load initial state from localStorage
  const [state, setState] = useState<NoteState>(() => {
    if (typeof window === "undefined")
      return { noteId: undefined, scrollPositions: {} };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : { noteId: undefined, scrollPositions: {} };
    } catch (e) {
      console.error("Error loading persisted note state:", e);
      return { noteId: undefined, scrollPositions: {} };
    }
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state.noteId || Object.keys(state.scrollPositions).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setActiveNoteId = useCallback((noteId: string | undefined) => {
    setState((prev) => ({ ...prev, noteId }));
  }, []);

  const saveScrollPosition = useCallback((noteId: string, position: number) => {
    setState((prev) => ({
      ...prev,
      scrollPositions: {
        ...prev.scrollPositions,
        [noteId]: position,
      },
    }));
  }, []);

  const getScrollPosition = useCallback(
    (noteId: string): number => {
      return state.scrollPositions[noteId] || 0;
    },
    [state.scrollPositions]
  );

  return {
    lastViewedNoteId: state.noteId,
    setActiveNoteId,
    saveScrollPosition,
    getScrollPosition,
  };
};
