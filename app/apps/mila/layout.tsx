"use client";

import React from "react";
import { DesignSystemProvider } from "@/app/contexts/DesignSystemContext";
import "./styles/globals.css";

export default function MilanoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesignSystemProvider>
      <div className="h-screen w-screen overflow-hidden">{children}</div>
    </DesignSystemProvider>
  );
}
