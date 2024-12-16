// /root/app/apps/stellar/components/sidebar.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDragContext } from "../contexts/drag-context";

export function Sidebar() {
  const { isDragging, draggedItemType } = useDragContext();
  const [isDropTarget, setIsDropTarget] = React.useState(false);

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging && draggedItemType === "folder") {
        setIsDropTarget(true);
      }
    },
    [isDragging, draggedItemType]
  );

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDropTarget(false);
    }
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
    const folderId = e.dataTransfer.getData("text/folder-id");
    if (folderId) {
      console.log("Folder dropped in sidebar:", folderId);
      // Will implement folder sidebar addition later
    }
  }, []);

  return (
    <div className="relative h-full shrink-0" style={{ width: 240 }}>
      {/* Fixed positioning container */}
      <div className="fixed top-0 bottom-0" style={{ width: 240 }}>
        {/* Main sidebar content */}
        <div
          className="h-full bg-black/30"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Highlight overlay */}
          <AnimatePresence>
            {isDropTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 rounded-lg pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
