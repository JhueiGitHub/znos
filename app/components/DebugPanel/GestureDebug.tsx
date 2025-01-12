// components/DebugPanel/GestureDebug.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface GestureDebugProps {
  isCtrlPressed: boolean;
  isShiftPressed: boolean;
  swipeDirection: "none" | "left" | "right" | "up" | "down";
  swipeVelocity: number;
  isTouching: boolean;
}

export const GestureDebug = ({
  isCtrlPressed,
  isShiftPressed,
  swipeDirection,
  swipeVelocity,
  isTouching,
}: GestureDebugProps) => {
  // Log the props to debug
  React.useEffect(() => {
    console.log("GestureDebug props:", {
      isCtrlPressed,
      isShiftPressed,
      swipeDirection,
      swipeVelocity,
      isTouching,
    });
  }, [
    isCtrlPressed,
    isShiftPressed,
    swipeDirection,
    swipeVelocity,
    isTouching,
  ]);

  const panelWidth = 280;
  const panelHeight = panelWidth * (9 / 16);

  // Helper function to determine chevron style
  const getChevronStyle = (direction: "left" | "right" | "up" | "down") => {
    const isActive = swipeDirection === direction;
    return {
      opacity: isActive ? 1 : 0.4,
      scale: isActive ? 1.4 : 1,
      color: isActive ? "rgba(76, 79, 105, 1)" : "rgba(76, 79, 105, 0.6)",
    };
  };

  return (
    <AnimatePresence>
      {isCtrlPressed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-1/2 bottom-3 -translate-x-1/2 z-[9999] flex flex-col items-center justify-center"
          style={{
            width: panelWidth,
            height: panelHeight,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "19px",
            border: "0.6px solid rgba(255, 255, 255, 0.09)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Modifier Keys Row */}
          <motion.div
            className="flex gap-3 mb-4"
            animate={{ opacity: isTouching ? 1 : 0.7 }}
          >
            <motion.span
              className="text-xs"
              animate={{
                color: isCtrlPressed
                  ? "rgba(76, 79, 105, 0.95)"
                  : "rgba(76, 79, 105, 0.4)",
              }}
            >
              CTRL
            </motion.span>
            <motion.span
              className="text-xs"
              animate={{
                color: isShiftPressed
                  ? "rgba(76, 79, 105, 0.95)"
                  : "rgba(76, 79, 105, 0.4)",
              }}
            >
              SHIFT
            </motion.span>
          </motion.div>

          {/* Directional Arrows Grid */}
          <div className="grid grid-cols-3 gap-4 items-center justify-center">
            <div /> {/* Empty cell */}
            <motion.div animate={getChevronStyle("up")}>
              <ChevronUp size={24} />
            </motion.div>
            <div /> {/* Empty cell */}
            <motion.div animate={getChevronStyle("left")}>
              <ChevronLeft size={24} />
            </motion.div>
            <motion.div
              className="w-2 h-2 rounded-full"
              animate={{
                scale: isTouching ? 1.2 : 1,
                backgroundColor: isTouching
                  ? "rgba(76, 79, 105, 0.95)"
                  : "rgba(76, 79, 105, 0.4)",
              }}
            />
            <motion.div animate={getChevronStyle("right")}>
              <ChevronRight size={24} />
            </motion.div>
            <div /> {/* Empty cell */}
            <motion.div animate={getChevronStyle("down")}>
              <ChevronDown size={24} />
            </motion.div>
            <div /> {/* Empty cell */}
          </div>

          {/* Debug Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="absolute bottom-2 text-xs text-[rgba(76,79,105,0.6)]"
          >
            {swipeDirection !== "none" && (
              <span className="mr-4">Direction: {swipeDirection}</span>
            )}
            {swipeVelocity > 0 && (
              <span>{Math.round(swipeVelocity * 100) / 100} px/ms</span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
