// app/apps/obsidian/contexts/note-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  vaultId: string;
};

interface NoteContextType {
  activeNoteId: string | undefined;
  setActiveNoteId: (id: string) => void;
  activeNote: Note | undefined;
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
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>(
    initialNoteId
  );

  // Query to fetch active note
  const { data: activeNote } = useQuery({
    queryKey: ["note", activeNoteId],
    queryFn: async () => {
      console.log("Fetching note:", activeNoteId);
      const response = await axios.get(`/api/obsidian/notes/${activeNoteId}`);
      return response.data;
    },
    enabled: !!activeNoteId,
  });

  return (
    <NoteContext.Provider
      value={{
        activeNoteId,
        setActiveNoteId,
        activeNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
