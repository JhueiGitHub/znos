// app/apps/pacman/page.tsx
"use client";

import dynamic from "next/dynamic";

// Use dynamic import with no SSR to avoid Three.js DOM-related errors
const PacmanApp = dynamic(() => import("./App"), {
  ssr: false,
});

export default function PacmanPage() {
  return <PacmanApp />;
}
