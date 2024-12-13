"use client";

import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { NavBar } from "./components/nav-bar";
import { FoldersArea } from "./components/folders-area";
import { StatusBar } from "./components/status-bar";
import { StellarKeyboardEvents } from "./components/ui/keyboard-listener";

interface HomeProps {
  folderId?: string;
}

const Home: React.FC<HomeProps> = ({ folderId }) => {
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
              <NavBar currentFolderId={folderId} />
              <FoldersArea folderId={folderId} />
              <StatusBar />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Home;
