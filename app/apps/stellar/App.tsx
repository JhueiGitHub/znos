// In App.tsx, update the component:
"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { NavBar } from "./components/nav-bar";
import { FoldersArea } from "./components/folders-area";
import { StatusBar } from "./components/status-bar";
import { StellarKeyboardEvents } from "./components/ui/keyboard-listener";

interface FolderPath {
  id: string;
  name: string;
}

interface HomeProps {
  folderId?: string;
}

const Home: React.FC<HomeProps> = ({ folderId }) => {
  const [currentPath, setCurrentPath] = useState<FolderPath[]>([]);

  const handleFolderNavigate = useCallback(
    (folderId: string) => {
      // Find the folder in the current path and navigate to it
      const folderIndex = currentPath.findIndex((item) => item.id === folderId);
      if (folderIndex !== -1) {
        const newPath = currentPath.slice(0, folderIndex + 1);
        setCurrentPath(newPath);
      }
    },
    [currentPath]
  );

  return (
    <div className="flex flex-col overflow-hidden">
      <SidebarProvider>
        <div className="flex-1 flex overflow-hidden">
          <StellarKeyboardEvents />
          <div className="flex">
            <AppSidebar />
          </div>

          <SidebarInset className="bg-black/0 flex-1 min-w-0">
            <main className="h-full flex flex-col">
              <NavBar
                currentFolderId={folderId}
                path={currentPath}
                onNavigate={handleFolderNavigate}
              />
              <FoldersArea
                initialFolderId={folderId}
                onPathChange={setCurrentPath}
              />
              <StatusBar />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Home;
