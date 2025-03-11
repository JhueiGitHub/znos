// app/apps/orion/lib/types.ts

export interface Node {
  id: string;
  type: "note" | "image" | "link" | "file";
  content: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
  };
  zIndex: number;
}

export interface Canvas {
  id: string;
  name: string;
  nodes: Node[];
  viewportTransform: {
    zoom: number;
    pan: { x: number; y: number };
  };
}

export interface StarfieldOptions {
  density: number; // How many stars per 1000x1000px
  size: [number, number]; // Min/max size of stars
  speed: [number, number]; // Min/max animation speed
  colors: string[]; // Array of star colors
  depth: number; // How many star layers (for parallax effect)
  parallaxFactor: number; // How much the parallax effect is
}

export interface StarfieldState extends StarfieldOptions {
  canvasWidth: number;
  canvasHeight: number;
  viewportTransform: {
    zoom: number;
    pan: { x: number; y: number };
  };
}
