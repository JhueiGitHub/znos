// /root/app/apps/duolingo/components/exercises/MatchPairsExercise.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MatchPairsExercise as MPExerciseType,
  MatchPairItem,
} from "../../types/DuolingoTypes";
import { playAudio } from "../../utils/audioUtils";
import { useStyles } from "@/app/hooks/useStyles";

interface Props {
  exercise: MPExerciseType;
  onAnswer: (answer: MatchPairItem[]) => void;
  userAnswer: MatchPairItem[] | null;
  isChecking: boolean;
  showFeedback: boolean;
}

const MatchPairsExercise: React.FC<Props> = ({
  exercise,
  onAnswer,
  userAnswer,
  isChecking,
  showFeedback,
}) => {
  const { getColor } = useStyles();

  // Local state
  const [items, setItems] = useState<MatchPairItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MatchPairItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [animatingPair, setAnimatingPair] = useState<string[]>([]);

  // Initialize and shuffle items on component mount
  useEffect(() => {
    // Extract all items from pairs and shuffle them
    const allItems = exercise.pairs.flatMap((pair) => [pair.itemA, pair.itemB]);
    setItems(shuffleArray(allItems));
    setMatchedPairs(new Set());
    setSelectedItem(null);
  }, [exercise]);

  // Check for completion when matched pairs change
  useEffect(() => {
    if (matchedPairs.size === exercise.pairs.length * 2) {
      // We have matched all pairs
      const allMatchedItems = exercise.pairs.flatMap((pair) => [
        pair.itemA,
        pair.itemB,
      ]);
      onAnswer(allMatchedItems);
    }
  }, [matchedPairs, exercise.pairs, onAnswer]);

  // Helper to shuffle array
  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Handle item click
  const handleItemClick = (item: MatchPairItem) => {
    if (isChecking || matchedPairs.has(item.id) || animatingPair.length > 0)
      return;

    if (!selectedItem) {
      // First selection
      setSelectedItem(item);
    } else if (selectedItem.id === item.id) {
      // Clicked the same item twice - deselect it
      setSelectedItem(null);
    } else {
      // Second selection - check if it's a match
      const isMatch = exercise.pairs.some(
        (pair) =>
          (pair.itemA.id === selectedItem.id && pair.itemB.id === item.id) ||
          (pair.itemB.id === selectedItem.id && pair.itemA.id === item.id)
      );

      if (isMatch) {
        // Animate match
        setAnimatingPair([selectedItem.id, item.id]);

        // Play correct sound
        playAudio("/apps/duolingo/audio/correct.mp3");

        // Add to matched pairs after animation
        setTimeout(() => {
          const newMatched = new Set(matchedPairs);
          newMatched.add(selectedItem.id);
          newMatched.add(item.id);
          setMatchedPairs(newMatched);
          setAnimatingPair([]);

          // Check if all pairs are matched
          if (newMatched.size === exercise.pairs.length * 2) {
            const allMatchedItems = exercise.pairs.flatMap((pair) => [
              pair.itemA,
              pair.itemB,
            ]);
            onAnswer(allMatchedItems);
          }
        }, 600);
      } else {
        // Briefly show incorrect selection
        setAnimatingPair([selectedItem.id, item.id]);

        // Play incorrect sound
        playAudio("/apps/duolingo/audio/incorrect.mp3");

        // Clear after animation
        setTimeout(() => {
          setAnimatingPair([]);
        }, 600);
      }

      // Reset selection
      setSelectedItem(null);
    }
  };

  // Get item status for styling
  const getItemStatus = (item: MatchPairItem) => {
    if (matchedPairs.has(item.id)) return "matched";
    if (animatingPair.includes(item.id)) {
      // Check if this is a correct match
      const isCorrectMatch = exercise.pairs.some(
        (pair) =>
          animatingPair.includes(pair.itemA.id) &&
          animatingPair.includes(pair.itemB.id)
      );
      return isCorrectMatch ? "correct-animation" : "incorrect-animation";
    }
    if (selectedItem?.id === item.id) return "selected";
    return "default";
  };

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="inline-block px-3 py-1 rounded-full text-xs font-bold border self-start mb-4"
        style={{
          backgroundColor: "rgba(76, 79, 105, 0.2)",
          borderColor: getColor("Brd"),
          color: getColor("latte"),
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        MATCH PAIRS
      </motion.div>

      <motion.h2
        className="text-lg font-bold mb-4 text-white/80"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {exercise.prompt}
      </motion.h2>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const status = getItemStatus(item);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: matchedPairs.has(item.id) && !showFeedback ? 0.5 : 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.05 * index,
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="p-3 rounded-lg text-center cursor-pointer border"
                style={{
                  backgroundColor:
                    status === "matched"
                      ? getColor("latte")
                      : status === "correct-animation"
                        ? getColor("latte")
                        : status === "incorrect-animation"
                          ? "#333333"
                          : status === "selected"
                            ? getColor("latte")
                            : "#191919",
                  color: status === "default" ? "white" : "white",
                  borderColor: getColor("Brd"),
                }}
                whileHover={matchedPairs.has(item.id) ? {} : { scale: 1.05 }}
                whileTap={matchedPairs.has(item.id) ? {} : { scale: 0.95 }}
                onClick={() => handleItemClick(item)}
              >
                <span className="text-sm font-medium">{item.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      {showFeedback && matchedPairs.size === exercise.pairs.length * 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center p-2 rounded-lg border"
          style={{
            backgroundColor: "rgba(76, 79, 105, 0.1)",
            color: getColor("latte"),
            borderColor: getColor("Brd"),
          }}
        >
          All pairs matched successfully!
        </motion.div>
      )}

      {matchedPairs.size === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-sm"
          style={{ color: getColor("Graphite") }}
        >
          Tap matching pairs to connect them
        </motion.div>
      )}
    </div>
  );
};

export default MatchPairsExercise;
