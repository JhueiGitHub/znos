// /root/app/apps/duolingo/components/exercises/MultipleChoiceExercise.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useDuolingoActions,
  useDuolingoState,
} from "../../contexts/DuolingoContext";
import { MultipleChoiceExercise as MultipleChoiceExerciseType } from "../../types/DuolingoTypes";
import { zenith } from "../../styles/zenithStyles";

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExerciseType;
}

const MultipleChoiceExercise = ({ exercise }: MultipleChoiceExerciseProps) => {
  const { submitAnswer } = useDuolingoActions();
  const { feedback } = useDuolingoState();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOption(null);
  }, [exercise]); // Reset on exercise change

  const handleSelectOption = (option: string) => {
    if (feedback.show) return;
    setSelectedOption(option);
    submitAnswer(option);
  };

  return (
    <div className="flex flex-col items-center w-full gap-3 text-center">
      <p className={`text-sm mb-1 ${zenith.tailwind.textWhite}`}>
        {exercise.prompt}
      </p>
      {exercise.questionText && (
        <p
          className={`text-base font-medium mb-2 ${zenith.tailwind.textWhite}`}
        >
          {exercise.questionText}
        </p>
        // Optional: Add speaker button if audioSrc exists
      )}

      <div className="flex flex-col gap-2 w-full">
        {exercise.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = exercise.correctAnswer === option;
          const showResult = feedback.show && isSelected;
          const showCorrectButNotSelected =
            feedback.show && !isSelected && isCorrect;

          let buttonStyle = `${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} border ${zenith.tailwind.borderWhiteBrd} hover:bg-white/10`;
          if (showResult) {
            buttonStyle = feedback.correct
              ? `${zenith.tailwind.bgCorrect} <span class="math-inline">\{zenith\.tailwind\.textWhite\} border\-\[</span>{zenith.colors.correct}]`
              : `${zenith.tailwind.bgIncorrect} <span class="math-inline">\{zenith\.tailwind\.textWhite\} border\-\[</span>{zenith.colors.incorrect}]`;
          } else if (isSelected && !feedback.show) {
            buttonStyle = `${zenith.tailwind.accentButtonBg} ${zenith.tailwind.textWhite} border ${zenith.tailwind.borderLatte}`;
          } else if (showCorrectButNotSelected) {
            buttonStyle = `border-2 border-[${zenith.colors.correct}]/80 ${zenith.tailwind.textGraphite}`;
          }

          return (
            <motion.button
              key={`<span class="math-inline">\{exercise\.id\}\-</span>{option}-${index}`}
              onClick={() => handleSelectOption(option)}
              disabled={feedback.show}
              className={`w-full p-2.5 rounded-lg text-xs sm:text-sm text-left break-words transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed ${buttonStyle}`}
              whileHover={{ scale: !feedback.show ? 1.03 : 1 }}
              whileTap={{ scale: !feedback.show ? 0.98 : 1 }}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
      {/* Reserve space at bottom for feedback banner equivalent height */}
      {!feedback.show && <div className="h-[65px]"></div>}
    </div>
  );
};

export default MultipleChoiceExercise;
