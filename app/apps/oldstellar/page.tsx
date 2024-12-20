"use client";

import { useStyles } from "@os/hooks/useStyles";
import ObsidianContainer from "./components/obsidian-container";
import Sidebar from "./components/sidebar";
import Editor from "./components/editor";

export default function ObsidianPage() {
  const { getColor } = useStyles();

  return (
    <ObsidianContainer>
      <Sidebar />
      <Editor />
    </ObsidianContainer>
  );
}
