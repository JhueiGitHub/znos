"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useMilanoteStore } from "./store/milanoteStore";
import { SAMPLE_BOARDS } from "./data/sampleData"; // Assuming you moved sample data to a separate file

// Import the enhanced wrapper dynamically for SSR compatibility
const EnhancedMilanoteWrapper = dynamic(
  () => import("./components/EnhancedMilanoteWrapper"),
  { ssr: false }
);

export default function App() {
  // Initialize the store with sample data
  useEffect(() => {
    // Check if boards are already initialized
    const currentBoards = useMilanoteStore.getState().boards;
    if (Object.keys(currentBoards).length === 0) {
      useMilanoteStore.setState({ boards: SAMPLE_BOARDS });
    }
  }, []);

  // Prevent browser overscroll behavior
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      html, body {
        overscroll-behavior-x: none !important;
        overflow-x: hidden;
      }
      
      .milanote-canvas {
        touch-action: pan-y pinch-zoom !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return <EnhancedMilanoteWrapper />;
}
