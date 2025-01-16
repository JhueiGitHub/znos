// hooks/useNotePersistence.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface NoteState {
  noteId: string | undefined;
  scrollPositions: Record<string, number>;
  expandedFolders: string[]; // Add expanded folders state
}

const STORAGE_KEY = "obsidian_note_state";

export const useNotePersistence = () => {
  // Load initial state from localStorage
  const [state, setState] = useState<NoteState>(() => {
    if (typeof window === "undefined") {
      return { 
        noteId: undefined, 
        scrollPositions: {},
        expandedFolders: [] 
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { 
        noteId: undefined, 
        scrollPositions: {},
        expandedFolders: []
      };
    } catch (e) {
      console.error("Error loading persisted note state:", e);
      return { 
        noteId: undefined, 
        scrollPositions: {},
        expandedFolders: []
      };
    }
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state.noteId || 
        Object.keys(state.scrollPositions).length > 0 || 
        state.expandedFolders.length > 0) {
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

  // New methods for handling expanded folders state
  const setExpandedFolders = useCallback((folderIds: string[]) => {
    setState((prev) => ({
      ...prev,
      expandedFolders: folderIds
    }));
  }, []);

  const getExpandedFolders = useCallback((): string[] => {
    return state.expandedFolders;
  }, [state.expandedFolders]);

  const toggleFolderExpanded = useCallback((folderId: string) => {
    setState((prev) => {
      const isExpanded = prev.expandedFolders.includes(folderId);
      const newExpandedFolders = isExpanded
        ? prev.expandedFolders.filter(id => id !== folderId)
        : [...prev.expandedFolders, folderId];
      
      return {
        ...prev,
        expandedFolders: newExpandedFolders
      };
    });
  }, []);

  return {
    lastViewedNoteId: state.noteId,
    setActiveNoteId,
    saveScrollPosition,
    getScrollPosition,
    setExpandedFolders,
    getExpandedFolders,
    toggleFolderExpanded,
    expandedFolders: state.expandedFolders || [] // Ensure we always return an array
  };
};