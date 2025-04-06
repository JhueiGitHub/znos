// /root/app/apps/duolingo/components/exercises/TranslateExercise.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranslateExercise as TranslateExerciseType } from "../../types/DuolingoTypes";
import { VolumeIcon } from "lucide-react";
import { playAudio } from "../../utils/audioUtils";

interface Props {
  exercise: TranslateExerciseType;
  onAnswer: (answer: string[]) => void;
  userAnswer: string[] | null;
  isChecking: boolean;
  showFeedback: boolean;
}

const TranslateExercise: React.FC<Props> = ({
  exercise,
  onAnswer,
  userAnswer = [],
  isChecking,
  showFeedback,
}) => {
  // Local state for word banks
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>([]);

  // Initialize tiles on component mount
  useEffect(() => {
    // Reset selections when exercise changes
    setSelectedTiles(userAnswer || []);

    // Filter out already selected tiles from available ones
    const selected = userAnswer || [];
    const available = exercise.options.filter(
      (word) => !selected.includes(word)
    );

    // Shuffle available tiles
    setAvailableTiles(shuffleArray(available));

    // Play audio if available
    if (exercise.audioSrc) {
      playAudio(exercise.audioSrc);
    }
  }, [exercise, userAnswer]);

  // Function to shuffle array
  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Handle selecting a tile from the word bank
  const handleTileSelect = (tile: string, index: number) => {
    if (isChecking) return;

    // Add to selected tiles
    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    // Remove from available tiles
    const newAvailable = [...availableTiles];
    newAvailable.splice(index, 1);
    setAvailableTiles(newAvailable);

    // Update parent component
    onAnswer(newSelected);
  };

  // Handle removing a tile from the selection
  const handleTileRemove = (tile: string, index: number) => {
    if (isChecking) return;

    // Remove from selected tiles
    const newSelected = [...selectedTiles];
    newSelected.splice(index, 1);
    setSelectedTiles(newSelected);

    // Add back to available tiles
    const newAvailable = [...availableTiles, tile];
    setAvailableTiles(newAvailable);

    // Update parent component
    onAnswer(newSelected.length > 0 ? newSelected : []);
  };

  // Play audio when the button is clicked
  const handleAudioClick = () => {
    if (exercise.audioSrc) {
      playAudio(exercise.audioSrc);
    }
  };

  // Determine if the current answer is correct
  const isCorrect = (): boolean => {
    if (!showFeedback) return false;

    const selectedAnswer = selectedTiles.join(" ").toLowerCase();
    const correctAnswer = exercise.correctAnswerTiles.join(" ").toLowerCase();
    return selectedAnswer === correctAnswer;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Text to translate */}
      <div className="mb-4">
        <motion.div
          className="inline-block px-3 py-1 rounded-full bg-[#A560FF]/20 text-[#A560FF] text-xs font-bold mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {exercise.type === "TRANSLATE_TO_ITALIAN" ? "ITALIAN" : "ENGLISH"}
        </motion.div>

        <div className="flex items-center">
          <motion.button
            className="mr-2 p-1.5 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            onClick={handleAudioClick}
          >
            <VolumeIcon size={18} className="text-[#A560FF]" />
          </motion.button>
          <motion.div
            className="text-lg font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {exercise.textToTranslate || exercise.prompt}
          </motion.div>
        </div>

        <motion.p
          className="text-white/60 mt-2 mb-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {exercise.type === "TRANSLATE_TO_ITALIAN"
            ? "Translate to Italian"
            : "Translate to English"}
        </motion.p>
      </div>

      {/* Selected word area */}
      <motion.div
        className={`
          min-h-[80px] p-3 mb-4 rounded-lg border flex flex-wrap gap-2 items-start content-start
          ${
            showFeedback
              ? isCorrect()
                ? "border-[#58CC02] bg-[#58CC02]/10"
                : "border-[#FF4B4B] bg-[#FF4B4B]/10"
              : "border-white/10 bg-[#1A1D2B]"
          }
        `}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence mode="popLayout">
          {selectedTiles.map((tile, index) => (
            <motion.div
              key={`selected-${tile}-${index}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`
                px-3 py-1.5 rounded-lg text-white text-sm cursor-pointer
                ${
                  showFeedback
                    ? isCorrect()
                      ? "bg-[#58CC02]"
                      : "bg-[#FF4B4B]"
                    : "bg-[#2E3856]"
                }
              `}
              onClick={() => !isChecking && handleTileRemove(tile, index)}
              whileHover={{ scale: isChecking ? 1 : 1.05 }}
              whileTap={{ scale: isChecking ? 1 : 0.95 }}
            >
              {tile}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center mt-auto">
        <AnimatePresence mode="popLayout">
          {availableTiles.map((tile, index) => (
            <motion.div
              key={`available-${tile}-${index}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.1 * index,
              }}
              className="px-3 py-1.5 rounded-lg bg-[#2E3856] text-white text-sm cursor-pointer hover:bg-[#364063]"
              onClick={() => handleTileSelect(tile, index)}
              whileHover={{ scale: isChecking ? 1 : 1.05 }}
              whileTap={{ scale: isChecking ? 1 : 0.95 }}
            >
              {tile}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TranslateExercise;
