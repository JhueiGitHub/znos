// app/apps/pacman/layout.tsx
"use client";

import React from "react";
import "./globals.css";

export default function PacmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full w-full overflow-hidden">{children}</div>;
}
