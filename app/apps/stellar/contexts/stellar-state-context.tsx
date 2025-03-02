// contexts/stellar-state-context.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Define the state structure we want to persist with expanded types
interface StellarPersistedState {
  currentFolderId: string | null;
  recentFolders: Array<{ id: string; name: string }>;
  viewMode: "grid" | "list" | "canvas"; // Added "canvas" as valid option
  sortBy: "name" | "date" | "size" | "type"; // Added "type" as valid option
  sortDirection: "asc" | "desc";
  sidebarWidth: number;
}

// Default state values
const DEFAULT_STATE: StellarPersistedState = {
  currentFolderId: null,
  recentFolders: [],
  viewMode: "grid",
  sortBy: "name",
  sortDirection: "asc",
  sidebarWidth: 210,
};

// Storage key for Stellar app
const STORAGE_KEY = "stellarAppState";

// Maximum number of recent folders to track
const MAX_RECENT_FOLDERS = 10;

// Context interface
interface StellarStateContextType {
  state: StellarPersistedState;
  setCurrentFolder: (folderId: string | null, folderName?: string) => void;
  setViewMode: (mode: "grid" | "list" | "canvas") => void; // Updated to include "canvas"
  setSortBy: (sortBy: "name" | "date" | "size" | "type") => void; // Updated to include "type"
  setSortDirection: (direction: "asc" | "desc") => void;
  setSidebarWidth: (width: number) => void;
  clearHistory: () => void;
}

const StellarStateContext = createContext<StellarStateContextType | undefined>(
  undefined
);

export const StellarStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load persisted state from localStorage
  const loadPersistedState = (): StellarPersistedState => {
    if (typeof window === "undefined") return DEFAULT_STATE;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_STATE;

    try {
      return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_STATE;
    }
  };

  const [state, setState] = useState<StellarPersistedState>(loadPersistedState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Update current folder and add to recent folders
  const setCurrentFolder = useCallback(
    (folderId: string | null, folderName?: string) => {
      setState((prevState) => {
        // Don't add null (root) folder to recents
        if (!folderId) {
          return { ...prevState, currentFolderId: null };
        }

        // Create new folder entry
        const newFolder = {
          id: folderId,
          name: folderName || "Unnamed Folder",
        };

        // Filter out this folder if it already exists (to avoid duplicates)
        const filteredRecents = prevState.recentFolders.filter(
          (folder) => folder.id !== folderId
        );

        // Add the folder to the beginning of the array and limit to max size
        const newRecents = [newFolder, ...filteredRecents].slice(
          0,
          MAX_RECENT_FOLDERS
        );

        return {
          ...prevState,
          currentFolderId: folderId,
          recentFolders: newRecents,
        };
      });
    },
    []
  );

  // Set view mode (grid, list, or canvas)
  const setViewMode = useCallback((mode: "grid" | "list" | "canvas") => {
    setState((prevState) => ({ ...prevState, viewMode: mode }));
  }, []);

  // Set sort by field
  const setSortBy = useCallback((sortBy: "name" | "date" | "size" | "type") => {
    setState((prevState) => ({ ...prevState, sortBy }));
  }, []);

  // Set sort direction
  const setSortDirection = useCallback((sortDirection: "asc" | "desc") => {
    setState((prevState) => ({ ...prevState, sortDirection }));
  }, []);

  // Set sidebar width
  const setSidebarWidth = useCallback((width: number) => {
    setState((prevState) => ({ ...prevState, sidebarWidth: width }));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setState((prevState) => ({ ...prevState, recentFolders: [] }));
  }, []);

  const value = {
    state,
    setCurrentFolder,
    setViewMode,
    setSortBy,
    setSortDirection,
    setSidebarWidth,
    clearHistory,
  };

  return (
    <StellarStateContext.Provider value={value}>
      {children}
    </StellarStateContext.Provider>
  );
};

// Custom hook to use the context
export const useStellarState = () => {
  const context = useContext(StellarStateContext);
  if (context === undefined) {
    throw new Error(
      "useStellarState must be used within a StellarStateProvider"
    );
  }
  return context;
};
