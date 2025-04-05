// /root/app/apps/duolingo/contexts/DuolingoContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useCallback, // Import useCallback
} from "react";
import { italianLessonNodes } from "../data/italianLessons";
import {
  LessonNodeData,
  Exercise,
  MatchPairItem,
  TranslateExercise, // Import specific exercise types for assertions
  MultipleChoiceExercise,
  MatchPairsExercise,
} from "../types/DuolingoTypes";

interface DuolingoState {
  lessons: LessonNodeData[];
  currentLesson: LessonNodeData | null;
  currentExerciseIndex: number;
  isLessonActive: boolean;
  isLessonComplete: boolean;
  feedback: { show: boolean; correct: boolean; message: string };
}

interface DuolingoActions {
  startLesson: (lessonId: string) => void;
  submitAnswer: (answer: string | string[] | MatchPairItem[]) => void;
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

const initialState: DuolingoState = {
  lessons: italianLessonNodes,
  currentLesson: null,
  currentExerciseIndex: 0,
  isLessonActive: false,
  isLessonComplete: false,
  feedback: { show: false, correct: false, message: "" },
};

export const DuolingoProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DuolingoState>(initialState);

  const startLesson = useCallback(
    (lessonId: string) => {
      console.log(`[CONTEXT] startLesson action called for: ${lessonId}`);
      const lessonNode = state.lessons.find((node) => node.id === lessonId);
      console.log(
        `[CONTEXT] Found node: ${lessonNode?.id}, Status: ${lessonNode?.status}`
      );
      if (
        lessonNode &&
        lessonNode.status === "available" &&
        lessonNode.exercises &&
        lessonNode.exercises.length > 0
      ) {
        console.log(
          `[CONTEXT] Node ${lessonNode.id} is valid. Setting state...`
        );
        setState((prev) => ({
          ...prev,
          currentLesson: lessonNode,
          currentExerciseIndex: 0,
          isLessonActive: true,
          isLessonComplete: false,
          feedback: { show: false, correct: false, message: "" },
        }));
      } else {
        console.warn(
          `[CONTEXT] Cannot start lesson ${lessonId}. Node found: ${!!lessonNode}, Available: ${lessonNode?.status === "available"}, Has exercises: ${!!lessonNode?.exercises?.length}`
        );
      }
    },
    [state.lessons]
  );

  const exitLesson = useCallback(() => {
    console.log("[CONTEXT] exitLesson action called");
    setState((prev) => ({
      ...prev,
      currentLesson: null,
      currentExerciseIndex: 0,
      isLessonActive: false,
      isLessonComplete: false,
      feedback: { show: false, correct: false, message: "" },
    }));
  }, []);

  const submitAnswer = useCallback(
    (userAnswer: string | string[] | MatchPairItem[]) => {
      if (!state.currentLesson || state.feedback.show) return;

      const exercise: Exercise | undefined = // Explicitly type as possibly undefined
        state.currentLesson.exercises[state.currentExerciseIndex];

      // --- FIX: Add Type Guard right after defining exercise ---
      if (!exercise) {
        console.error("Cannot submit answer: current exercise is undefined.");
        return; // Exit if exercise doesn't exist at this index
      }
      // --- TypeScript now knows exercise is defined beyond this point ---

      let isCorrect = false;
      let message = "";
      const normalize = (ans: string) =>
        ans
          .trim()
          .toLowerCase()
          .replace(/[.,!?;:]/g, "");

      try {
        // Switch on the type, now guaranteed to exist on 'exercise'
        switch (exercise.type) {
          case "TRANSLATE_TO_ITALIAN":
          case "TRANSLATE_TO_ENGLISH": {
            // Use type assertion for clarity and stricter checking
            const ex = exercise as TranslateExercise;
            const correctAnswerTiles = ex.correctAnswerTiles;
            const userAnswerTiles = Array.isArray(userAnswer)
              ? (userAnswer as string[])
              : [userAnswer as string];
            isCorrect =
              userAnswerTiles.join(" ").toLowerCase() ===
              correctAnswerTiles.join(" ").toLowerCase();
            message = isCorrect
              ? "Great!"
              : `Correct answer: ${correctAnswerTiles.join(" ")}`;
            break;
          }
          case "MULTIPLE_CHOICE_TRANSLATE": {
            // Use type assertion
            const ex = exercise as MultipleChoiceExercise;
            const correctAnswer = ex.correctAnswer;
            isCorrect = userAnswer === correctAnswer;
            message = isCorrect
              ? "Correct!"
              : `Correct answer: ${correctAnswer}`;
            break;
          }
          case "MATCH_PAIRS": {
            // Use type assertion
            const ex = exercise as MatchPairsExercise;
            const correctPairs = ex.pairs;
            const submittedItems = userAnswer as MatchPairItem[]; // Assuming component sends array of matched items correctly

            // Simplified validation for now - relies on component sending correct data structure on success
            if (!Array.isArray(submittedItems)) {
              console.warn(
                "Match Pairs: Invalid submission format received.",
                submittedItems
              );
              isCorrect = false;
              message = "Error processing match.";
            } else {
              // Check if the number of submitted items matches the expected number of items (pairs * 2)
              isCorrect = submittedItems.length === correctPairs.length * 2;
              // More robust check would involve verifying each submitted match against 'correctPairs' definitions
              message = isCorrect
                ? "All pairs matched!"
                : "Some pairs might be incorrect."; // Adjust as needed
            }
            break;
          }
          // --- FIX: Adjusted Default Case ---
          default:
            // Handle unexpected exercise types safely
            console.warn(
              "Unsupported exercise type encountered in submitAnswer:",
              (exercise as any)?.type
            );
            message = "Cannot check this exercise type.";
            isCorrect = false;
            // Removed the '_exhaustiveCheck: never' which can sometimes conflict with TS inference in hooks
            break;
          // --- End Fix ---
        }
      } catch (error) {
        console.error("Error during answer submission:", error);
        message = "An error occurred while checking the answer.";
        isCorrect = false;
      }

      setState((prev) => ({
        ...prev,
        feedback: { show: true, correct: isCorrect, message: message },
      }));
    },
    [state.currentLesson, state.currentExerciseIndex, state.feedback.show]
  );

  const nextExercise = useCallback(() => {
    if (!state.currentLesson) return;
    const nextIndex = state.currentExerciseIndex + 1;

    // Ensure next index is within bounds
    if (nextIndex < state.currentLesson.exercises.length) {
      // Check the exercise at the next index actually exists
      if (state.currentLesson.exercises[nextIndex]) {
        setState((prev) => ({
          ...prev,
          currentExerciseIndex: nextIndex,
          feedback: { show: false, correct: false, message: "" },
        }));
      } else {
        console.error(
          `Error in nextExercise: Exercise at index ${nextIndex} is undefined.`
        );
        // Fallback: treat as lesson complete if next exercise is invalid
        setState((prev) => ({
          ...prev,
          isLessonComplete: true,
          feedback: { show: false, correct: false, message: "" },
        }));
      }
    } else {
      // Lesson complete
      setState((prev) => ({
        ...prev,
        isLessonComplete: true,
        feedback: { show: false, correct: false, message: "" },
      }));
    }
  }, [state.currentLesson, state.currentExerciseIndex]);

  const retryLesson = useCallback(() => {
    if (!state.currentLesson) return;
    setState((prev) => ({
      ...prev,
      currentExerciseIndex: 0,
      isLessonComplete: false,
      feedback: { show: false, correct: false, message: "" },
    }));
  }, [state.currentLesson]);

  const actions = useMemo(
    () => ({
      startLesson,
      submitAnswer,
      nextExercise,
      exitLesson,
      retryLesson,
    }),
    [startLesson, submitAnswer, nextExercise, exitLesson, retryLesson]
  );

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
  if (context === undefined)
    throw new Error("useDuolingoState must be used within a DuolingoProvider");
  return context;
};

export const useDuolingoActions = () => {
  const context = useContext(DuolingoActionsContext);
  if (context === undefined)
    throw new Error(
      "useDuolingoActions must be used within a DuolingoProvider"
    );
  return context;
};
