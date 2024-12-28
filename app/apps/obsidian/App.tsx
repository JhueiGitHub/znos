// App.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useStyles } from "@os/hooks/useStyles";
import Sidebar from "./components/sidebar";
import Editor from "./components/editor";
import { NoteProvider } from "./contexts/note-context";
import { AnimatePresence, motion } from "framer-motion";
import "./globals.css";

interface AppProps {
  initialNoteId?: string;
}

const App = ({ initialNoteId }: AppProps) => {
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key.toLowerCase() === "x") {
        e.preventDefault();
        setAreSidebarsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarAnimation = {
    initial: { width: 0, opacity: 0 },
    animate: { width: 238, opacity: 1 },
    exit: { width: 0, opacity: 0 },
    transition: {
      duration: 0.2,
      ease: [0.4, 0.0, 0.2, 1], // easeInOut
    },
  };

  return (
    <NoteProvider initialNoteId={initialNoteId}>
      <AppContent
        areSidebarsVisible={areSidebarsVisible}
        sidebarAnimation={sidebarAnimation}
      />
    </NoteProvider>
  );
};

interface AppContentProps {
  areSidebarsVisible: boolean;
  sidebarAnimation: any;
}

const AppContent = ({
  areSidebarsVisible,
  sidebarAnimation,
}: AppContentProps) => {
  return (
    <div className="h-full w-full bg-black/80">
      <div className="h-full w-full bg-[#4c4f6924] p-4">
        <div className="flex h-full w-full">
          <AnimatePresence initial={false} mode="wait">
            {areSidebarsVisible && (
              <motion.div
                {...sidebarAnimation}
                className="shrink-0"
                style={{ overflow: "hidden" }}
              >
                <div className="w-[222px] pr-4 h-full">
                  <Sidebar />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1">
            <Editor />
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#cccccc]/50 text-xs">
          Press ⌘ X to toggle sidebar
        </div>
      </div>
    </div>
  );
};

export default App;
