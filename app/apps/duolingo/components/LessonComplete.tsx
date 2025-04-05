// /root/app/apps/duolingo/components/LessonComplete.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  useDuolingoState,
  useDuolingoActions,
} from "../contexts/DuolingoContext";
import { zenith } from "../styles/zenithStyles";

const LessonComplete = () => {
  const { currentLesson } = useDuolingoState();
  const { exitLesson, retryLesson } = useDuolingoActions();

  if (!currentLesson) return null;

  return (
    <motion.div
      // Full height flex column for narrow view
      className="flex flex-col items-center justify-center h-full p-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "backOut" }}
    >
      {/* Smaller Icon */}
      <motion.div
        initial={{ rotate: -15, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
        className={`text-4xl mb-3`}
      >
        🎉
      </motion.div>
      {/* Smaller Text */}
      <h2 className={`text-xl font-bold ${zenith.tailwind.textWhite} mb-1`}>
        Lesson Complete!
      </h2>
      <p className={`${zenith.tailwind.textGraphite} mb-4 text-xs`}>
        Finished "{currentLesson.title}"
      </p>

      {/* Buttons stacked vertically */}
      <div className="flex flex-col gap-3 w-full max-w-[150px]">
        <motion.button
          onClick={retryLesson}
          // Compact button style
          className={`w-full px-4 py-2 text-sm bg-white/10 ${zenith.tailwind.textGraphite} rounded-lg shadow-sm transition-colors duration-200 ease-in-out hover:bg-white/20 border ${zenith.tailwind.borderWhiteBrd}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retry
        </motion.button>
        <motion.button
          onClick={exitLesson}
          // Compact button style
          className={`w-full px-4 py-2 text-sm ${zenith.tailwind.accentButtonBg} <span class="math-inline">\{zenith\.tailwind\.textWhite\} rounded\-lg shadow\-sm transition\-colors duration\-200 ease\-in\-out hover\:</span>{zenith.tailwind.accentButtonHoverBg} border ${zenith.tailwind.borderWhiteBrd}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue Path
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LessonComplete;
