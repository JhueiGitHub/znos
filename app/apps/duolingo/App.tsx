// /root/app/apps/duolingo/App.tsx
"use client";

import React from "react";
import { DuolingoProvider, useDuolingoState } from "./contexts/DuolingoContext";
import SnakeLessonLayout from "./components/SnakeLessonLayout";
import LessonView from "./components/LessonView";
import { zenith } from "./styles/zenithStyles";

// Internal component to access context
const DuolingoContent = () => {
  const { isLessonActive } = useDuolingoState();

  return (
    // Make this container use flex and center items
    <div
      className={`flex items-center justify-center h-full w-full ${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} rounded-lg overflow-hidden`}
    >
      {/* The SnakeLessonLayout or LessonView will be centered */}
      {isLessonActive ? <LessonView /> : <SnakeLessonLayout />}
    </div>
  );
};

// Main App component
export default function App() {
  return (
    <div className="p-1 h-full w-full">
      {" "}
      {/* Padding around the app window */}
      <DuolingoProvider>
        <DuolingoContent />
      </DuolingoProvider>
    </div>
  );
}
