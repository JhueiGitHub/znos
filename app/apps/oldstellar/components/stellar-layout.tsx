// /root/app/apps/stellar/components/stellar-layout.tsx
import React from "react";
import { NavBar } from "./nav-bar";
import { Sidebar } from "./sidebar";
import { FoldersArea } from "./folders-area";
import { StatusBar } from "./status-bar";

interface StellarLayoutProps {
  currentFolderId?: string;
  path?: Array<{ id: string; name: string }>;
  onFolderNavigate?: (folderId: string) => void;
  onPathChange?: (path: Array<{ id: string; name: string }>) => void;
}

export const StellarLayout = ({
  currentFolderId,
  path = [],
  onFolderNavigate,
  onPathChange,
}: StellarLayoutProps) => {
  return (
    <div className="relative h-screen w-screen flex overflow-hidden">
      {/* Base Layer - Sidebar */}
      <div className="relative w-[240px] h-full shrink-0 z-10">
        <Sidebar />
      </div>

      {/* Content Layer */}
      <div className="relative flex-1 flex flex-col min-w-0 z-0">
        <NavBar
          currentFolderId={currentFolderId}
          path={path}
          onNavigate={onFolderNavigate}
        />
        <div className="flex-1 relative">
          <FoldersArea
            initialFolderId={currentFolderId}
            onPathChange={onPathChange}
            className="absolute inset-0"
          />
        </div>
        <StatusBar />
      </div>

      {/* Drag Layer - Always on top */}
      <div className="pointer-events-none absolute inset-0 z-50" />
    </div>
  );
};
