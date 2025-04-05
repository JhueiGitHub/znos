// /root/app/apps/duolingo/components/ProgressBar.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { zenith } from "../styles/zenithStyles";

interface ProgressBarProps {
  progress: number; // Percentage 0-100
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div
      className={`w-full h-3 ${zenith.tailwind.bgBlackGlass} rounded-full overflow-hidden border ${zenith.tailwind.borderWhiteBrd}`}
    >
      <motion.div
        className={`h-full ${zenith.tailwind.accentButtonBg} rounded-full`} // Use Latte accent for progress
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ProgressBar;
