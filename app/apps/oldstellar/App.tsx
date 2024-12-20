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
import { DragLayer } from "./components/DragLayer";

interface FolderPath {
  id: string;
  name: string;
}

interface HomeProps {
  folderId?: string;
}

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

  const handlePathChange = useCallback((newPath: FolderPath[]) => {
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
        <div className="flex flex-col h-full">
          <div className="flex-1 relative">
            {/* Folders Area and Nav - Higher Z Index */}
            <div className="absolute inset-0 z-50">
              <main className="h-full flex flex-col">
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
            </div>

            {/* Sidebar - Lower Z Index */}
            <SidebarProvider>
              <div className="absolute inset-0 z-0">
                <div className="flex h-full">
                  <StellarKeyboardEvents />
                  <AppSidebar />
                </div>
              </div>
            </SidebarProvider>
          </div>
        </div>
      </FolderProvider>
    </QueryClientProvider>
  );
};

export default Home;
