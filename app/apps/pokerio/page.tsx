"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the Hub component to avoid SSR issues with Three.js
const PokerHub = dynamic(() => import("./Hub"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#115f13]">
      <div className="text-white">Loading Poker...</div>
    </div>
  ),
});

export default function PokerIOApp() {
  return (
    <div className="poker-app w-full h-full overflow-hidden">
      <PokerHub />
    </div>
  );
}
