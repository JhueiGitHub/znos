// /root/app/apps/duolingo/components/exercises/MatchPairsExercise.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Removed AnimateSharedLayout as it's deprecated
import {
  useDuolingoActions,
  useDuolingoState,
} from "../../contexts/DuolingoContext";
import {
  MatchPairsExercise as MatchPairsExerciseType,
  MatchPairItem,
} from "../../types/DuolingoTypes";
import { zenith } from "../../styles/zenithStyles";
import { shuffle } from "lodash"; // npm install lodash @types/lodash

// Interface extending MatchPairItem for component state
interface SelectablePairItem extends MatchPairItem {
  isSelected: boolean;
  isMatched: boolean;
  side: "A" | "B"; // Type definition is correct here
}

interface MatchPairsExerciseProps {
  exercise: MatchPairsExerciseType;
}

const MatchPairsExercise = ({ exercise }: MatchPairsExerciseProps) => {
  const { submitAnswer } = useDuolingoActions();
  const { feedback } = useDuolingoState();
  const [items, setItems] = useState<SelectablePairItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectablePairItem | null>(
    null
  );

  useEffect(() => {
    // --- FIX: Explicitly type items before flatMap ---
    const allItems = exercise.pairs.flatMap((p) => {
      // Define with the correct SelectablePairItem type
      const itemA: SelectablePairItem = {
        ...p.itemA,
        isSelected: false,
        isMatched: false,
        side: "A",
      };
      const itemB: SelectablePairItem = {
        ...p.itemB,
        isSelected: false,
        isMatched: false,
        side: "B",
      };
      return [itemA, itemB];
    });
    // --- End Fix ---
    setItems(shuffle(allItems));
    setSelectedItem(null);
  }, [exercise]);

  const handleSelectItem = (item: SelectablePairItem) => {
    if (feedback.show || item.isMatched) return;

    if (!selectedItem) {
      setSelectedItem(item);
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id
            ? { ...i, isSelected: true }
            : { ...i, isSelected: false }
        )
      );
    } else {
      if (item.id === selectedItem.id) {
        setSelectedItem(null);
        setItems((prevItems) =>
          prevItems.map((i) => ({ ...i, isSelected: false }))
        );
        return;
      }

      const correctPairDef = exercise.pairs.find(
        (p) => p.itemA.id === selectedItem.id || p.itemB.id === selectedItem.id
      );
      const expectedMatchId = correctPairDef
        ? correctPairDef.itemA.id === selectedItem.id
          ? correctPairDef.itemB.id
          : correctPairDef.itemA.id
        : null;

      if (expectedMatchId === item.id) {
        // Correct Match
        const newlyMatchedIds = [item.id, selectedItem.id];
        const updatedItems = items.map((i) =>
          newlyMatchedIds.includes(i.id)
            ? { ...i, isSelected: false, isMatched: true }
            : i
        );
        setItems(updatedItems);
        setSelectedItem(null);

        const allMatched = updatedItems.every((i) => i.isMatched);
        if (allMatched) {
          // --- FIX: Submit something meaningful or adapt context ---
          // Submit the matched pairs state for potential validation/logging
          const submittedAnswerForContext = updatedItems
            .filter((i) => i.isMatched)
            .map((i) => ({ id: i.id, matched: true })); // Example format
          submitAnswer(submittedAnswerForContext as any); // Cast needed if context expects string/string[]
          console.log("MatchPairs: All matched! Submitting result.");
        }
      } else {
        // Incorrect Match
        setSelectedItem(null);
        setItems((prevItems) =>
          prevItems.map((i) => ({ ...i, isSelected: false }))
        );
        // TODO: Add subtle visual feedback for incorrect attempt
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-3 text-center">
      <p className={`text-sm mb-1 ${zenith.tailwind.textWhite}`}>
        {exercise.prompt}
      </p>
      <div className="flex flex-col gap-2 w-full">
        {items.map((item) => {
          let buttonStyle = `${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} border ${zenith.tailwind.borderWhiteBrd} hover:bg-white/10`;
          if (item.isSelected) {
            buttonStyle = `${zenith.tailwind.accentButtonBg} ${zenith.tailwind.textWhite} border ${zenith.tailwind.borderLatte}`;
          }
          if (item.isMatched) {
            buttonStyle = `${zenith.tailwind.bgCorrect}/30 border-[${zenith.colors.correct}]/50 opacity-60 cursor-default`;
          }

          return (
            <motion.button
              key={item.id}
              layout
              onClick={() => handleSelectItem(item)}
              disabled={item.isMatched || feedback.show}
              className={`w-full p-2.5 rounded-lg text-xs sm:text-sm text-center transition-colors duration-150 ease-in-out disabled:cursor-not-allowed ${buttonStyle}`}
              whileHover={{
                scale: !item.isMatched && !feedback.show ? 1.03 : 1,
              }}
              whileTap={{ scale: !item.isMatched && !feedback.show ? 0.98 : 1 }}
            >
              {item.text}
            </motion.button>
          );
        })}
      </div>
      {!feedback.show && <div className="h-[65px]"></div>}
    </div>
  );
};

export default MatchPairsExercise;
