// app/apps/pacman/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useStyles } from "@/app/hooks/useStyles";

// Dynamically import the App component to avoid SSR issues with Three.js
const PacmanApp = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => <Loading />,
});

const Loading = () => {
  const { getColor } = useStyles();

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ backgroundColor: getColor("Black") }}
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg" style={{ color: getColor("Text Primary (Hd)") }}>
          Loading Pacman 3D...
        </p>
      </div>
    </div>
  );
};

export default function PacmanPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PacmanApp />
    </Suspense>
  );
}
