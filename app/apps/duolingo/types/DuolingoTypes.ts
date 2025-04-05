// /root/app/apps/duolingo/types/DuolingoTypes.ts

// Base Exercise Types (Translate, Multiple Choice, Match Pairs are needed for basics-1)
export type ExerciseType =
  | "TRANSLATE_TO_ITALIAN" // Represents Tap-the-word bank for now
  | "TRANSLATE_TO_ENGLISH" // Represents Tap-the-word bank for now
  | "MULTIPLE_CHOICE_TRANSLATE" // Text-based multiple choice
  | "MATCH_PAIRS";
// Add more types like 'LISTEN_AND_TYPE', 'SELECT_IMAGE_MC' etc. as needed

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  audioSrc?: string; // Optional audio associated with prompt/text
}

// Specific Exercise Interfaces
export interface TranslateExercise extends BaseExercise {
  type: "TRANSLATE_TO_ITALIAN" | "TRANSLATE_TO_ENGLISH";
  textToTranslate?: string; // Text to show if different from prompt
  correctAnswer: string[]; // Array allows multiple correct variations (e.g., "I am", "I'm") - Primarily for typed input later. For tap-the-word, use correctAnswerTiles.
  correctAnswerTiles: string[]; // The correct sequence of tiles for tap-the-word
  options: string[]; // Word bank options for tap-the-word
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: "MULTIPLE_CHOICE_TRANSLATE";
  questionText?: string; // The specific text for the question if needed
  options: string[]; // Text options
  correctAnswer: string; // The exact string of the correct option
}

export interface MatchPairItem {
  id: string;
  text: string;
} // Unique ID for each item in a pair
export interface MatchPairsExercise extends BaseExercise {
  type: "MATCH_PAIRS";
  // Array of correct pairs. Each sub-array contains two related items.
  // The component will shuffle these for presentation.
  pairs: { itemA: MatchPairItem; itemB: MatchPairItem }[];
}

// Union of all implemented Exercise types
export type Exercise =
  | TranslateExercise
  | MultipleChoiceExercise
  | MatchPairsExercise;

// --- Node Data on the Snake Path ---
export type LessonNodeType = "start" | "lesson" | "checkpoint";
export type LessonNodeStatus = "locked" | "available" | "completed";
export interface NodePosition {
  x: number;
  y: number;
} // Pixels
export interface NodeSize {
  width: number;
  height: number;
}

export interface LessonNodeData {
  id: string; // Skill ID (e.g., 'basics-1', 'checkpoint-1')
  // unitTitle: string; // Add if you want Unit grouping later
  title: string; // Skill Title (e.g., "Basics 1", "Phrases", "Checkpoint")
  type: LessonNodeType;
  status: LessonNodeStatus;
  exercises: Exercise[]; // Exercises for one "level" of this skill node
  position: NodePosition;
  size?: NodeSize;
}
