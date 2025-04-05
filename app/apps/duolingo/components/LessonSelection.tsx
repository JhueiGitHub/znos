// /root/app/apps/duolingo/components/LessonSelection.tsx
"use client";
import React from "react";
import {
  useDuolingoState,
  useDuolingoActions,
} from "../contexts/DuolingoContext";
import { motion } from "framer-motion";
import { zenith } from "../styles/zenithStyles";

const LessonSelection = () => {
  const { lessons } = useDuolingoState();
  const { startLesson } = useDuolingoActions();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-3xl mb-10 ${zenith.tailwind.textWhite}`} // Use white or brighter graphite for titles
      >
        Choose a Lesson (Italiano!)
      </motion.h1>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
      >
        {lessons.map((lesson) => (
          <motion.button
            key={lesson.id}
            onClick={() => startLesson(lesson.id)}
            className={`px-6 py-4 ${zenith.tailwind.accentButtonBg} <span class="math-inline">\{zenith\.tailwind\.textWhite\} rounded\-xl shadow\-lg transition\-colors duration\-200 ease\-in\-out hover\:</span>{zenith.tailwind.accentButtonHoverBg} border <span class="math-inline">\{zenith\.tailwind\.borderWhiteBrd\} focus\:outline\-none focus\:ring\-2 focus\:ring\-offset\-2 focus\:ring\-offset\-\[</span>{zenith.colors.black}] focus:ring-[${zenith.colors.latte}]`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {lesson.title}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default LessonSelection;
