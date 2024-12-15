"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { NavBar } from "./components/nav-bar";
import { FoldersArea } from "./components/folders-area";
import { StatusBar } from "./components/status-bar";
import { StellarKeyboardEvents } from "./components/ui/keyboard-listener";
import { FolderProvider } from "./contexts/folder-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface FolderPath {
  id: string;
  name: string;
}

interface HomeProps {
  folderId?: string;
}

// PRESERVED: QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const Home: React.FC<HomeProps> = ({ folderId }) => {
  const [currentPath, setCurrentPath] = useState<FolderPath[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    folderId
  );

  // EVOLVED: Updated path handling to prevent root duplication
  const handleFolderNavigate = useCallback(
    (folderId: string) => {
      const folderIndex = currentPath.findIndex((item) => item.id === folderId);
      if (folderIndex !== -1) {
        const newPath = currentPath.slice(0, folderIndex + 1);
        setCurrentPath(newPath);
        setCurrentFolderId(folderId);
      }
    },
    [currentPath]
  );

  // EVOLVED: Modified to handle root visibility
  const handlePathChange = useCallback((newPath: FolderPath[]) => {
    // Only set path if we're not at root or path is empty
    const pathToSet = newPath.length <= 1 ? [] : newPath;
    setCurrentPath(pathToSet);

    if (newPath.length > 0) {
      const lastFolder = newPath[newPath.length - 1];
      setCurrentFolderId(lastFolder.id);
    } else {
      setCurrentFolderId(undefined);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FolderProvider>
        <div className="flex flex-col">
          <SidebarProvider>
            <div className="flex-1 flex">
              <StellarKeyboardEvents />
              <div className="flex">
                <AppSidebar />
              </div>

              <SidebarInset className="bg-black/0 flex-1 min-w-0">
                <main className="absolute inset-0 flex flex-col">
                  <NavBar
                    currentFolderId={currentFolderId}
                    path={currentPath}
                    onNavigate={handleFolderNavigate}
                  />
                  <FoldersArea
                    initialFolderId={currentFolderId}
                    onPathChange={handlePathChange}
                  />
                  <StatusBar />
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </div>
      </FolderProvider>
    </QueryClientProvider>
  );
};

export default Home;
