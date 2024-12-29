// /root/app/apps/glory/layout.tsx
"use client";

import { DesignSystemProvider } from "../../contexts/DesignSystemContext";
import { useStyles } from "@/app/hooks/useStyles";
import "./globals.css";

export default function GloryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getColor } = useStyles();

  return (
    <DesignSystemProvider>
      <div className="h-full">
        <div className="flex h-screen overflow-hidden">{children}</div>
      </div>
    </DesignSystemProvider>
  );
}
