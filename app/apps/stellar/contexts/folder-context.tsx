// contexts/folder-context.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useStellarState } from "./stellar-state-context";

interface FolderContextType {
  currentFolderId: string | null;
  setCurrentFolder: (folderId: string | null) => void;
  folderData: any;
  isLoading: boolean;
  setFolderPath: (path: Array<{ id: string; name: string }>) => void;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

interface FolderProviderProps {
  children: React.ReactNode;
  initialFolderId?: string;
}

export const FolderProvider: React.FC<FolderProviderProps> = ({
  children,
  initialFolderId,
}) => {
  const queryClient = useQueryClient();
  // Connect to our persisted state
  const { state, setCurrentFolder: setPersistedFolder } = useStellarState();

  // Use the persisted folder ID or initialFolderId as fallback
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    state.currentFolderId || initialFolderId || null
  );

  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Fetch current folder data using React Query
  const { data: folderData, isLoading } = useQuery({
    queryKey: ["stellar-folder", currentFolderId],
    queryFn: async () => {
      if (!currentFolderId) {
        // Return root folder data
        const response = await axios.get("/api/stellar/folders");
        return response.data;
      }
      // Return specific folder data
      const response = await axios.get(
        `/api/stellar/folders/${currentFolderId}`
      );
      return response.data;
    },
  });

  // When folder changes, update the persisted state
  useEffect(() => {
    if (folderData && currentFolderId) {
      const folderName = folderData.folder?.name || "Unnamed";
      setPersistedFolder(currentFolderId, folderName);
    } else if (currentFolderId === null) {
      setPersistedFolder(null);
    }
  }, [currentFolderId, folderData, setPersistedFolder]);

  // Set current folder with proper side effects
  const setCurrentFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    // Pre-fetch folder data if not already cached
    if (folderId) {
      queryClient.prefetchQuery({
        queryKey: ["stellar-folder", folderId],
        queryFn: async () => {
          const response = await axios.get(`/api/stellar/folders/${folderId}`);
          return response.data;
        },
      });
    }
  };

  return (
    <FolderContext.Provider
      value={{
        currentFolderId,
        setCurrentFolder,
        folderData,
        isLoading,
        setFolderPath,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
};
