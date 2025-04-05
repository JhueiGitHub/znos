// /root/app/apps/duolingo/App.tsx
"use client";

import React from "react";
import { DuolingoProvider, useDuolingoState } from "./contexts/DuolingoContext";
import LessonSelection from "./components/LessonSelection";
import LessonView from "./components/LessonView";
import { zenith } from "./styles/zenithStyles"; // Import Zenith styles

// Internal component to access context
const DuolingoContent = () => {
  const { isLessonActive } = useDuolingoState();

  return (
    <div
      className={`flex flex-col h-full w-full ${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} rounded-lg overflow-hidden`}
    >
      {isLessonActive ? <LessonView /> : <LessonSelection />}
    </div>
  );
};

// Main App component that wraps content with the Provider
export default function App() {
  return (
    // Wrap the entire app in the DuolingoProvider
    // The outer div simulates the app window padding/margin if needed,
    // assuming the OrionOS window component provides the actual frame.
    <div className="p-1 h-full w-full">
      {" "}
      {/* Adjust padding as needed */}
      <DuolingoProvider>
        <DuolingoContent />
      </DuolingoProvider>
    </div>
  );
}
