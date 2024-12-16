import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import localFont from "next/font/local";

const exemplarPro = localFont({
  src: "../../../../public/fonts/SFProTextSemibold.ttf",
});

interface DraggedItem {
  id: string;
  name: string;
  type: "folder" | "file";
  position: { x: number; y: number };
  initialMousePosition: { x: number; y: number }; // Add this
}

export const DragLayer = () => {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleDragStart = (e: CustomEvent<DraggedItem>) => {
      console.log("Drag start event:", e.detail); // Debug log

      if (e.detail && e.detail.initialMousePosition) {
        setDraggedItem(e.detail);
        setPosition({
          x: e.detail.initialMousePosition.x,
          y: e.detail.initialMousePosition.y,
        });
      } else {
        // Fallback to default position if data is missing
        setDraggedItem(e.detail);
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleDrag = (e: DragEvent) => {
      // Update based on actual mouse movement
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleDragEnd = () => {
      setDraggedItem(null);
    };

    document.addEventListener(
      "folder-drag-start",
      handleDragStart as EventListener
    );
    document.addEventListener("drag", handleDrag);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener(
        "folder-drag-start",
        handleDragStart as EventListener
      );
      document.removeEventListener("drag", handleDrag);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [draggedItem]);

  // Only create portal when we have something to drag
  if (!draggedItem) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 pointer-events-none z-[99999]"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <motion.div
          initial={{ scale: 1.05, opacity: 0.8 }}
          animate={{ scale: 1.1, opacity: 0.9 }}
          exit={{ scale: 1, opacity: 0 }}
          className="flex flex-col items-center"
        >
          {draggedItem.type === "folder" ? (
            <>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                <img
                  src="/apps/stellar/icns/system/_folder.png"
                  alt={draggedItem.name}
                  className="w-[64px] h-[64px] object-contain"
                  draggable={false}
                />
              </div>
              <h3
                className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
                style={exemplarPro.style}
              >
                {draggedItem.name}
              </h3>
            </>
          ) : (
            <>
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src="/apps/stellar/icns/system/_file.png"
                  alt={draggedItem.name}
                  className="w-[64px] h-[64px] object-contain"
                  draggable={false}
                />
              </div>
              <h3
                className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca] mt-1"
                style={exemplarPro.style}
              >
                {draggedItem.name}
              </h3>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
