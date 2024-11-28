"use client";

import dynamic from "next/dynamic";
import React from "react";

/**
 * Disable SSR to avoid pre-rendering issues
 *
 * We're doing this because we're creating a pure client-side testing environment
 */
const App = dynamic(() => import("./App"), { ssr: false });

export default function MacOSIconsPage() {
  return <App />;
}
