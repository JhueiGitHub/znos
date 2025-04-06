// /root/app/apps/duolingo/components/LessonView.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useDuolingoState,
  useDuolingoActions,
} from "../contexts/DuolingoContext";
import { zenith } from "../styles/zenithStyles";
import { X, VolumeIcon } from "lucide-react";
import Image from "next/image";
import { useStyles } from "@/app/hooks/useStyles";
import {
  Exercise,
  TranslateExercise as TranslateExerciseType,
  MultipleChoiceExercise as MCExerciseType,
  MatchPairsExercise as MatchPairsExerciseType,
} from "../types/DuolingoTypes";
import {
  playAudio,
  playCorrectSound,
  playIncorrectSound,
} from "../utils/audioUtils";

// Import exercise components
import MultipleChoiceExercise from "./exercises/MultipleChoiceExercise";
import TranslateExercise from "./exercises/TranslateExercise";
import MatchPairsExercise from "./exercises/MatchPairsExercise";
import LessonComplete from "./LessonComplete";

// Main LessonView Component
const LessonView: React.FC = () => {
  const { getColor } = useStyles();
  const { currentLesson, currentExerciseIndex, isLessonComplete, feedback } =
    useDuolingoState();

  const { exitLesson, nextExercise, submitAnswer, retryLesson } =
    useDuolingoActions();

  // Local state
  const [answer, setAnswer] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  // Reset answer when exercise changes
  useEffect(() => {
    setAnswer(null);
    setIsChecking(false);
    setAudioPlayed(false);
  }, [currentExerciseIndex]);

  // Handle feedback sound effects
  useEffect(() => {
    if (feedback.show) {
      if (feedback.correct) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }
    }
  }, [feedback]);

  // Audio play on mount
  useEffect(() => {
    const playExerciseAudio = async () => {
      if (
        !audioPlayed &&
        currentLesson?.exercises[currentExerciseIndex]?.audioSrc
      ) {
        setAudioPlayed(true);
        try {
          await playAudio(
            currentLesson.exercises[currentExerciseIndex].audioSrc
          );
        } catch (error) {
          console.error("Audio play error:", error);
        }
      }
    };

    playExerciseAudio();
  }, [currentExerciseIndex, currentLesson, audioPlayed]);

  // Exit early if no lesson
  if (!currentLesson) return null;

  // Show lesson complete screen
  if (isLessonComplete) {
    return <LessonComplete onContinue={exitLesson} onRetry={retryLesson} />;
  }

  // Get current exercise
  const exercise = currentLesson.exercises[currentExerciseIndex];
  if (!exercise) return null;

  // Calculate progress percentage
  const progress =
    ((currentExerciseIndex + 1) / currentLesson.exercises.length) * 100;

  // Handle checking answer
  const handleCheck = () => {
    if (!answer) return;
    setIsChecking(true);
    submitAnswer(answer);
  };

  // Handle continuing to next exercise
  const handleContinue = () => {
    nextExercise();
  };

  // Handle answer selection
  const handleAnswer = (selectedAnswer: any) => {
    setAnswer(selectedAnswer);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Top bar with progress and exit */}
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <button
          onClick={exitLesson}
          className="text-[#4C4F69]/80 hover:text-[#4C4F69]/100 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex-1 ml-2 w-full">
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: getColor("latte") }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Empty div to maintain spacing */}
        <div className="w-[6px]"></div>
      </div>

      {/* Exercise content */}
      <div className="flex-1 p-3 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`exercise-${currentExerciseIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            {exercise.type === "MULTIPLE_CHOICE_TRANSLATE" && (
              <MultipleChoiceExercise
                exercise={exercise as MCExerciseType}
                onAnswer={handleAnswer}
                userAnswer={answer}
                isChecking={isChecking}
                correctAnswer={
                  feedback.show
                    ? (exercise as MCExerciseType).correctAnswer
                    : null
                }
                showFeedback={feedback.show}
              />
            )}

            {(exercise.type === "TRANSLATE_TO_ITALIAN" ||
              exercise.type === "TRANSLATE_TO_ENGLISH") && (
              <TranslateExercise
                exercise={exercise as TranslateExerciseType}
                onAnswer={handleAnswer}
                userAnswer={answer || []}
                isChecking={isChecking}
                showFeedback={feedback.show}
              />
            )}

            {exercise.type === "MATCH_PAIRS" && (
              <MatchPairsExercise
                exercise={exercise as MatchPairsExerciseType}
                onAnswer={(answer) => handleAnswer(answer)}
                userAnswer={answer}
                isChecking={isChecking}
                showFeedback={feedback.show}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback area */}
      <div className="p-3">
        <AnimatePresence>
          {feedback.show && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-2 mb-3 rounded text-sm border`}
              style={{
                backgroundColor: feedback.correct
                  ? "rgba(76, 79, 105, 0.2)"
                  : "rgba(204, 204, 204, 0.2)",
                color: feedback.correct
                  ? getColor("latte")
                  : getColor("Graphite"),
                borderColor: getColor("Brd"),
              }}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <motion.button
          className="w-full py-3 rounded-xl font-bold text-sm border border-white/10 hover:bg-white/5 transition-colors"
          style={{ color: "rgba(76, 79, 105, 0.81)" }}
          whileHover={answer || feedback.show ? { scale: 1.02 } : {}}
          whileTap={answer || feedback.show ? { scale: 0.98 } : {}}
          disabled={!answer && !feedback.show}
          onClick={feedback.show ? handleContinue : handleCheck}
        >
          {feedback.show ? "CONTINUE" : "CHECK"}
        </motion.button>
      </div>
    </div>
  );
};

export default LessonView;
