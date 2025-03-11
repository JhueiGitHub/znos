// app/apps/orion/page.tsx
"use client";

import React, { useEffect } from "react";
import { OrionCanvas } from "./components/Canvas";
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { useOrionStore } from "./lib/store";

export default function OrionPage() {
  const {
    canvases,
    createCanvas,
    activeCanvasId,
    setActiveCanvas,
    zoom,
    pan,
    updateViewport,
  } = useOrionStore();

  // Initialize with a canvas if none exists
  useEffect(() => {
    const canvasCount = Object.keys(canvases).length;

    if (canvasCount === 0) {
      const canvasId = createCanvas("My First Canvas");
      setActiveCanvas(canvasId);
    } else if (!activeCanvasId && canvasCount > 0) {
      // Set the first canvas as active if none is selected
      setActiveCanvas(Object.keys(canvases)[0]);
    }

    // Reset zoom and pan when the component mounts
    updateViewport(1, { x: 0, y: 0 });
  }, [canvases, createCanvas, setActiveCanvas, activeCanvasId, updateViewport]);

  return (
    <div className="w-full h-full bg-black overflow-hidden relative">
      {/* Canvas */}
      <OrionCanvas />

      {/* UI Components */}
      <Sidebar />
      <Toolbar />
    </div>
  );
}
