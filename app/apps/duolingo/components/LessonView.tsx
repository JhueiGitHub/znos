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
import LessonComplete from "./LessonComplete";
import { Exercise } from "../types/DuolingoTypes";
import { zenith } from "../styles/zenithStyles";
import TranslateExercise from "./exercises/TranslateExercise";
import MultipleChoiceExercise from "./exercises/MultipleChoiceExercise";
import MatchPairsExercise from "./exercises/MatchPairsExercise";

// Simple Back Arrow Icon
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5 8.25 12l7.5-7.5"
    />
  </svg>
);

const LessonView = () => {
  const { currentLesson, currentExerciseIndex, feedback, isLessonComplete } =
    useDuolingoState();
  const { exitLesson } = useDuolingoActions(); // Use exitLesson for back button

  if (!currentLesson) return null;
  if (isLessonComplete) {
    return <LessonComplete />;
  }

  const exercise: Exercise = currentLesson.exercises[currentExerciseIndex];
  const progress =
    (currentExerciseIndex / currentLesson.exercises.length) * 100;

  const renderExercise = () => {
    // ... (renderExercise switch statement remains the same)
    switch (exercise.type) {
      case "TRANSLATE_TO_ITALIAN":
      case "TRANSLATE_TO_ENGLISH":
        return <TranslateExercise key={exercise.id} exercise={exercise} />;
      case "MULTIPLE_CHOICE_TRANSLATE":
        return <MultipleChoiceExercise key={exercise.id} exercise={exercise} />;
      case "MATCH_PAIRS":
        return <MatchPairsExercise key={exercise.id} exercise={exercise} />;
      default:
        return <div>Unsupported exercise type</div>;
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header Area - Updated with Back Button */}
      <div
        className={`flex items-center p-3 border-b ${zenith.tailwind.borderWhiteBrd}`}
      >
        {/* Back Button */}
        <button
          onClick={exitLesson} // Use exitLesson action
          className={`p-1 mr-3 ${zenith.tailwind.textGraphite} hover:text-[${zenith.colors.white}] rounded-md hover:bg-white/10 transition-colors`}
          aria-label="Back to Lessons"
        >
          <BackArrowIcon />
        </button>
        {/* Progress Bar */}
        <div className="flex-grow">
          <ProgressBar progress={progress} />
        </div>
      </div>

      {/* Exercise Area (no changes needed here) */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExerciseIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-3xl"
          >
            {renderExercise()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback Banner Area (no changes needed here) */}
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
