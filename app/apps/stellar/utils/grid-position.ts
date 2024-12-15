// Add this to a new file: utils/grid-position.ts

const GRID_SPACING = 100; // Pixels between items
const INITIAL_OFFSET = 50; // Initial padding from top-left
const FOLDER_SIZE = 64; // Width/height of folder icon

interface Position {
  x: number;
  y: number;
}

interface CanvasItem {
  position: Position;
}

export function findFirstAvailableGridPosition(
  existingItems: CanvasItem[]
): Position {
  // Create a set to track occupied positions
  const occupiedPositions = new Set<string>();

  // Add all existing item positions to the set
  existingItems.forEach((item) => {
    const gridX = Math.round((item.position.x - INITIAL_OFFSET) / GRID_SPACING);
    const gridY = Math.round((item.position.y - INITIAL_OFFSET) / GRID_SPACING);
    occupiedPositions.add(`${gridX},${gridY}`);
  });

  // Find first available grid position
  let gridX = 0;
  let gridY = 0;
  let found = false;

  while (!found) {
    const key = `${gridX},${gridY}`;
    if (!occupiedPositions.has(key)) {
      found = true;
    } else {
      // Move to next grid position
      gridX++;
      // Move to next row if we reach the edge (assume 5 items per row)
      if (gridX > 4) {
        gridX = 0;
        gridY++;
      }
    }
  }

  // Convert grid position back to canvas coordinates
  return {
    x: INITIAL_OFFSET + gridX * GRID_SPACING,
    y: INITIAL_OFFSET + gridY * GRID_SPACING,
  };
}

// Check if two items overlap
export function checkOverlap(pos1: Position, pos2: Position): boolean {
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
  return distance < FOLDER_SIZE;
}
