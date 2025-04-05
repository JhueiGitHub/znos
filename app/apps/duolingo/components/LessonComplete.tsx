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

  if (!currentLesson) return null; // Should have a lesson context here

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full p-8 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
    >
      <motion.div
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
        className={`text-6xl mb-6`} // Can add an icon later
      >
        🎉
      </motion.div>
      <h2 className={`text-3xl font-bold ${zenith.tailwind.textWhite} mb-2`}>
        Lesson Complete!
      </h2>
      <p className={`${zenith.tailwind.textGraphite} mb-8 text-lg`}>
        You finished "{currentLesson.title}"
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={retryLesson}
          className={`px-6 py-3 bg-white/10 ${zenith.tailwind.textGraphite} rounded-xl shadow-lg transition-colors duration-200 ease-in-out hover:bg-white/20 border <span class="math-inline">\{zenith\.tailwind\.borderWhiteBrd\} focus\:outline\-none focus\:ring\-2 focus\:ring\-offset\-2 focus\:ring\-offset\-\[</span>{zenith.colors.black}] focus:ring-[${zenith.colors.white}]/50`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retry Lesson
        </motion.button>
        <motion.button
          onClick={exitLesson}
          className={`px-6 py-3 ${zenith.tailwind.accentButtonBg} <span class="math-inline">\{zenith\.tailwind\.textWhite\} rounded\-xl shadow\-lg transition\-colors duration\-200 ease\-in\-out hover\:</span>{zenith.tailwind.accentButtonHoverBg} border <span class="math-inline">\{zenith\.tailwind\.borderWhiteBrd\} focus\:outline\-none focus\:ring\-2 focus\:ring\-offset\-2 focus\:ring\-offset\-\[</span>{zenith.colors.black}] focus:ring-[${zenith.colors.latte}]`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Lessons
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LessonComplete;
