import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  showText?: boolean;
  className?: string;
}

export default function SaveStatusIndicator({
  status,
  showText = false,
  className = "",
}: SaveStatusIndicatorProps) {
  // Track mounted state to prevent state updates during unmount
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "saving":
        return "bg-yellow-500";
      case "saved":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Error saving";
      default:
        return "";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`h-3 w-3 rounded-full ${getStatusColor()}`}
        />
        {showText && status !== "idle" && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-xs text-white/70"
          >
            {getStatusText()}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
