// /root/app/apps/duolingo/data/italianLessons.ts
import { LessonNodeData, Exercise } from "../types/DuolingoTypes";

// --- Extracted Pixel Coordinates (Top-Left based) ---
const nodeCoordinates = [
  { x: 98, y: 24 }, // Start
  { x: 108.24, y: 80.53 }, // basics-1
  { x: 93.8, y: 124.17 }, // checkpoint-1
  { x: 74.24, y: 170.53 }, // basics-2
  { x: 53.24, y: 207.53 }, // basics-3
  { x: 41.19, y: 248.23 }, // phrases-1
  { x: 53.24, y: 289.53 }, // phrases-2
  { x: 72.31, y: 328.31 }, // checkpoint-2
  { x: 96.24, y: 374.53 }, // phrases-3
  { x: 74.24, y: 411.53 }, // food-1
  // Add more coordinates...
];

// --- Node Data ---
export const italianLessonNodes: LessonNodeData[] = [
  {
    id: "start",
    title: "Start",
    type: "start",
    status: "available",
    exercises: [],
    position: nodeCoordinates[0],
    size: { width: 43, height: 43 },
  },
  {
    id: "basics-1",
    title: "Basics 1",
    type: "lesson",
    status: "available",
    // --- Exercises for Basics 1 ---
    exercises: [
       // Exercise 1: Tap Translation (IT -> EN)
       {
           id: 'b1ex1', type: 'TRANSLATE_TO_ENGLISH', prompt: 'Translate:',
           textToTranslate: "Io sono un ragazzo", audioSrc: '/apps/duolingo/audio/io_sono_un_ragazzo.mp3',
           correctAnswer: ["i am a boy"], // Used for potential future typed validation
           correctAnswerTiles: ["I", "am", "a", "boy"],
           options: ["I", "apple", "am", "boy", "the", "a", "is", "woman"] // Word bank
       },
       // Exercise 2: Multiple Choice (Select Translation)
       {
           id: 'b1ex2', type: 'MULTIPLE_CHOICE_TRANSLATE', prompt: 'Select the translation:',
           questionText: "la mela", audioSrc: '/apps/duolingo/audio/la_mela.mp3',
           options: ["the boy", "the apple", "the woman"],
           correctAnswer: "the apple"
       },
        // Exercise 3: Tap Translation (EN -> IT)
       {
           id: 'b1ex3', type: 'TRANSLATE_TO_ITALIAN', prompt: 'Translate:',
           textToTranslate: "You are a woman",
           correctAnswer: ["tu sei una donna"],
           correctAnswerTiles: ["Tu", "sei", "una", "donna"],
           options: ["Io", "Tu", "un", "sono", "sei", "donna", "ragazzo", "una", "mela"]
       },
        // Exercise 4: Matching Pairs
        {
            id: 'b1ex4', type: 'MATCH_PAIRS', prompt: 'Match the pairs:',
            pairs: [
                { itemA: {id: 'p1a', text: 'boy'}, itemB: {id: 'p1b', text: 'ragazzo'} },
                { itemA: {id: 'p2a', text: 'I am'}, itemB: {id: 'p2b', text: 'Io sono'} },
                { itemA: {id: 'p3a', text: 'woman'}, itemB: {id: 'p3b', text: 'donna'} },
                { itemA: {id: 'p4a', text: 'you are'}, itemB: {id: 'p4b', text: 'Tu sei'} },
            ]
        },
        // Exercise 5: Multiple Choice (Select Translation)
       {
           id: 'b1ex5', type: 'MULTIPLE_CHOICE_TRANSLATE', prompt: 'Select the translation:',
           questionText: "l'uomo", audioSrc: '/apps/duolingo/audio/luomo.mp3', // Assume audio exists
           options: ["the apple", "the boy", "the man", "the water"],
           correctAnswer: "the man"
       },
        // Exercise 6: Tap Translation (IT -> EN)
       {
           id: 'b1ex6', type: 'TRANSLATE_TO_ENGLISH', prompt: 'Translate:',
           textToTranslate: "Lui è un uomo", audioSrc: '/apps/duolingo/audio/lui_e_un_uomo.mp3',
           correctAnswer: ["he is a man"],
           correctAnswerTiles: ["He", "is", "a", "man"],
           options: ["She", "He", "apple", "is", "man", "a", "boy", "am"]
       },
    ],
    // --- End Exercises ---
    position: nodeCoordinates[1],
    size: { width: 33.52, height: 33.52 },
  },
  {
    id: "checkpoint-1",
    title: "Checkpoint",
    type: "checkpoint",
    status: "locked",
    exercises: [ /* Checkpoints need exercises too */
        { id: 'cp1ex1', type: 'MULTIPLE_CHOICE_TRANSLATE', prompt: 'Translate "You are"', options: ["Io sono", "Tu sei", "Lui è"], correctAnswer: "Tu sei" },
    ],
    position: nodeCoordinates[2],
    size: { width: 38.31, height: 38.31 },
  },
  {
    id: "basics-2",
    title: "Basics 2",
    type: "lesson",
    status: "locked",
    exercises: [ /* Add exercises later */ ],
    position: nodeCoordinates[3],
    size: { width: 33.52, height: 33.52 },
  },
  // ... rest of the nodes defined previously, ensuring exercises are empty [] for locked lessons for now
  { id: "basics-3", title: "Basics 3", type: "lesson", status: "locked", exercises: [], position: nodeCoordinates[4], size: { width: 33.52, height: 33.52 } },
  { id: "phrases-1", title: "Phrases 1", type: "lesson", status: "locked", exercises: [], position: nodeCoordinates[5], size: { width: 33.52, height: 33.52 } },
  { id: "phrases-2", title: "Phrases 2", type: "lesson", status: "locked", exercises: [], position: nodeCoordinates[6], size: { width: 33.52, height: 33.52 } },
  { id: "checkpoint-2", title: "Checkpoint", type: "checkpoint", status: "locked", exercises: [/* Add exercises later */], position: nodeCoordinates[7], size: { width: 38.31, height: 38.31 } },
  { id: "phrases-3", title: "Phrases 3", type: "lesson", status: "locked", exercises: [], position: nodeCoordinates[8], size: { width: 33.52, height: 33.52 } },
  { id: "food-1", title: "Food 1", type: "lesson", status: "locked", exercises: [], position: nodeCoordinates[9], size: { width: 33.52, height: 33.52 } },

];

// --- calculateSnakeHeight ---
export const calculateSnakeHeight = () => {
  const maxY = italianLessonNodes.reduce( (max, node) => Math.max(max, node.position.y + (node.size?.height || 64)), 0 );
  return maxY + 50;
};

// --- characterPositions ---
export const characterPositions = [
  { id: "char1", left: 0, top: 70.62 },
  { id: "char2", left: 134.09, top: 237.56 }
];