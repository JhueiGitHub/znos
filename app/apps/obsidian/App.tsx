// app/apps/obsidian/App.tsx
"use client";

import React from "react";
import { useStyles } from "@os/hooks/useStyles";
import ObsidianContainer from "./components/obsidian-container";
import Sidebar from "./components/sidebar";
import Editor from "./components/editor";
import { NoteProvider } from "./contexts/note-context";
import "./globals.css";

interface AppProps {
  initialNoteId?: string;
}

const App = ({ initialNoteId }: AppProps) => {
  const { getColor } = useStyles();

  return (
    <NoteProvider initialNoteId={initialNoteId}>
      <div className="h-full w-full bg-black/80">
        <ObsidianContainer>
          <Sidebar />
          <Editor />
        </ObsidianContainer>
      </div>
    </NoteProvider>
  );
};

export default App;
