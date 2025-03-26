// app/apps/mila/data/sampleData.ts
import { MilanoteBoard, ItemType, BoardContent, NoteContent } from "../types";

// Sample board data for initial state
export const SAMPLE_BOARDS: Record<string, MilanoteBoard> = {
  root: {
    id: "root",
    name: "Brand Kit",
    items: [
      {
        id: "board_colors",
        type: "board" as ItemType,
        position: { x: 100, y: 100 },
        content: {
          name: "Colors",
          icon: "/media/finder.png", // Using a more reliable icon path
          color: "black-med",
        } as BoardContent,
        zIndex: 1,
      },
      {
        id: "board_patterns",
        type: "board" as ItemType,
        position: { x: 300, y: 100 },
        content: {
          name: "Patterns",
          icon: "/media/settings.png", // Using a more reliable icon path
          color: "black-med",
        } as BoardContent,
        zIndex: 2,
      },
      {
        id: "board_fonts",
        type: "board" as ItemType,
        position: { x: 500, y: 100 },
        content: {
          name: "Fonts",
          icon: "/media/editor.png", // Using a more reliable icon path
          color: "black-med",
        } as BoardContent,
        zIndex: 3,
      },
      {
        id: "note_welcome",
        type: "note" as ItemType,
        position: { x: 100, y: 300 },
        content: {
          title: "Welcome to Milanote",
          text: "Welcome to Milanote, a tool for organizing creative projects visually. Drag items from the toolbar, double-click boards to navigate, or double-click the canvas to create notes.\n\nPress § when editing a note to activate shorthand mode. The note will glow while shorthand is active.\n\nPaste URLs into notes for rich previews: YouTube videos and Sketchfab 3D models embed directly when a note only contains a URL.",
          color: "night-med",
        } as NoteContent,
        zIndex: 4,
      },
    ],
    parentId: undefined,
  },
  board_colors: {
    id: "board_colors",
    name: "Colors",
    items: [
      {
        id: "note_purple",
        type: "note" as ItemType,
        position: { x: 100, y: 100 },
        content: {
          title: "Purple",
          text: "#2F1644",
          color: "night-med",
        } as NoteContent,
        zIndex: 1,
      },
      {
        id: "note_rose",
        type: "note" as ItemType,
        position: { x: 320, y: 100 },
        content: {
          title: "Turkish Rose",
          text: "#AF8B78",
          color: "night-med",
        } as NoteContent,
        zIndex: 2,
      },
      {
        id: "note_peach",
        type: "note" as ItemType,
        position: { x: 540, y: 100 },
        content: {
          title: "Peach",
          text: "#F89F65",
          color: "night-med",
        } as NoteContent,
        zIndex: 3,
      },
    ],
    parentId: "root",
  },
  board_patterns: {
    id: "board_patterns",
    name: "Patterns",
    items: [
      {
        id: "note_pattern1",
        type: "note" as ItemType,
        position: { x: 100, y: 100 },
        content: {
          title: "Grid Pattern",
          text: "Used for backgrounds and layout guides",
          color: "night-med",
        } as NoteContent,
        zIndex: 1,
      },
    ],
    parentId: "root",
  },
  board_fonts: {
    id: "board_fonts",
    name: "Fonts",
    items: [
      {
        id: "note_font1",
        type: "note" as ItemType,
        position: { x: 100, y: 100 },
        content: {
          title: "Inter",
          text: "Primary font for the UI and content",
          color: "night-med",
        } as NoteContent,
        zIndex: 1,
      },
      {
        id: "note_font2",
        type: "note" as ItemType,
        position: { x: 320, y: 100 },
        content: {
          title: "Cheltenham",
          text: "Header font for headers and titles",
          color: "night-med",
        } as NoteContent,
        zIndex: 2,
      },
    ],
    parentId: "root",
  },
};

// Example URLs for shorthand testing
export const EXAMPLE_EMBED_URLS = {
  youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  sketchfab:
    "https://sketchfab.com/3d-models/medieval-fantasy-book-06d5a80a04fc4c5ab552759e9a97d91a",
  website: "https://reactjs.org",
};
