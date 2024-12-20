"use client";

import { useStyles } from "@os/hooks/useStyles";
import ObsidianContainer from "./components/obsidian-container";
import Sidebar from "./components/sidebar";
import Editor from "./components/editor";

const Home = () => {
  const { getColor } = useStyles();

  return (
    <div className="h-full w-full bg-black/80">
      <ObsidianContainer>
        <Sidebar />
        <Editor />
      </ObsidianContainer>
    </div>
  );
};

export default Home;
