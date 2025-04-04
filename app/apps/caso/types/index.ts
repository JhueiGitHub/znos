// app/apps/mila/types/index.ts (updated)

export type ItemType = "note" | "board" | "image" | "link";

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number | "auto";
  height: number | "auto";
}

export interface Size {
  width: number;
  height: number;
}

export interface NoteContent {
  title: string;
  text: string;
  color?: string;
}

export interface BoardContent {
  name: string;
  icon?: string;
  color?: string;
}

export interface ImageContent {
  url: string;
  alt?: string;
  color?: string;
}

export interface LinkContent {
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  color?: string; // Added color property to match other content types
}

export type ItemContent =
  | NoteContent
  | BoardContent
  | ImageContent
  | LinkContent;

export interface MilanoteItem {
  id: string;
  type: ItemType;
  position: Position;
  size?: Dimensions;
  content: ItemContent;
  zIndex?: number;
}

export interface MilanoteBoard {
  id: string;
  name: string;
  icon?: string;
  items: MilanoteItem[];
  parentId?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}
