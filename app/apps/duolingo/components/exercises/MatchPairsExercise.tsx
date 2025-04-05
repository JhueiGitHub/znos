// /root/app/apps/duolingo/components/exercises/MatchPairsExercise.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useDuolingoActions,
  useDuolingoState,
} from "../../contexts/DuolingoContext";
import {
  MatchPairsExercise as MatchPairsExerciseType,
  MatchPair,
} from "../../types/DuolingoTypes";
import { zenith } from "../../styles/zenithStyles";

interface MatchPairsExerciseProps {
  exercise: MatchPairsExerciseType;
}

const MatchPairsExercise = ({ exercise }: MatchPairsExerciseProps) => {
  const { submitAnswer } = useDuolingoActions();
  const { feedback } = useDuolingoState();
  const [shuffledPairs, setShuffledPairs] = useState<MatchPair[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // Stores { id: matchedId }

  // Shuffle pairs on mount or exercise change
  useEffect(() => {
    setShuffledPairs([...exercise.pairs].sort(() => Math.random() - 0.5));
    setSelectedPairId(null);
    setMatchedPairs({});
  }, [exercise]);

  const handleSelectPair = (pair: MatchPair) => {
    if (feedback.show || matchedPairs[pair.id]) return; // Cannot select if submitted or already matched

    if (!selectedPairId) {
      // First selection
      setSelectedPairId(pair.id);
    } else {
      // Second selection - check for match
      const firstSelected = shuffledPairs.find((p) => p.id === selectedPairId);
      if (firstSelected && firstSelected.matchId === pair.id) {
        // Correct match!
        setMatchedPairs((prev) => ({
          ...prev,
          [selectedPairId]: pair.id,
          [pair.id]: selectedPairId,
        }));
        setSelectedPairId(null); // Reset selection
        // Check if all pairs are matched
        if (Object.keys(matchedPairs).length + 2 === exercise.pairs.length) {
          // Create the answer object for submission
          const answer = {
            ...matchedPairs,
            [selectedPairId]: pair.id,
            [pair.id]: selectedPairId,
          };
          submitAnswer(answer);
        }
      } else {
        // Incorrect match - reset selection (add visual feedback later if needed)
        setSelectedPairId(null);
        // TODO: Add brief visual "shake" or incorrect indicator?
      }
    }
  };

  const allMatched = Object.keys(matchedPairs).length === exercise.pairs.length;

  return (
    <div className="flex flex-col items-center w-full">
      <h2
        className={`text-xl md:text-2xl mb-8 text-center ${zenith.tailwind.textWhite}`}
      >
        {exercise.prompt}
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {shuffledPairs.map((pair) => {
          const isSelected = selectedPairId === pair.id;
          const isMatched = !!matchedPairs[pair.id];

          let buttonStyle = `${zenith.tailwind.bgBlackGlass} ${zenith.tailwind.textGraphite} border ${zenith.tailwind.borderWhiteBrd} hover:bg-white/10`;
          if (isSelected) {
            buttonStyle = `${zenith.tailwind.accentButtonBg} ${zenith.tailwind.textWhite} border ${zenith.tailwind.borderLatte}`;
          }
          if (isMatched) {
            buttonStyle = `${zenith.tailwind.bgCorrect}/54 <span class="math-inline">\{zenith\.tailwind\.textWhite\} border\-\[</span>{zenith.colors.correct}]/54 opacity-70 cursor-default`; // Faded correct, disabled look
          }

          return (
            <motion.button
              key={pair.id}
              onClick={() => handleSelectPair(pair)}
              disabled={isMatched || feedback.show} // Disable if matched or submitted
              className={`w-full p-4 rounded-xl text-center text-lg transition-all duration-200 ease-in-out disabled:cursor-not-allowed ${buttonStyle}`}
              whileHover={{ scale: !isMatched && !feedback.show ? 1.05 : 1 }}
              whileTap={{ scale: !isMatched && !feedback.show ? 0.95 : 1 }}
            >
              {pair.text}
            </motion.button>
          );
        })}
      </div>
      {/* No submit button needed here, submission happens when all pairs are matched */}
      {feedback.show && !feedback.correct && (
        <p className={`mt-4 text-lg ${zenith.tailwind.textGraphite}`}>
          Keep trying to match the pairs!
        </p> // Generic message if incorrect on submit (though submit happens on completion)
      )}
    </div>
  );
};

export default MatchPairsExercise;
