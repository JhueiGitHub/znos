// /root/app/apps/duolingo/data/italianLessons.ts
import { LessonNodeData, Exercise } from "../types/DuolingoTypes";

// --- Extracted Pixel Coordinates (Top-Left based) ---
// Coordinates are { x: left_pixel, y: top_pixel } relative to a 178px wide container
const nodeCoordinates = [
  { x: 98, y: 24 }, // Start (Progress illustration)
  { x: 108.24, y: 80.53 }, // Lesson 1 (Lesson 2 of 4 in Figma)
  { x: 93.8, y: 124.17 }, // Checkpoint 1 (Progress Check)
  { x: 74.24, y: 170.53 }, // Lesson 2 (Lesson 2 of 6)
  { x: 53.24, y: 207.53 }, // Lesson 3 (Lesson 2 of 8)
  { x: 41.19, y: 248.23 }, // Lesson 4 (Lesson - Lock Icon) -> Changed type to lesson, status locked
  { x: 53.24, y: 289.53 }, // Lesson 5 (Lesson 2 of 9)
  { x: 72.31, y: 328.31 }, // Checkpoint 2 (Progress Check)
  { x: 96.24, y: 374.53 }, // Lesson 6 (Lesson 2 of 7)
  { x: 74.24, y: 411.53 }, // Lesson 7 (Lesson 2 of 10)
  // Add more coordinates extracted from your full design if needed...
  // Example continuation (adjust based on your full design):
  // { x: 50, y: 460 },
  // { x: 80, y: 510 },
];

// --- Node Data - Map Sequentially to Coordinates ---
// Note: The lesson IDs ('basics-1', etc.) might not perfectly match the Figma labels ("Lesson 2 of X")
// We are mapping our defined lessons onto the Figma visual positions.
export const italianLessonNodes: LessonNodeData[] = [
  {
    id: "start",
    title: "Start", // Title for accessibility, visually overridden
    type: "start", // Matches 'Progress illustration' visually
    status: "available",
    exercises: [],
    position: nodeCoordinates[0],
    // Add size based on Figma if needed for specific nodes
    size: { width: 43, height: 43 },
  },
  {
    id: "basics-1",
    title: "Basics 1",
    type: "lesson", // Star Icon
    status: "available",
    exercises: [
      /* Your exercises */
    ],
    position: nodeCoordinates[1],
    size: { width: 33.52, height: 33.52 }, // Approximate from Figma
  },
  {
    id: "checkpoint-1",
    title: "Checkpoint",
    type: "checkpoint", // Chest Icon
    status: "locked",
    exercises: [
      /* Checkpoint exercises */
    ],
    position: nodeCoordinates[2],
    size: { width: 38.31, height: 38.31 }, // Approximate from Figma
  },
  {
    id: "basics-2",
    title: "Basics 2",
    type: "lesson",
    status: "locked",
    exercises: [
      /* Exercises */
    ],
    position: nodeCoordinates[3],
    size: { width: 33.52, height: 33.52 },
  },
  {
    id: "basics-3",
    title: "Basics 3",
    type: "lesson",
    status: "locked",
    exercises: [
      /* Exercises */
    ],
    position: nodeCoordinates[4],
    size: { width: 33.52, height: 33.52 },
  },
  {
    id: "phrases-1", // Mapped to the 'Lesson' with Lock Icon position
    title: "Phrases 1",
    type: "lesson", // Represented by lock icon due to status
    status: "locked",
    exercises: [
      /* Exercises */
    ],
    position: nodeCoordinates[5],
    size: { width: 33.52, height: 33.52 },
  },
  {
    id: "phrases-2",
    title: "Phrases 2",
    type: "lesson",
    status: "locked",
    exercises: [
      /* Exercises */
    ],
    position: nodeCoordinates[6],
    size: { width: 33.52, height: 33.52 },
  },
  {
    id: "checkpoint-2",
    title: "Checkpoint",
    type: "checkpoint",
    status: "locked",
    exercises: [
      /* Checkpoint exercises */
    ],
    position: nodeCoordinates[7],
    size: { width: 38.31, height: 38.31 },
  },
  {
    id: "phrases-3",
    title: "Phrases 3",
    type: "lesson",
    status: "locked",
    exercises: [
      /* Exercises */
    ],
    position: nodeCoordinates[8],
    size: { width: 33.52, height: 33.52 },
  },
  {
    id: "food-1",
    title: "Food 1",
    type: "lesson",
    status: "locked",
    exercises: [
      /* Exercises */
    ],
    position: nodeCoordinates[9],
    size: { width: 33.52, height: 33.52 },
  },
  // Add more nodes matching coordinates...
];

// Function to determine the required height for the container
export const calculateSnakeHeight = () => {
  const maxY = italianLessonNodes.reduce(
    (max, node) => Math.max(max, node.position.y + (node.size?.height || 64)),
    0
  ); // Add node height
  return maxY + 50; // Add padding below the last node
};

// --- Add Character Positions from Figma ---
export const characterPositions = [
  { id: "char1", left: 0, top: 70.62, svgPath: "/path/to/character1.svg" }, // Replace with actual SVG paths or inline SVG
  {
    id: "char2",
    left: 134.09,
    top: 237.56,
    svgPath: "/path/to/character2.svg",
  },
];
