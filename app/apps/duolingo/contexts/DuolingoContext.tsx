// /root/app/apps/duolingo/contexts/DuolingoContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";
// --- FIXED IMPORT ---
import { italianLessonNodes } from "../data/italianLessons";
// --- UPDATED TYPE IMPORTS ---
import { LessonNodeData, Exercise } from "../types/DuolingoTypes";

interface DuolingoState {
  // --- Use LessonNodeData[] for the list ---
  lessons: LessonNodeData[];
  // --- Use LessonNodeData for the current item ---
  currentLesson: LessonNodeData | null;
  currentExerciseIndex: number;
  isLessonActive: boolean;
  isLessonComplete: boolean;
  feedback: { show: boolean; correct: boolean; message: string };
}

interface DuolingoActions {
  startLesson: (lessonId: string) => void;
  submitAnswer: (answer: string | string[] | { [key: string]: string }) => void;
  nextExercise: () => void;
  exitLesson: () => void;
  retryLesson: () => void;
}

const DuolingoStateContext = createContext<DuolingoState | undefined>(
  undefined
);
const DuolingoActionsContext = createContext<DuolingoActions | undefined>(
  undefined
);

export const DuolingoProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DuolingoState>({
    // --- Initialize with italianLessonNodes ---
    lessons: italianLessonNodes,
    currentLesson: null,
    currentExerciseIndex: 0,
    isLessonActive: false,
    isLessonComplete: false,
    feedback: { show: false, correct: false, message: "" },
  });

  const actions = useMemo(
    () => ({
      startLesson: (lessonId: string) => {
        // Find the node (which is LessonNodeData type) from the state
        const lessonNode = state.lessons.find((node) => node.id === lessonId);
        // Ensure it's a valid node with exercises before starting
        if (
          lessonNode &&
          lessonNode.exercises &&
          lessonNode.exercises.length > 0
        ) {
          setState((prev) => ({
            ...prev,
            // Set currentLesson to the found node
            currentLesson: lessonNode,
            currentExerciseIndex: 0,
            isLessonActive: true,
            isLessonComplete: false,
            feedback: { show: false, correct: false, message: "" },
          }));
        } else if (lessonNode) {
          console.warn(
            `Lesson node ${lessonNode.id} has no exercises or is not a startable type.`
          );
          // Optionally show a user message here
        } else {
          console.error(`Lesson node with id ${lessonId} not found.`);
        }
      },

      submitAnswer: (
        userAnswer: string | string[] | { [key: string]: string }
      ) => {
        if (!state.currentLesson || state.feedback.show) return;

        // currentLesson is LessonNodeData, exercises are directly accessible
        const exercise =
          state.currentLesson.exercises[state.currentExerciseIndex];
        if (!exercise) {
          console.error("Current exercise is undefined.");
          return; // Exit if exercise is not found
        }
        let isCorrect = false;
        let message = "";
        const normalize = (ans: string) =>
          ans
            .trim()
            .toLowerCase()
            .replace(/[.,!?;:]/g, "");

        switch (exercise.type) {
          case "TRANSLATE_TO_ITALIAN":
          case "TRANSLATE_TO_ENGLISH":
            // Ensure correctAnswer is treated as string[]
            const correctAnswers = (exercise as any).correctAnswer as string[];
            const normalizedUserAnswer = Array.isArray(userAnswer)
              ? normalize(userAnswer.join(" "))
              : normalize(userAnswer as string);
            isCorrect = correctAnswers.some(
              (correct) => normalize(correct) === normalizedUserAnswer
            );
            message = isCorrect
              ? "Correct!"
              : `Correct answer: ${correctAnswers[0]}`;
            break;
          case "MULTIPLE_CHOICE_TRANSLATE":
            const correctChoice = (exercise as any).correctAnswer as string;
            isCorrect = userAnswer === correctChoice;
            message = isCorrect
              ? "Correct!"
              : `Correct answer: ${correctChoice}`;
            break;
          case "MATCH_PAIRS":
            const correctPairs = (exercise as any).pairs as {
              id: string;
              matchId: string;
            }[];
            const userPairs = userAnswer as { [key: string]: string };
            // Check if number of provided pairs matches expected pairs
            const userPairKeys = Object.keys(userPairs);
            isCorrect =
              correctPairs.every((p) => userPairs[p.id] === p.matchId) &&
              userPairKeys.length === correctPairs.length;

            message = isCorrect
              ? "All pairs matched!"
              : "Some pairs are incorrect.";
            break;
        }

        setState((prev) => ({
          ...prev,
          feedback: { show: true, correct: isCorrect, message: message },
        }));
      },

      nextExercise: () => {
        if (!state.currentLesson) return;

        const nextIndex = state.currentExerciseIndex + 1;
        if (nextIndex < state.currentLesson.exercises.length) {
          setState((prev) => ({
            ...prev,
            currentExerciseIndex: nextIndex,
            feedback: { show: false, correct: false, message: "" },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isLessonComplete: true,
            feedback: { show: false, correct: false, message: "" },
          }));
        }
      },

      exitLesson: () => {
        setState((prev) => ({
          ...prev,
          currentLesson: null,
          currentExerciseIndex: 0,
          isLessonActive: false,
          isLessonComplete: false,
          feedback: { show: false, correct: false, message: "" },
        }));
      },

      retryLesson: () => {
        if (!state.currentLesson) return;
        setState((prev) => ({
          ...prev,
          currentExerciseIndex: 0,
          isLessonComplete: false,
          feedback: { show: false, correct: false, message: "" },
        }));
      },
    }),
    // Ensure dependencies are correct, especially state.lessons and state.currentLesson
    [
      state.currentLesson,
      state.currentExerciseIndex,
      state.feedback.show,
      state.lessons,
    ]
  );

  return (
    <DuolingoStateContext.Provider value={state}>
      <DuolingoActionsContext.Provider value={actions}>
        {children}
      </DuolingoActionsContext.Provider>
    </DuolingoStateContext.Provider>
  );
};

// --- Hooks remain the same ---
export const useDuolingoState = () => {
  const context = useContext(DuolingoStateContext);
  if (context === undefined) {
    throw new Error("useDuolingoState must be used within a DuolingoProvider");
  }
  return context;
};

export const useDuolingoActions = () => {
  const context = useContext(DuolingoActionsContext);
  if (context === undefined) {
    throw new Error(
      "useDuolingoActions must be used within a DuolingoProvider"
    );
  }
  return context;
};
