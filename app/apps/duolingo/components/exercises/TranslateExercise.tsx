// /root/app/apps/duolingo/components/exercises/TranslateExercise.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { TranslateExercise as TranslateExerciseType } from "../../types/DuolingoTypes";
import { VolumeIcon } from "lucide-react";
import { playAudio } from "../../utils/audioUtils";
import { useStyles } from "@/app/hooks/useStyles";

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
  const { getColor } = useStyles();

  // Local state for word banks
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>([]);
  const [animatingTile, setAnimatingTile] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Init tiles on component mount
  useEffect(() => {
    // Reset selections when exercise changes
    setSelectedTiles(userAnswer || []);

    // Filter out already selected tiles from available ones
    const selected = userAnswer || [];
    const available = exercise.options.filter(
      (word) => !selected.includes(word)
    );

    // Shuffle available tiles - but only on initial load
    if (availableTiles.length === 0) {
      setAvailableTiles(shuffleArray(available));
    } else {
      setAvailableTiles(available);
    }

    // Play audio if available
    if (exercise.audioSrc) {
      playAudio(exercise.audioSrc);
    }
  }, [exercise, userAnswer]);

  // Function to shuffle array - only for initial state
  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Handle selecting a tile from the word bank - now with smoother animation
  const handleTileSelect = (tile: string, index: number) => {
    if (isChecking) return;

    // Mark this tile as animating
    setAnimatingTile(tile);

    // Add to selected tiles - this happens immediately
    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    // Remove from available tiles in a predictable way - maintain order but remove this item
    setAvailableTiles((prev) => prev.filter((item) => item !== tile));

    // Clear animating state after animation completes
    setTimeout(() => {
      setAnimatingTile(null);
    }, 300);

    // Update parent component
    onAnswer(newSelected);
  };

  // Handle removing a tile from the selection
  const handleTileRemove = (tile: string, index: number) => {
    if (isChecking) return;

    // Mark this tile as animating
    setAnimatingTile(tile);

    // Remove from selected tiles
    const newSelected = [...selectedTiles];
    newSelected.splice(index, 1);
    setSelectedTiles(newSelected);

    // Add back to available tiles in a predictable location
    // Find where this tile should go based on original exercise order
    const originalOrder = exercise.options;
    const insertIndex = originalOrder.indexOf(tile);

    // Figure out where to insert in current available tiles
    let targetIndex = 0;
    for (let i = 0; i < insertIndex; i++) {
      if (availableTiles.includes(originalOrder[i])) {
        targetIndex++;
      }
    }

    // Insert at the right position to maintain original relative order
    const newAvailable = [...availableTiles];
    newAvailable.splice(targetIndex, 0, tile);
    setAvailableTiles(newAvailable);

    // Clear animating state
    setTimeout(() => {
      setAnimatingTile(null);
    }, 300);

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
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Text to translate */}
      <div className="">
        <motion.div
          className="inline-block px-3 py-1 rounded-full text-xs font-bold border mb-3"
          style={{
            backgroundColor: "rgba(76, 79, 105, 0.2)",
            borderColor: getColor("Brd"),
            color: getColor("latte"),
          }}
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
            <VolumeIcon size={18} style={{ color: getColor("latte") }} />
          </motion.button>
          <motion.div
            className="text-lg font-bold text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {exercise.textToTranslate || exercise.prompt}
          </motion.div>
        </div>

        <motion.p
          className="mt-2 mb-4 text-sm text-white/60"
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
        className="min-h-[80px] p-3 mb-4 rounded-lg border flex flex-wrap gap-2 items-start content-start"
        style={{
          backgroundColor: showFeedback
            ? isCorrect()
              ? "rgba(76, 79, 105, 0.1)"
              : "rgba(204, 204, 204, 0.1)"
            : "rgba(0, 0, 0, 0.3)",
          borderColor: showFeedback
            ? isCorrect()
              ? getColor("latte")
              : getColor("Graphite")
            : getColor("Brd"),
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex flex-wrap gap-2">
          {selectedTiles.map((tile, index) => (
            <motion.div
              key={`selected-${tile}-${index}`}
              layout
              initial={{
                scale: animatingTile === tile ? 0.8 : 1,
                opacity: animatingTile === tile ? 0 : 1,
              }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className="px-3 py-1.5 rounded-lg text-white/70 text-sm cursor-pointer border border-white/10 hover:bg-white/5 transition-colors"
              style={{
                color: "rgba(76, 79, 105, 0.81)", // Latte with glass effect
              }}
              onClick={() => !isChecking && handleTileRemove(tile, index)}
              whileHover={{ scale: isChecking ? 1 : 1.05 }}
              whileTap={{ scale: isChecking ? 1 : 0.95 }}
            >
              {tile}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Word bank - now with stable positions */}
      <div className="flex flex-wrap gap-2 justify-center mt-auto">
        {availableTiles.map((tile, index) => (
          <motion.div
            key={`available-${tile}`}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: animatingTile === tile ? 0.8 : 1,
              opacity: animatingTile === tile ? 0 : 1,
              transition: { duration: 0.2 },
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className="px-3 py-1.5 rounded-lg  text-white text-sm cursor-pointer border border-white/10 hover:bg-white/5 transition-colors"
            style={{ color: "rgba(76, 79, 105, 0.81)" }}
            onClick={() => handleTileSelect(tile, index)}
            whileHover={{ scale: isChecking ? 1 : 1.05 }}
            whileTap={{ scale: isChecking ? 1 : 0.95 }}
          >
            {tile}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TranslateExercise;
