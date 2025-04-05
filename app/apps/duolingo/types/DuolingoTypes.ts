// /root/app/apps/duolingo/types/DuolingoTypes.ts

export type ExerciseType =
  | "TRANSLATE_TO_ITALIAN"
  | "TRANSLATE_TO_ENGLISH"
  | "MULTIPLE_CHOICE_TRANSLATE"
  | "MATCH_PAIRS";

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
}
export interface TranslateExercise extends BaseExercise {
  type: "TRANSLATE_TO_ITALIAN" | "TRANSLATE_TO_ENGLISH";
  correctAnswer: string[];
  options: string[];
}
export interface MultipleChoiceExercise extends BaseExercise {
  type: "MULTIPLE_CHOICE_TRANSLATE";
  options: string[];
  correctAnswer: string;
}
export interface MatchPair {
  id: string;
  text: string;
  matchId: string;
}
export interface MatchPairsExercise extends BaseExercise {
  type: "MATCH_PAIRS";
  pairs: MatchPair[];
}
export type Exercise =
  | TranslateExercise
  | MultipleChoiceExercise
  | MatchPairsExercise;

export type LessonNodeType = "start" | "lesson" | "checkpoint";
export type LessonNodeStatus = "locked" | "available" | "completed";

export interface NodePosition {
  x: number; // PIXELS from left
  y: number; // PIXELS from top
}

export interface NodeSize {
  // Optional size override
  width: number;
  height: number;
}

export interface LessonNodeData {
  id: string;
  title: string;
  type: LessonNodeType;
  status: LessonNodeStatus;
  exercises: Exercise[];
  position: NodePosition;
  size?: NodeSize; // Add optional size
}
