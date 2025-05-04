"use client";

import React, { useEffect } from "react";
import { useLessonStore } from "./store/lessonStore";
import { useStyles } from "@/app/hooks/useStyles";

// Core components - we'll create these next
import LessonCanvas from "./components/canvas/Canvas";
import MainToolbar from "./components/toolbar/Toolbar";
import TabsPanel from "./components/panels/TabsPanel";
import PropertiesPanel from "./components/panels/PropertiesPanel";

export default function MilaneWPage() {
  const { getColor } = useStyles();
  const initializeStore = useLessonStore((state) => state.initialize);
  const activeTab = useLessonStore((state) => state.activeTab);
  const activeLesson = useLessonStore((state) => state.activeLesson);

  // Initialize the store with sample data on first load
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Prevent browser overscroll behavior
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      html, body {
        overscroll-behavior: none !important;
        overflow: hidden;
      }
      
      .milanew-canvas {
        touch-action: pan-y pinch-zoom !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div 
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: getColor("Night") }}
    >
      <div className="flex h-12 items-center px-4" style={{ backgroundColor: getColor("black-thick") }}>
        <h1 className="text-xl font-semibold" style={{ color: getColor("latte") }}>
          MilaneW
        </h1>
        <TabsPanel />
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        <MainToolbar />
        <LessonCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
