// contexts/folder-context.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface FolderPath {
  id: string;
  name: string;
}

interface FolderContextType {
  currentFolderId: string | null;
  setCurrentFolder: (id: string | null) => void;
  folderPath: FolderPath[];
  setFolderPath: (path: FolderPath[]) => void;
  navigateBack: () => void;
}

interface FolderProviderProps {
  children: React.ReactNode;
  initialFolderId?: string;
}

const FolderContext = createContext<FolderContextType | null>(null);

export function FolderProvider({
  children,
  initialFolderId,
}: FolderProviderProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    initialFolderId || null
  );
  const [folderPath, setFolderPath] = useState<FolderPath[]>([]);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);

  useEffect(() => {
    if (initialFolderId) {
      setCurrentFolderId(initialFolderId);
    }
  }, [initialFolderId]);

  const setCurrentFolder = (id: string | null) => {
    if (currentFolderId) {
      setNavigationStack((prev) => [...prev, currentFolderId]);
    }
    setCurrentFolderId(id);
  };

  const navigateBack = () => {
    const previousFolder = navigationStack[navigationStack.length - 1];
    setNavigationStack((prev) => prev.slice(0, -1));
    setCurrentFolderId(previousFolder || null);
  };

  return (
    <FolderContext.Provider
      value={{
        currentFolderId,
        setCurrentFolder,
        folderPath,
        setFolderPath,
        navigateBack,
      }}
    >
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
