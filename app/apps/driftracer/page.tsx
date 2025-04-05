// /root/app/apps/driftRacer/page.tsx
"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the main App component to ensure it runs client-side
const App = dynamic(() => import("./App"), {
  ssr: false, // Crucial for Three.js which needs window/document
  loading: () => <p className="p-4 text-center">Loading Drift Racer...</p>, // Basic loading indicator
});

export default function DriftRacerPage() {
  // Render the client-side App component
  return <App />;
}
