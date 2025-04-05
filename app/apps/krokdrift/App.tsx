// /root/app/apps/krokDrift/App.tsx - Revert to passing ref
"use client";
import React, { useRef } from "react";
import KrokGameHost from "./components/KrokGameHost";

export default function App() {
  // Use the ref again
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    // Remove the id attribute, it's not needed by KrokGameHost anymore
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-black"
    >
      {/* Pass the ref object as a prop again */}
      {containerRef.current && ( // Render host only when ref.current is available
        <KrokGameHost containerRef={containerRef} key="krok-host-drift" />
      )}
    </div>
  );
}
