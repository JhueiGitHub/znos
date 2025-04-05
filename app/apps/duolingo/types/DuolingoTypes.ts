// /root/app/apps/duolingo/types/DuolingoTypes.ts

export type ExerciseType =
  | "TRANSLATE_TO_ITALIAN"
  | "TRANSLATE_TO_ENGLISH"
  | "MULTIPLE_CHOICE_TRANSLATE"
  | "MATCH_PAIRS";
// Add more types like 'FILL_IN_BLANK', 'LISTEN_AND_TYPE' etc. later

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
}

export interface TranslateExercise extends BaseExercise {
  type: "TRANSLATE_TO_ITALIAN" | "TRANSLATE_TO_ENGLISH";
  correctAnswer: string[]; // Array to allow multiple correct variations
  options: string[]; // Word bank options
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
  pairs: MatchPair[]; // Pairs will be shuffled in the component
}

export type Exercise =
  | TranslateExercise
  | MultipleChoiceExercise
  | MatchPairsExercise; // Union of all exercise types

export interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
}
