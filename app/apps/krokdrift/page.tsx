// /root/app/apps/krokDrift/page.tsx - No change from previous
"use client";
import React from "react";
import dynamic from "next/dynamic";
const App = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => (
    <p className="p-4 text-center text-white">
      Loading Krok Drifting Experience...
    </p>
  ),
});
export default function KrokDriftPage() {
  return <App />;
}
