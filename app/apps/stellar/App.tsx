// App.tsx - Updated to include StellarStateProvider
"use client";

import { NavBar } from "./components/NavBar";
import { Sidebar } from "./components/Sidebar";
import { FoldersArea } from "./components/FoldersArea";
import { StatusBar } from "./components/StatusBar";
import { DragProvider } from "./contexts/drag-context";
import { FolderProvider } from "./contexts/folder-context";
import { StellarStateProvider } from "./contexts/stellar-state-context";
import { StellarKeyboardEvents } from "./components/ui/keyboard-listener";
import React from "react";

interface AppProps {
  initialFolderId?: string;
}

export default function App({ initialFolderId }: AppProps) {
  return (
    <StellarStateProvider>
      <DragProvider>
        <FolderProvider initialFolderId={initialFolderId}>
          <StellarKeyboardEvents />
          <div className="flex h-full w-full bg-[#00000045] ">
            <Sidebar />
            <main className="flex flex-1 flex-col min-w-0">
              <NavBar />
              <FoldersArea />
              <StatusBar />
            </main>
          </div>
        </FolderProvider>
      </DragProvider>
    </StellarStateProvider>
  );
}
