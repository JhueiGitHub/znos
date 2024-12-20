"use client";

import { useStyles } from "@os/hooks/useStyles";
import ObsidianContainer from "./components/ObsidianContainer";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";

export default function ObsidianPage() {
  const { getColor } = useStyles();

  return (
    <ObsidianContainer>
      <Sidebar />
      <Editor />
    </ObsidianContainer>
  );
}