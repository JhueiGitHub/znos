// /root/app/apps/driftRacer/App.tsx
"use client";

import React, { useRef, useEffect } from "react";
import DriftGame from "./components/DriftGame"; // Import the core game component

export default function App() {
  // Ref to the container div where the Three.js canvas will be mounted
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the ref is current (it should be after the initial render)
    if (mountRef.current) {
      // Potentially initialize things here if needed before DriftGame mounts,
      // but most logic will be within DriftGame itself.
    }
  }, []);

  return (
    // This div needs to fill the space provided by the Window component's content area
    // The Window component has 'flex-grow overflow-auto', so this should expand
    <div ref={mountRef} className="w-full h-full relative overflow-hidden">
      {/* The DriftGame component will handle canvas creation and mounting */}
      <DriftGame containerRef={mountRef} />
    </div>
  );
}
