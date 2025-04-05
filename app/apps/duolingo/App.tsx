// /root/app/apps/duolingo/App.tsx
"use client";

import React from "react";
import { DuolingoProvider } from "./contexts/DuolingoContext";
import DuolingoMainView from "./components/DuolingoMainView"; // Import the main view
import { zenith } from "./styles/zenithStyles";

export default function App() {
  return (
    // Padding around the app window / Zenith background glass
    // Removed centering here as DuolingoMainView handles it internally now
    <div className={`p-1 h-full w-full ${zenith.tailwind.bgBlackGlass}`}>
      <DuolingoProvider>
        <DuolingoMainView />
      </DuolingoProvider>
    </div>
  );
}
