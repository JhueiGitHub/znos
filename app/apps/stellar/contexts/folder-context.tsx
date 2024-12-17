import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

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
  navigateTo: (folderId: string) => void;
  isNavigating: boolean;
  navigationStack: string[];
  clearNavigation: () => void;
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
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeout = useRef<NodeJS.Timeout>();

  // Clear any pending navigation timeouts on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, []);

  // Handle initial folder ID
  useEffect(() => {
    if (initialFolderId) {
      setCurrentFolderId(initialFolderId);
      setNavigationStack([]);
      setFolderPath([]);
    }
  }, [initialFolderId]);

  const setCurrentFolder = useCallback(
    (id: string | null) => {
      if (isNavigating) return;
      setIsNavigating(true);

      if (currentFolderId) {
        setNavigationStack((prev) => [...prev, currentFolderId]);
      }
      setCurrentFolderId(id);

      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    },
    [currentFolderId, isNavigating]
  );

  const navigateBack = useCallback(() => {
    if (isNavigating) return;

    setIsNavigating(true);
    const previousFolder = navigationStack[navigationStack.length - 1];

    setNavigationStack((prev) => prev.slice(0, -1));
    setCurrentFolderId(previousFolder || null);

    // Prevent rapid navigation
    navigationTimeout.current = setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  }, [navigationStack, isNavigating]);

  const navigateTo = useCallback(
    (folderId: string) => {
      if (isNavigating) return;

      setIsNavigating(true);

      if (currentFolderId) {
        setNavigationStack((prev) => [...prev, currentFolderId]);
      }

      setCurrentFolderId(folderId);

      // Prevent rapid navigation
      navigationTimeout.current = setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    },
    [currentFolderId, isNavigating]
  );

  const clearNavigation = useCallback(() => {
    setNavigationStack([]);
    setFolderPath([]);
    setCurrentFolderId(null);
  }, []);

  return (
    <FolderContext.Provider
      value={{
        currentFolderId,
        setCurrentFolder,
        folderPath,
        setFolderPath,
        navigateBack,
        navigateTo,
        isNavigating,
        navigationStack,
        clearNavigation,
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
