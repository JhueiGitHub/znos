// hooks/useGrid.ts
import { Position } from "../types/stellar";

interface GridConfig {
  spacing: number;
  initialOffset: number;
  columns: number;
  itemSize: number;
}

export const defaultGridConfig: GridConfig = {
  spacing: 100,
  initialOffset: 50,
  columns: 8,
  itemSize: 64,
};

export function useGrid(config: GridConfig = defaultGridConfig) {
  const isPositionOccupied = (
    position: Position,
    occupiedPositions: Position[]
  ): boolean => {
    return occupiedPositions.some(
      (occupied) =>
        Math.abs(occupied.x - position.x) < config.itemSize &&
        Math.abs(occupied.y - position.y) < config.itemSize
    );
  };

  const findNextAvailablePosition = (
    occupiedPositions: Position[]
  ): Position => {
    const sorted = [...occupiedPositions].sort((a, b) => {
      if (a.y === b.y) return a.x - b.x;
      return a.y - b.y;
    });

    // Try filling in gaps in current row
    if (sorted.length > 0) {
      const lastPos = sorted[sorted.length - 1];
      const rowY = lastPos.y;

      for (
        let x = config.initialOffset;
        x < config.spacing * config.columns;
        x += config.spacing
      ) {
        const testPos = { x, y: rowY };
        if (!isPositionOccupied(testPos, occupiedPositions)) {
          return testPos;
        }
      }
    }

    // Start new row if current is full
    const currentRow = Math.floor(
      (sorted[sorted.length - 1]?.y ?? 0) / config.spacing
    );
    return {
      x: config.initialOffset,
      y: config.initialOffset + (currentRow + 1) * config.spacing,
    };
  };

  return {
    isPositionOccupied,
    findNextAvailablePosition,
  };
}
