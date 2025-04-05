// /root/app/apps/duolingo/components/LessonView.tsx
"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useDuolingoState,
  useDuolingoActions,
} from "../contexts/DuolingoContext";
import ProgressBar from "./ProgressBar";
import FeedbackBanner from "./FeedbackBanner";
import LessonComplete from "./LessonComplete"; // Import LessonComplete
import { Exercise } from "../types/DuolingoTypes";
import { zenith } from "../styles/zenithStyles";

// Import specific exercise components
import TranslateExercise from "./exercises/TranslateExercise";
import MultipleChoiceExercise from "./exercises/MultipleChoiceExercise";
import MatchPairsExercise from "./exercises/MatchPairsExercise";

const LessonView = () => {
  const { currentLesson, currentExerciseIndex, feedback, isLessonComplete } =
    useDuolingoState();
  const { exitLesson } = useDuolingoActions();

  if (!currentLesson) return null; // Should not happen if isLessonActive is true, but good practice

  if (isLessonComplete) {
    return <LessonComplete />; // Show completion screen
  }

  const exercise: Exercise = currentLesson.exercises[currentExerciseIndex];
  const progress =
    (currentExerciseIndex / currentLesson.exercises.length) * 100;

  const renderExercise = () => {
    switch (exercise.type) {
      case "TRANSLATE_TO_ITALIAN":
      case "TRANSLATE_TO_ENGLISH":
        return <TranslateExercise key={exercise.id} exercise={exercise} />;
      case "MULTIPLE_CHOICE_TRANSLATE":
        return <MultipleChoiceExercise key={exercise.id} exercise={exercise} />;
      case "MATCH_PAIRS":
        return <MatchPairsExercise key={exercise.id} exercise={exercise} />;
      // Add cases for other exercise types
      default:
        return <div>Unsupported exercise type</div>;
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header Area */}
      <div
        className={`flex items-center p-4 border-b ${zenith.tailwind.borderWhiteBrd}`}
      >
        <button
          onClick={exitLesson}
          className={`mr-4 text-2xl <span class="math-inline">\{zenith\.tailwind\.textGraphite\} hover\:text\-\[</span>{zenith.colors.white}] transition-colors`}
          aria-label="Exit Lesson"
        >
          &times; {/* Simple X icon */}
        </button>
        <ProgressBar progress={progress} />
      </div>

      {/* Exercise Area */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-10">
        <AnimatePresence mode="wait">
          {" "}
          {/* Use mode="wait" for smooth transitions */}
          <motion.div
            key={currentExerciseIndex} // Key change triggers animation
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-3xl" // Limit width for better readability
          >
            {renderExercise()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback Banner Area */}
      <AnimatePresence>
        {feedback.show && (
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <FeedbackBanner />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonView;
