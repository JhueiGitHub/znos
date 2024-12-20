// App.tsx
"use client";

import { NavBar } from "./components/NavBar";
import { Sidebar } from "./components/Sidebar";
import { FoldersArea } from "./components/FoldersArea";
import { StatusBar } from "./components/StatusBar";
import { DragProvider } from "./contexts/drag-context";
import { FolderProvider } from "./contexts/folder-context";
import { StellarKeyboardEvents } from "./components/ui/keyboard-listener";
import React from "react";
import { DebugPanel } from "./components/DebugPanel";

interface AppProps {
  initialFolderId?: string;
}

export default function App({ initialFolderId }: AppProps) {
  return (
    <DragProvider>
      <FolderProvider initialFolderId={initialFolderId}>
        <StellarKeyboardEvents />
        <div className="flex h-full w-full">
          <Sidebar />
          <main className="flex flex-1 flex-col min-w-0">
            <NavBar />
            <FoldersArea />
            <StatusBar />
          </main>
        </div>
      </FolderProvider>
    </DragProvider>
  );
}
