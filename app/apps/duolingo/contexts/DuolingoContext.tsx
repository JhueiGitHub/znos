// /root/app/apps/duolingo/contexts/DuolingoContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { italianLessons } from "../data/italianLessons";
import { Lesson, Exercise } from "../types/DuolingoTypes";

interface DuolingoState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  currentExerciseIndex: number;
  isLessonActive: boolean;
  isLessonComplete: boolean;
  feedback: { show: boolean; correct: boolean; message: string };
}

interface DuolingoActions {
  startLesson: (lessonId: string) => void;
  submitAnswer: (answer: string | string[] | { [key: string]: string }) => void; // Adapt based on exercise type
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
    lessons: italianLessons,
    currentLesson: null,
    currentExerciseIndex: 0,
    isLessonActive: false,
    isLessonComplete: false,
    feedback: { show: false, correct: false, message: "" },
  });

  const actions = useMemo(
    () => ({
      startLesson: (lessonId: string) => {
        const lesson = state.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          setState((prev) => ({
            ...prev,
            currentLesson: lesson,
            currentExerciseIndex: 0,
            isLessonActive: true,
            isLessonComplete: false,
            feedback: { show: false, correct: false, message: "" },
          }));
        }
      },

      submitAnswer: (
        userAnswer: string | string[] | { [key: string]: string }
      ) => {
        if (!state.currentLesson || state.feedback.show) return; // Prevent double submission

        const exercise =
          state.currentLesson.exercises[state.currentExerciseIndex];
        let isCorrect = false;
        let message = "";

        // Normalize string answers for comparison
        const normalize = (ans: string) =>
          ans
            .trim()
            .toLowerCase()
            .replace(/[.,!?;:]/g, "");

        switch (exercise.type) {
          case "TRANSLATE_TO_ITALIAN":
          case "TRANSLATE_TO_ENGLISH":
            const normalizedUserAnswer = Array.isArray(userAnswer)
              ? normalize(userAnswer.join(" "))
              : normalize(userAnswer as string);
            isCorrect = exercise.correctAnswer.some(
              (correct) => normalize(correct) === normalizedUserAnswer
            );
            message = isCorrect
              ? "Correct!"
              : `Correct answer: ${exercise.correctAnswer[0]}`;
            break;
          case "MULTIPLE_CHOICE_TRANSLATE":
            isCorrect = userAnswer === exercise.correctAnswer;
            message = isCorrect
              ? "Correct!"
              : `Correct answer: ${exercise.correctAnswer}`;
            break;
          case "MATCH_PAIRS":
            // Check if all pairs provided by userAnswer match the exercise definitions
            const userPairs = userAnswer as { [key: string]: string };
            isCorrect = exercise.pairs.every(
              (p) => userPairs[p.id] === p.matchId
            );
            message = isCorrect
              ? "All pairs matched!"
              : "Some pairs are incorrect.";
            // Provide more specific feedback if needed
            break;
          // Add cases for other exercise types
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
            feedback: { show: false, correct: false, message: "" }, // Reset feedback
          }));
        } else {
          // Lesson complete
          setState((prev) => ({
            ...prev,
            isLessonComplete: true,
            feedback: { show: false, correct: false, message: "" }, // Reset feedback for completion screen
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
        // Simply reset the index and completion status for the current lesson
        setState((prev) => ({
          ...prev,
          currentExerciseIndex: 0,
          isLessonComplete: false,
          feedback: { show: false, correct: false, message: "" },
        }));
      },
    }),
    [state]
  ); // Recreate actions only if state changes (might need refinement based on dependencies)

  return (
    <DuolingoStateContext.Provider value={state}>
      <DuolingoActionsContext.Provider value={actions}>
        {children}
      </DuolingoActionsContext.Provider>
    </DuolingoStateContext.Provider>
  );
};

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
