// /root/app/apps/monopoly/utils/coordinates.ts
export interface Coordinate {
  x: number;
  y: number;
}

export interface CellCoordinates {
  corner: Coordinate;
  center: Coordinate;
}

export class BoardCoordinates {
  private readonly cells: Map<number, CellCoordinates>;
  private readonly cellSize: number = 65;
  private readonly cornerSize: number = 95;
  private readonly boardSize: number = 800;
  private readonly GO_POSITION = {
    x: 720, // Exact center of GO square
    y: 720, // Exact center of GO square
  };

  constructor() {
    this.cells = new Map();
    this.initializeCoordinates();
  }

  private initializeCoordinates(): void {
    // GO square is special - both pieces go to exact center
    this.cells.set(0, {
      corner: { x: this.GO_POSITION.x - 30, y: this.GO_POSITION.y - 30 },
      center: this.GO_POSITION,
    });

    // Bottom row (1-10)
    for (let i = 1; i <= 10; i++) {
      if (i === 10) {
        // Jail
        this.addCornerCell(10, {
          x: 0,
          y: this.boardSize - this.cornerSize,
        });
      } else {
        this.addCell(i, {
          x: this.boardSize - this.cornerSize - i * this.cellSize,
          y: this.boardSize - this.cellSize,
        });
      }
    }

    // Left column (11-20)
    for (let i = 11; i <= 20; i++) {
      if (i === 20) {
        // Free Parking
        this.addCornerCell(20, {
          x: 0,
          y: 0,
        });
      } else {
        this.addCell(i, {
          x: 0,
          y: this.boardSize - this.cornerSize - (i - 10) * this.cellSize,
        });
      }
    }

    // Top row (21-30)
    for (let i = 21; i <= 30; i++) {
      if (i === 30) {
        // Go to Jail
        this.addCornerCell(30, {
          x: this.boardSize - this.cornerSize,
          y: 0,
        });
      } else {
        this.addCell(i, {
          x: (i - 20) * this.cellSize,
          y: 0,
        });
      }
    }

    // Right column (31-39)
    for (let i = 31; i < 40; i++) {
      this.addCell(i, {
        x: this.boardSize - this.cellSize,
        y: (i - 30) * this.cellSize,
      });
    }
  }

  private addCell(index: number, corner: Coordinate): void {
    this.cells.set(index, {
      corner,
      center: {
        x: corner.x + this.cellSize / 2,
        y: corner.y + this.cellSize / 2,
      },
    });
  }

  private addCornerCell(index: number, corner: Coordinate): void {
    this.cells.set(index, {
      corner,
      center: {
        x: corner.x + this.cornerSize / 2,
        y: corner.y + this.cornerSize / 2,
      },
    });
  }

  public getCell(index: number): CellCoordinates {
    const cell = this.cells.get(index);
    if (!cell) throw new Error(`Invalid cell index: ${index}`);
    return cell;
  }

  public getCellWithOffset(index: number, playerIndex: number): Coordinate {
    const cell = this.getCell(index);

    // Special case for GO square - no offset
    if (index === 0) {
      return cell.center;
    }

    // Normal squares get player offset
    const offsetX = (playerIndex % 2) * 15;
    const offsetY = Math.floor(playerIndex / 2) * 15;

    return {
      x: cell.center.x + offsetX,
      y: cell.center.y + offsetY,
    };
  }
}

export const boardCoordinates = new BoardCoordinates();
