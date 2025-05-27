"use client";

import React from "react";
import dynamic from "next/dynamic";

const EmovereApp = dynamic(() => import("./EmovereApp"), { ssr: false });

export default function EmoverePage() {
  return <EmovereApp />;
}
