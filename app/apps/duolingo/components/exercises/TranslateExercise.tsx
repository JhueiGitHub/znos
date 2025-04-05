// /root/app/apps/duolingo/components/exercises/TranslateExercise.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useDuolingoActions,
  useDuolingoState,
} from "../../contexts/DuolingoContext";
import { TranslateExercise as TranslateExerciseType } from "../../types/DuolingoTypes";
import { zenith } from "../../styles/zenithStyles";

interface TranslateExerciseProps {
  exercise: TranslateExerciseType;
}

const TranslateExercise = ({ exercise }: TranslateExerciseProps) => {
  const { submitAnswer } = useDuolingoActions();
  const { feedback } = useDuolingoState();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // Shuffle options on mount or when exercise changes
  useEffect(() => {
    setAvailableWords([...exercise.options].sort(() => Math.random() - 0.5));
    setSelectedWords([]); // Reset selection when exercise changes
  }, [exercise]);

  const handleSelectWord = (word: string, index: number) => {
    if (feedback.show) return; // Don't allow changes after submission
    setSelectedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeselectWord = (word: string, index: number) => {
    if (feedback.show) return; // Don't allow changes after submission
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    // Find original position if needed or just add back
    setAvailableWords((prev) => [...prev, word]); // Simplest way: add back to end
  };

  const handleSubmit = () => {
    if (selectedWords.length > 0 && !feedback.show) {
      submitAnswer(selectedWords); // Submit the array of words
    }
  };

  const isSubmitDisabled = selectedWords.length === 0 || feedback.show;

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className={`text-xl md:text-2xl mb-6 ${zenith.tailwind.textWhite}`}>
        {exercise.prompt}
      </h2>

      {/* Area for building the answer */}
      <div
        className={`flex flex-wrap gap-2 items-center justify-center p-4 mb-6 min-h-[60px] w-full max-w-xl border-b-2 ${zenith.tailwind.borderGraphiteThin} ${feedback.show ? "opacity-70" : ""}`}
      >
        {selectedWords.map((word, index) => (
          <motion.button
            key={`<span class="math-inline">\{word\}\-</span>{index}`} // Ensure unique key if words repeat
            onClick={() => handleDeselectWord(word, index)}
            className={`px-3 py-1 ${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} rounded-lg border ${zenith.tailwind.borderWhiteBrd} cursor-pointer hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={feedback.show}
            layout // Animate position changes
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {word}
          </motion.button>
        ))}
        {selectedWords.length === 0 && (
          <span className={`italic ${zenith.tailwind.textGraphite}/54`}>
            Select words below...
          </span>
        )}
      </div>

      {/* Word Bank Area */}
      <div
        className={`flex flex-wrap gap-3 justify-center mb-8 w-full max-w-xl ${feedback.show ? "opacity-50" : ""}`}
      >
        {availableWords.map((word, index) => (
          <motion.button
            key={`<span class="math-inline">\{word\}\-</span>{index}-avail`}
            onClick={() => handleSelectWord(word, index)}
            className={`px-3 py-1 ${zenith.tailwind.accentButtonBg} ${zenith.tailwind.textWhite} rounded-lg border <span class="math-inline">\{zenith\.tailwind\.borderWhiteBrd\} cursor\-pointer hover\:</span>{zenith.tailwind.accentButtonHoverBg} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:${zenith.tailwind.accentButtonBg}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={feedback.show}
          >
            {word}
          </motion.button>
        ))}
      </div>

      {/* Submit Button - Appears only outside feedback banner */}
      {!feedback.show && (
        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full max-w-xs px-6 py-3 ${zenith.tailwind.accentButtonBg} <span class="math-inline">\{zenith\.tailwind\.textWhite\} rounded\-xl shadow\-lg transition\-colors duration\-200 ease\-in\-out hover\:</span>{zenith.tailwind.accentButtonHoverBg} border <span class="math-inline">\{zenith\.tailwind\.borderWhiteBrd\} focus\:outline\-none focus\:ring\-2 focus\:ring\-offset\-2 focus\:ring\-offset\-\[</span>{zenith.colors.black}] focus:ring-[<span class="math-inline">\{zenith\.colors\.latte\}\] disabled\:opacity\-50 disabled\:cursor\-not\-allowed disabled\:hover\:</span>{zenith.tailwind.accentButtonBg}`}
          whileHover={{ scale: !isSubmitDisabled ? 1.05 : 1 }}
          whileTap={{ scale: !isSubmitDisabled ? 0.95 : 1 }}
        >
          Check
        </motion.button>
      )}
    </div>
  );
};

export default TranslateExercise;
