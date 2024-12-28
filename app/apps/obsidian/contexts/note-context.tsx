// contexts/note-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useNotePersistence } from "../hooks/useNotePersistence";

type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  vaultId: string;
  frontmatter?: {
    date?: string;
    type?: string;
    [key: string]: any;
  };
  isDaily?: boolean; // Add this line
};

interface NoteContextType {
  activeNoteId: string | undefined;
  setActiveNoteId: (id: string) => void;
  activeNote: Note | undefined;
  navigateToDate: (date: Date) => void;
  isLoading: boolean;
  saveScrollPosition: (noteId: string, position: number) => void;
  getScrollPosition: (noteId: string) => number;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNote = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNote must be used within a NoteProvider");
  }
  return context;
};

export const NoteProvider = ({
  children,
  initialNoteId,
}: {
  children: React.ReactNode;
  initialNoteId?: string;
}) => {
  const {
    lastViewedNoteId,
    setActiveNoteId: persistActiveNote,
    saveScrollPosition,
    getScrollPosition,
  } = useNotePersistence();

  const [activeNoteId, setActiveNoteId] = React.useState<string | undefined>(
    initialNoteId || lastViewedNoteId
  );

  // Update persistence when active note changes
  useEffect(() => {
    if (activeNoteId) {
      persistActiveNote(activeNoteId);
    }
  }, [activeNoteId, persistActiveNote]);

  // Query to fetch active note
  const { data: activeNote, isLoading } = useQuery({
    queryKey: ["note", activeNoteId],
    queryFn: async () => {
      const response = await axios.get(`/api/obsidian/notes/${activeNoteId}`);
      return response.data;
    },
    enabled: !!activeNoteId,
  });

  // Query to handle daily notes
  const { data: dailyNote } = useQuery({
    queryKey: ["daily-note", format(new Date(), "yyyy-MM-dd")],
    queryFn: async () => {
      const response = await axios.get(
        `/api/obsidian/daily-notes/${format(new Date(), "yyyy-MM-dd")}`
      );
      return response.data;
    },
    enabled: !initialNoteId && !lastViewedNoteId, // Only run if no initial note ID is provided
  });

  useEffect(() => {
    if (!initialNoteId && !lastViewedNoteId && dailyNote?.id && !activeNoteId) {
      setActiveNoteId(dailyNote.id);
    }
  }, [dailyNote?.id, initialNoteId, lastViewedNoteId, activeNoteId]);

  const navigateToDate = async (date: Date) => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await axios.get(
        `/api/obsidian/daily-notes/${formattedDate}`
      );
      setActiveNoteId(response.data.id);
    } catch (error) {
      // If note doesn't exist, create it
      const response = await axios.post("/api/obsidian/daily-notes", {
        date: format(date, "yyyy-MM-dd"),
      });
      setActiveNoteId(response.data.id);
    }
  };

  return (
    <NoteContext.Provider
      value={{
        activeNoteId,
        setActiveNoteId,
        activeNote,
        navigateToDate,
        isLoading,
        saveScrollPosition,
        getScrollPosition,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
