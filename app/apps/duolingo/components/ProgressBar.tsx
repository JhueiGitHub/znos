// /root/app/apps/duolingo/components/ProgressBar.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { zenith } from "../styles/zenithStyles";

interface ProgressBarProps {
  progress: number; // Percentage 0-100
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  // Ensure progress is within 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    // Reduced height for compact header
    <div
      className={`w-full h-2 ${zenith.tailwind.bgBlackGlass} rounded-full overflow-hidden border ${zenith.tailwind.borderWhiteBrd}`}
    >
      <motion.div
        className={`h-full ${zenith.tailwind.accentButtonBg} rounded-full`} // Use Latte accent
        initial={{ width: "0%" }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }} // Smoother ease
      />
    </div>
  );
};

export default ProgressBar;
