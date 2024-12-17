import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDrag } from "../contexts/drag-context";
import { SidebarContent } from "./sidebar/SidebarContent";

export function Sidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isDraggingFolder, isOverSidebar, setIsOverSidebar, pointerPosition } =
    useDrag();

  // Check if pointer is over sidebar during drag
  useEffect(() => {
    if (!isDraggingFolder || !pointerPosition || !sidebarRef.current) return;

    const rect = sidebarRef.current.getBoundingClientRect();
    const isOver =
      pointerPosition.x >= rect.left &&
      pointerPosition.x <= rect.right &&
      pointerPosition.y >= rect.top &&
      pointerPosition.y <= rect.bottom;

    setIsOverSidebar(isOver);
  }, [isDraggingFolder, pointerPosition, setIsOverSidebar]);

  return (
    <div
      ref={sidebarRef}
      className="relative w-48 bg-black border-r border-[#29292981]"
    >
      {/* Drag highlight overlay */}
      <AnimatePresence>
        {isDraggingFolder && isOverSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#4C4F69]/20 border-2 border-dashed border-[#4C4F69]/40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Sidebar content */}
      <SidebarContent />
    </div>
  );
}
