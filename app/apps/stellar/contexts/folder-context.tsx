"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface FolderContextType {
  currentFolderId: string | null;
  setCurrentFolder: (id: string | null) => void;
}

const FolderContext = createContext<FolderContextType | null>(null);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const setCurrentFolder = useCallback((id: string | null) => {
    setCurrentFolderId(id);
  }, []);

  return (
    <FolderContext.Provider value={{ currentFolderId, setCurrentFolder }}>
      {children}
    </FolderContext.Provider>
  );
}

export function useFolder() {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
}
