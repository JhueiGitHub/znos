"use client";

import React, { useEffect } from "react";
import MilanoteCanvas from "./components/MilanoteCanvas";
import MilanoteToolbar from "./components/MilanoteToolbar";
import MilanoteBreadcrumb from "./components/MilanoteBreadcrumb";
import { useMilanoteStore } from "./store/milanoteStore";
import { useStyles } from "@/app/hooks/useStyles";
import { MilanoteBoard, ItemType, BoardContent, NoteContent } from "./types";

// Sample board data for initial state
const SAMPLE_BOARDS: Record<string, MilanoteBoard> = {
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
          text: "Welcome to Milanote, a tool for organizing creative projects visually. Drag items from the toolbar, double-click boards to navigate, or double-click the canvas to create link notes. Paste URLs into notes for rich previews: YouTube videos and Sketchfab 3D models embed directly.",
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

export default function MilanotePage() {
  const { getColor } = useStyles();

  // Initialize the store with sample data
  useEffect(() => {
    // Check if boards are already initialized
    const currentBoards = useMilanoteStore.getState().boards;
    if (Object.keys(currentBoards).length === 0) {
      useMilanoteStore.setState({ boards: SAMPLE_BOARDS });
    }
  }, []);

  useEffect(() => {
    // Add a style tag to prevent overscroll behavior
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      html, body {
        overscroll-behavior-x: none !important;
        overflow-x: hidden;
      }
      
      .milanote-canvas {
        touch-action: pan-y pinch-zoom !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <MilanoteBreadcrumb />
      <div className="relative flex-1 overflow-hidden">
        <MilanoteCanvas />
        <MilanoteToolbar />
      </div>
    </div>
  );
}
