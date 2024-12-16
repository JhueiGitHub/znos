// App.tsx
"use client";

import { NavBar } from "./components/NavBar";
import { Sidebar } from "./components/Sidebar";
import { FoldersArea } from "./components/FoldersArea";
import { StatusBar } from "./components/StatusBar";
import { DragProvider } from "./contexts/drag-context";
import React from "react";
import { DebugPanel } from "./components/DebugPanel";

export default function App() {
  return (
    <DragProvider>
      <div className="flex h-full w-full">
        <Sidebar />
        <main className="flex flex-1 flex-col min-w-0">
          <NavBar />
          <FoldersArea />
          <StatusBar />
        </main>
      </div>
      <DebugPanel />
    </DragProvider>
  );
}
