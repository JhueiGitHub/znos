// /root/app/apps/duolingo/components/FeedbackBanner.tsx
"use client";
import React from "react";
import {
  useDuolingoState,
  useDuolingoActions,
} from "../contexts/DuolingoContext";
import { motion } from "framer-motion";
import { zenith } from "../styles/zenithStyles";

const FeedbackBanner = () => {
  const { feedback } = useDuolingoState();
  const { nextExercise } = useDuolingoActions();

  // Note: This component assumes it's absolutely positioned by its parent (LessonView)
  if (!feedback.show) return null;

  const bgColor = feedback.correct
    ? zenith.tailwind.bgCorrect
    : zenith.tailwind.bgIncorrect;
  const title = feedback.correct ? "Correct!" : "Incorrect";

  return (
    // Compact padding and text size
    <div
      className={`p-2 ${bgColor} ${zenith.tailwind.textWhite} flex flex-col items-center justify-between rounded-t-lg min-h-[65px]`}
    >
      <div className="w-full mb-1 text-center">
        <h3 className="font-bold text-sm">{title}</h3>
        {/* Show feedback message if available and different from title */}
        {feedback.message && feedback.message !== title && (
          <p className="text-xs opacity-90">{feedback.message}</p>
        )}
      </div>
      {/* Compact Button */}
      <motion.button
        onClick={nextExercise}
        className={`w-full max-w-[160px] px-3 py-1.5 text-sm font-semibold ${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textWhite} rounded-lg border ${zenith.tailwind.borderWhiteBrd} hover:bg-white/20 transition-colors`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Continue
      </motion.button>
    </div>
  );
};

export default FeedbackBanner;
