"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import the page component with dynamic to disable SSR
// This is important for canvas-based applications to avoid hydration issues
const MilanotePage = dynamic(() => import("./page"), { ssr: false });

export default function App() {
  return <MilanotePage />;
}
