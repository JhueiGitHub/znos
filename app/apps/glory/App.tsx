"use client";

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { Dashboard } from "./components/Dashboard";
import { VideoProvider } from "./context/VideoContext";

export default function App() {
  const [view, setView] = useState<"dashboard" | "player">("dashboard");

  return (
    <VideoProvider>
      <div className="flex h-full bg-black/80">
        {view === "dashboard" ? (
          <Dashboard onContentSelect={() => setView("player")} />
        ) : (
          <>
            <MainContent />
          </>
        )}
      </div>
    </VideoProvider>
  );
}
