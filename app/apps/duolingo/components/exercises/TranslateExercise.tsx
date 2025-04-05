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
  const [availableWords, setAvailableWords] = useState<
    { word: string; index: number }[]
  >([]); // Store original index

  // Shuffle options and reset on exercise change
  useEffect(() => {
    setAvailableWords(
      [...exercise.options]
        .map((word, index) => ({ word, index })) // Keep original index for stable keys
        .sort(() => Math.random() - 0.5)
    );
    setSelectedWords([]);
  }, [exercise]);

  const handleSelectWord = (wordObj: { word: string; index: number }) => {
    if (feedback.show) return;
    setSelectedWords((prev) => [...prev, wordObj.word]);
    setAvailableWords((prev) => prev.filter((w) => w.index !== wordObj.index)); // Remove based on original index
  };

  const handleDeselectWord = (word: string, selectedIndex: number) => {
    if (feedback.show) return;
    const originalWordObj = [...exercise.options]
      .map((w, i) => ({ word: w, index: i }))
      .find(
        (w) =>
          w.word === word &&
          selectedWords.filter((sw) => sw === word).length ===
            availableWords.filter((aw) => aw.word === word).length + 1
      ); // Complex logic to find original if duplicates exist - Simplified: Assume first match

    const wordToAddBack = [...exercise.options]
      .map((w, i) => ({ word: w, index: i }))
      .find(
        (obj) =>
          obj.word === word &&
          !availableWords.some((aw) => aw.index === obj.index)
      );

    setSelectedWords((prev) => prev.filter((_, i) => i !== selectedIndex));
    // Add back to available words if found
    if (wordToAddBack) {
      setAvailableWords((prev) =>
        [...prev, wordToAddBack].sort(() => Math.random() - 0.5)
      ); // Add back and shuffle slightly
    } else {
      console.warn("Could not find original word to add back:", word); // Fallback if logic fails
      setAvailableWords((prev) => [
        ...prev,
        { word: word, index: Math.random() },
      ]); // Add back with random index as fallback
    }
  };

  const handleSubmit = () => {
    if (selectedWords.length > 0 && !feedback.show) {
      submitAnswer(selectedWords); // Submit the array of selected words in order
    }
  };

  const isSubmitDisabled = selectedWords.length === 0 || feedback.show;

  return (
    // Compact layout for narrow view
    <div className="flex flex-col items-center w-full gap-3 text-center">
      {/* Prompt and Text to Translate */}
      <div className="w-full">
        <p className={`text-xs mb-1 ${zenith.tailwind.textGraphite}/80`}>
          {exercise.prompt}
        </p>
        <p className={`text-base font-medium ${zenith.tailwind.textWhite}`}>
          {exercise.textToTranslate || exercise.prompt}{" "}
          {/* Show textToTranslate if available */}
        </p>
        {/* Optional: Add small speaker button here if audioSrc exists */}
      </div>

      {/* Answer Construction Area */}
      {/* Reduced height and padding, increased wrapping */}
      <div
        className={`flex flex-wrap gap-1 items-center justify-center p-2 mb-2 min-h-[45px] w-full border-b ${zenith.tailwind.borderGraphiteThin} ${feedback.show ? "opacity-70" : ""}`}
      >
        {selectedWords.map((word, index) => (
          <motion.button
            key={`sel-<span class="math-inline">\{word\}\-</span>{index}`} // Ensure unique key
            onClick={() => handleDeselectWord(word, index)}
            className={`px-2 py-1 text-xs ${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} rounded border ${zenith.tailwind.borderWhiteBrd} cursor-pointer hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={feedback.show}
            layout // Animate position changes
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {word}
          </motion.button>
        ))}
        {selectedWords.length === 0 && (
          <span className={`text-xs italic ${zenith.tailwind.textGraphite}/54`}>
            Tap words below...
          </span>
        )}
      </div>

      {/* Word Bank Area */}
      {/* Increased wrapping, smaller buttons */}
      <div
        className={`flex flex-wrap gap-1.5 justify-center mb-3 w-full ${feedback.show ? "opacity-50" : ""}`}
      >
        {availableWords.map((wordObj) => (
          <motion.button
            key={`avail-${wordObj.index}`} // Use stable original index
            onClick={() => handleSelectWord(wordObj)}
            className={`px-2 py-1 text-xs ${zenith.tailwind.accentButtonBg} ${zenith.tailwind.textWhite} rounded border <span class="math-inline">\{zenith\.tailwind\.borderWhiteBrd\} cursor\-pointer hover\:</span>{zenith.tailwind.accentButtonHoverBg} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:${zenith.tailwind.accentButtonBg}`}
            whileHover={{ scale: !feedback.show ? 1.05 : 1 }}
            whileTap={{ scale: !feedback.show ? 0.95 : 1 }}
            disabled={feedback.show}
          >
            {wordObj.word}
          </motion.button>
        ))}
      </div>

      {/* Submit Button Area (only shown when feedback banner isn't) */}
      <div className="w-full h-[40px]">
        {" "}
        {/* Reserve space */}
        {!feedback.show && (
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-full px-4 py-2 text-sm ${zenith.tailwind.accentButtonBg} <span class="math-inline">\{zenith\.tailwind\.textWhite\} rounded\-lg shadow\-sm transition\-colors duration\-200 ease\-in\-out hover\:</span>{zenith.tailwind.accentButtonHoverBg} border <span class="math-inline">\{zenith\.tailwind\.borderWhiteBrd\} focus\:outline\-none focus\:ring\-1 focus\:ring\-offset\-1 focus\:ring\-offset\-\[</span>{zenith.colors.black}] focus:ring-[<span class="math-inline">\{zenith\.colors\.latte\}\] disabled\:opacity\-50 disabled\:cursor\-not\-allowed disabled\:hover\:</span>{zenith.tailwind.accentButtonBg}`}
            whileHover={{ scale: !isSubmitDisabled ? 1.03 : 1 }}
            whileTap={{ scale: !isSubmitDisabled ? 0.97 : 1 }}
          >
            Check
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default TranslateExercise;
