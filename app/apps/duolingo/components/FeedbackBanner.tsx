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

  if (!feedback.show) return null;

  const bgColor = feedback.correct
    ? zenith.tailwind.bgCorrect
    : zenith.tailwind.bgIncorrect;

  return (
    <div
      className={`p-4 ${bgColor} ${zenith.tailwind.textWhite} flex items-center justify-between rounded-t-lg`}
    >
      <div>
        <h3 className="font-bold text-lg">
          {feedback.correct ? "Nice!" : "Oops!"}
        </h3>
        <p>{feedback.message}</p>
      </div>
      <motion.button
        onClick={nextExercise}
        className={`px-5 py-2 ${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textWhite} rounded-lg border ${zenith.tailwind.borderWhiteBrd} hover:bg-white/20 transition-colors font-semibold`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Continue
      </motion.button>
    </div>
  );
};

export default FeedbackBanner;
