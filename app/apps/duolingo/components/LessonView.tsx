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

// Hearts UI Component
const Heart = ({ filled }: { filled: boolean }) => (
  <div className="w-4 h-4 mx-0.5">
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "#FF4B4B" : "none"}
      stroke={filled ? "none" : "#FF4B4B"}
      strokeWidth="2"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  </div>
);

// Main LessonView Component
const LessonView: React.FC = () => {
  const { currentLesson, currentExerciseIndex, isLessonComplete, feedback } =
    useDuolingoState();

  const { exitLesson, nextExercise, submitAnswer, retryLesson } =
    useDuolingoActions();

  // Local state
  const [hearts, setHearts] = useState(5);
  const [answer, setAnswer] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  // Reset answer when exercise changes
  useEffect(() => {
    setAnswer(null);
    setIsChecking(false);
    setAudioPlayed(false);
  }, [currentExerciseIndex]);

  // Handle heart loss on incorrect answer
  useEffect(() => {
    if (feedback.show && !feedback.correct) {
      setHearts((prev) => Math.max(0, prev - 1));
      playIncorrectSound();
    } else if (feedback.show && feedback.correct) {
      playCorrectSound();
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
    return (
      <LessonComplete
        success={hearts > 0}
        heartsRemaining={hearts}
        onContinue={exitLesson}
        onRetry={retryLesson}
      />
    );
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
    if (hearts <= 0) {
      retryLesson();
    } else {
      nextExercise();
    }
  };

  // Handle answer selection
  const handleAnswer = (selectedAnswer: any) => {
    setAnswer(selectedAnswer);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar with progress, exit, hearts */}
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <button
          onClick={exitLesson}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex-1 mx-2">
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#58CC02] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Heart key={i} filled={i < hearts} />
          ))}
        </div>
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
              className={`p-2 mb-3 rounded text-sm ${
                feedback.correct
                  ? "bg-[#58CC02]/20 text-[#58CC02]"
                  : "bg-[#FF4B4B]/20 text-[#FF4B4B]"
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <motion.button
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{
            backgroundColor: answer || feedback.show ? "#58CC02" : "#E5E5E5",
            color: answer || feedback.show ? "white" : "#AFAFAF",
          }}
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
