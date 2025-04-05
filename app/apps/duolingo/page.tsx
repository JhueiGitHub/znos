// /root/app/apps/duolingo/page.tsx
"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the main App component to prevent SSR issues if needed
const App = dynamic(() => import("./App"), { ssr: false });

export default function DuolingoPage() {
  // This component simply renders the main App,
  // fitting the OrionOS app structure.
  return <App />;
}
