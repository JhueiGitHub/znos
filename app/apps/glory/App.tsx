// /root/app/apps/glory/App.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { Dashboard } from "./components/Dashboard";
import { VideoProvider } from "./context/VideoContext";

export default function App() {
  const [view, setView] = useState<"dashboard" | "series">("dashboard");

  return (
    <VideoProvider>
      <div className="flex h-full bg-black/80">
        {view === "dashboard" ? (
          <Dashboard onSeriesSelect={() => setView("series")} />
        ) : (
          <>
            <Sidebar />
            <MainContent />
          </>
        )}
      </div>
    </VideoProvider>
  );
}
