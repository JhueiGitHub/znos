// /root/app/apps/music/layout.tsx
"use client";

import { DesignSystemProvider } from "../../contexts/DesignSystemContext";
import { useStyles } from "@/app/hooks/useStyles";
import "./globals.css";

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getColor, getFont } = useStyles();

  return (
    <DesignSystemProvider>
      <div className="h-screen bg-[#010203]">
        <div className="flex h-screen overflow-hidden">{children}</div>
      </div>
    </DesignSystemProvider>
  );
}
