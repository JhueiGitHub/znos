// page.tsx
"use client";
import React from "react";

import dynamic from "next/dynamic";

const App = dynamic(() => import("./App"), { ssr: false });

export default function StellarPage() {
  return <App />;
}
