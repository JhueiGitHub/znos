// /root/app/apps/duolingo/components/exercises/MultipleChoiceExercise.tsx
"use client";
import React, { useState } from "react";
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

  const handleSelectOption = (option: string) => {
    if (feedback.show) return; // Don't allow changes after submission
    setSelectedOption(option);
    // Submit immediately for multiple choice
    submitAnswer(option);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2
        className={`text-xl md:text-2xl mb-8 text-center ${zenith.tailwind.textWhite}`}
      >
        {exercise.prompt}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        {exercise.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = exercise.correctAnswer === option;
          const showResult = feedback.show && isSelected; // Show result styling only on the selected option after feedback

          let buttonStyle = `${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} border ${zenith.tailwind.borderWhiteBrd} hover:bg-white/10`; // Default
          if (showResult) {
            buttonStyle = feedback.correct
              ? `${zenith.tailwind.bgCorrect} <span class="math-inline">\{zenith\.tailwind\.textWhite\} border\-\[</span>{zenith.colors.correct}]`
              : `${zenith.tailwind.bgIncorrect} <span class="math-inline">\{zenith\.tailwind\.textWhite\} border\-\[</span>{zenith.colors.incorrect}]`;
          } else if (isSelected && !feedback.show) {
            buttonStyle = `${zenith.tailwind.accentButtonBg} ${zenith.tailwind.textWhite} border ${zenith.tailwind.borderLatte}`; // Highlight selection before submit
          } else if (feedback.show && isCorrect) {
            // Optionally highlight the correct answer even if not selected
            // buttonStyle = `${zenith.tailwind.bgCorrect}/54 <span class="math-inline">\{zenith\.tailwind\.textWhite\} border\-\[</span>{zenith.colors.correct}]/54`; // Faded correct highlight
          }

          return (
            <motion.button
              key={index}
              onClick={() => handleSelectOption(option)}
              disabled={feedback.show}
              className={`w-full p-4 rounded-xl text-left text-lg transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed ${buttonStyle}`}
              whileHover={{ scale: !feedback.show ? 1.03 : 1 }}
              whileTap={{ scale: !feedback.show ? 0.97 : 1 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
      {/* No separate submit button needed as selection triggers submission */}
    </div>
  );
};

export default MultipleChoiceExercise;
