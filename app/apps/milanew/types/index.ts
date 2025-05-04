// Types for MilaneW app

// Basic position and size types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Item types
export type ItemType = 
  | "text" 
  | "image" 
  | "video" 
  | "drawing" 
  | "shape" 
  | "connector" 
  | "embed"
  | "handwriting";

// Drawing styles for shapes and connectors
export interface DrawingStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  opacity?: number;
  lineDash?: number[];
  arrowStart?: boolean;
  arrowEnd?: boolean;
}

// Text styles
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color: string;
  backgroundColor?: string;
  padding?: number;
  isHandwriting?: boolean;
}

// Content interfaces for different item types
export interface TextContent {
  text: string;
  style: TextStyle;
}

export interface ImageContent {
  url: string;
  alt?: string;
  caption?: string;
}

export interface VideoContent {
  url: string;
  title?: string;
  autoplay?: boolean;
  startTime?: number;
}

export interface DrawingContent {
  paths: any[]; // SVG path data
  style: DrawingStyle;
}

export interface ShapeContent {
  shapeType: 'rectangle' | 'ellipse' | 'triangle' | 'star' | 'custom';
  points?: Position[]; // For custom shapes
  style: DrawingStyle;
}

export interface ConnectorContent {
  points: Position[];
  style: DrawingStyle;
  label?: string;
  labelStyle?: TextStyle;
}

export interface EmbedContent {
  url: string;
  html?: string;
  type: 'website' | 'pdf' | 'doc' | 'other';
}

export interface HandwritingContent {
  paths: any[]; // SVG path data
  style: DrawingStyle;
  text?: string; // Optional recognized text
}

// Union type for all content types
export type ItemContent =
  | TextContent
  | ImageContent
  | VideoContent
  | DrawingContent
  | ShapeContent
  | ConnectorContent
  | EmbedContent
  | HandwritingContent;

// Lesson canvas item
export interface LessonItem {
  id: string;
  type: ItemType;
  position: Position;
  size?: Size;
  rotation?: number;
  content: ItemContent;
  zIndex: number;
  locked?: boolean;
  groupId?: string;
}

// Canvas/page in a lesson
export interface LessonCanvas {
  id: string;
  name: string;
  items: LessonItem[];
  background?: {
    color?: string;
    image?: string;
    grid?: boolean;
  };
}

// Complete lesson structure
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  created: Date;
  modified: Date;
  canvases: LessonCanvas[];
  tags?: string[];
  thumbnail?: string;
}

// Canvas view state
export interface CanvasState {
  position: Position;
  scale: number;
  selectedItemIds: string[];
  activeToolType?: string;
}

// Tool settings
export interface ToolSettings {
  drawing: DrawingStyle;
  text: TextStyle;
  currentColor: string;
  currentLineWidth: number;
  snapToGrid: boolean;
  gridSize: number;
}

// History action for undo/redo
export interface HistoryAction {
  type: string;
  payload: any;
  timestamp: number;
}

// Export format options
export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'html';

// Export settings
export interface ExportSettings {
  format: ExportFormat;
  quality?: number;
  includeBackground: boolean;
  pageSize?: 'a4' | 'letter' | 'custom';
  customSize?: Size;
}
