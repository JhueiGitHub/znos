"use client";

import { useState, useEffect } from "react";
import { useMSM } from "../context/MSMContext";
import { Island } from "../types/game";
import GameHeader from "./GameHeader";
import IslandView from "./IslandView";
import GameMenu from "./GameMenu";
import ShopModal from "./ShopModal";
import BreedingModal from "./BreedingModal";
import CollectionModal from "./CollectionModal";
import SettingsModal from "./SettingsModal";
import MusicControlBar from "./MusicControlBar";
import IntroScreen from "./IntroScreen";
import { generateNote } from "../utils/audioEngine";

// Modal types
type ModalType = "none" | "shop" | "breeding" | "collection" | "settings";

const GameApp = () => {
  const { islands, currentIslandId, setCurrentIsland, togglePlay, isPlaying } =
    useMSM();

  // UI state
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [showIntro, setShowIntro] = useState(true);
  const [isGameLoaded, setIsGameLoaded] = useState(false);

  // Get the current island object
  const currentIsland = islands.find((island) => island.id === currentIslandId);

  // Handle island selection
  const handleIslandSelect = (islandId: string) => {
    // Play a selection sound
    generateNote("C4", "piano", 0.2, 0.7, ["vibrato"]);
    setCurrentIsland(islandId);
    closeModal();
  };

  // Handle menu button clicks
  const openModal = (type: ModalType) => {
    // Play a UI sound
    generateNote("A4", "piano", 0.1, 0.5);
    setActiveModal(type);
  };

  const closeModal = () => {
    // Play a UI sound
    generateNote("E4", "piano", 0.1, 0.5);
    setActiveModal("none");
  };

  // Set up the game environment
  useEffect(() => {
    if (showIntro) return;

    // Simulate loading assets and initializing game
    const loadingTimer = setTimeout(() => {
      setIsGameLoaded(true);
    }, 1000);

    return () => clearTimeout(loadingTimer);
  }, [showIntro]);

  // Skip intro for development
  useEffect(() => {
    // In production, you might want to check if the user has seen the intro before
    const hasSeenIntro = localStorage.getItem("msm-has-seen-intro");
    if (hasSeenIntro === "true") {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    // Play a UI sound
    generateNote("C5", "piano", 0.3, 0.8, ["reverb"]);
    localStorage.setItem("msm-has-seen-intro", "true");
    setShowIntro(false);
  };

  // If showing intro screen
  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  // If game is loading
  if (!isGameLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#44b4e5] to-[#7147e8]">
        <div className="w-32 h-32 animate-bounce">
          <img
            src="/images/msm/logo.png"
            alt="My Singing Monsters"
            className="w-full h-full"
          />
        </div>
        <div className="mt-8 text-2xl font-bold text-white msm-title">
          Loading Harmony Island...
        </div>
        <div className="mt-4 w-64 h-4 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ffbd36] rounded-full animate-pulse"
            style={{ width: "65%" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Game Header */}
      <GameHeader onMenuClick={(type) => openModal(type as ModalType)} />

      {/* Island View (Main game area) */}
      <IslandView island={currentIsland as Island} />

      {/* Island Selection Menu */}
      <GameMenu
        islands={islands}
        currentIslandId={currentIslandId}
        onIslandSelect={handleIslandSelect}
      />

      {/* Music Control Bar */}
      <MusicControlBar isPlaying={isPlaying} onTogglePlay={togglePlay} />

      {/* Modals */}
      {activeModal === "shop" && <ShopModal onClose={closeModal} />}

      {activeModal === "breeding" && <BreedingModal onClose={closeModal} />}

      {activeModal === "collection" && <CollectionModal onClose={closeModal} />}

      {activeModal === "settings" && <SettingsModal onClose={closeModal} />}
    </div>
  );
};

export default GameApp;
