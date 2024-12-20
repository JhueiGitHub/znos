"use client";

import { useStyles } from "@os/hooks/useStyles";
import ObsidianContainer from "./components/obsidian-container";
import Sidebar from "./components/sidebar";
import Editor from "./components/editor";

const Home = () => {
  const { getColor } = useStyles();

  return (
    <ObsidianContainer>
      <Sidebar />
      <Editor />
    </ObsidianContainer>
  );
};

export default Home;
