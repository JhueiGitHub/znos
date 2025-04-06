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
import LessonComplete from "./LessonCompleteOld";
import { Exercise } from "../types/DuolingoTypes";
import { zenith } from "../styles/zenithStyles";
import TranslateExercise from "./exercises/TranslateExerciseOld";
import MultipleChoiceExercise from "./exercises/MultipleChoiceExerciseOld";
import MatchPairsExercise from "./exercises/MatchPairsExerciseOld";

// Compact Back Arrow Icon
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="size-5"
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
  const { exitLesson } = useDuolingoActions();

  // Early exit if no lesson is active (shouldn't happen with current logic, but safe)
  if (!currentLesson)
    return (
      <div
        className={`flex items-center justify-center h-full ${zenith.tailwind.textGraphite} text-sm`}
      >
        No active lesson.
      </div>
    );

  // Render Completion Screen if lesson is complete
  if (isLessonComplete) {
    return <LessonComplete />; // Ensure this is also styled for narrow view
  }

  const exercise: Exercise | undefined =
    currentLesson.exercises[currentExerciseIndex];
  const progress =
    currentLesson.exercises.length > 0
      ? ((currentExerciseIndex + 1) / currentLesson.exercises.length) * 100
      : 0; // Show progress based on completed steps

  const renderExercise = () => {
    if (!exercise)
      return (
        <div
          className={`${zenith.tailwind.textGraphite} text-center p-4 text-sm`}
        >
          End of lesson?
        </div>
      );

    switch (exercise.type) {
      case "TRANSLATE_TO_ITALIAN":
      case "TRANSLATE_TO_ENGLISH":
        return <TranslateExercise key={exercise.id} exercise={exercise} />;
      case "MULTIPLE_CHOICE_TRANSLATE":
        return <MultipleChoiceExercise key={exercise.id} exercise={exercise} />;
      case "MATCH_PAIRS":
        // Needs careful styling for narrow view
        return <MatchPairsExercise key={exercise.id} exercise={exercise} />;
      default:
        // Assert exhaustiveness check (optional)
        // const _exhaustiveCheck: never = exercise;
        return (
          <div className="text-red-500 text-xs p-2">
            Error: Unknown exercise type: {(exercise as any).type}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative text-xs sm:text-sm">
      {/* Header */}
      <div
        className={`flex items-center p-2 border-b ${zenith.tailwind.borderWhiteBrd} gap-2 flex-shrink-0`}
      >
        <button
          onClick={exitLesson}
          className={`p-1 ${zenith.tailwind.textGraphite} hover:text-[${zenith.colors.white}] rounded-md hover:bg-white/10 transition-colors`}
          aria-label="Back"
          title="Back to Lessons"
        >
          <BackArrowIcon />
        </button>
        <div className="flex-grow">
          <ProgressBar progress={progress} />
        </div>
      </div>

      {/* Exercise Content Area (Scrolls if needed, though exercises should be compact) */}
      <div className="flex-grow flex flex-col justify-center p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-latte/30 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExerciseIndex} // Animate based on index change
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {renderExercise()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Feedback Area */}
      <div className="flex-shrink-0 h-[65px]">
        {" "}
        {/* Reserve consistent space */}
        <AnimatePresence>
          {feedback.show && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-10" // Ensure feedback is on top
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
    </div>
  );
};

export default LessonView;
