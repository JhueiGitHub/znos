"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Island } from "../types/game";
import { useMSM } from "../context/MSMContext";
import MonsterPlacement from "./MonsterPlacement";
import PlacementGhost from "./PlacementGhost";
import { generateNote } from "../utils/audioEngine";

interface IslandViewProps {
  island: Island;
}

const IslandView: React.FC<IslandViewProps> = ({ island }) => {
  const { monsterPlacements, monsters, placeMonster, collectCoins, isPlaying } =
    useMSM();

  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(
    null
  );
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPlacingMonster, setIsPlacingMonster] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset" | "night">("day");

  const islandRef = useRef<HTMLDivElement>(null);

  // Get placements for current island
  const islandPlacements = monsterPlacements.filter(
    (placement) => placement.islandId === island.id
  );

  // Environmental effects setup
  useEffect(() => {
    // Time of day cycle
    if (island.environment?.timeOfDay === "cycle") {
      const cycle = ["day", "sunset", "night"];
      let currentIndex = 0;

      const cycleInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % cycle.length;
        setTimeOfDay(cycle[currentIndex] as "day" | "sunset" | "night");
      }, 60000); // Change every minute for demo

      return () => clearInterval(cycleInterval);
    } else if (island.environment?.timeOfDay) {
      setTimeOfDay(island.environment.timeOfDay as "day" | "sunset" | "night");
    }
  }, [island]);

  // Handle mouse/touch move for placement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!islandRef.current || !isPlacingMonster) return;

    const rect = islandRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGhostPosition({ x, y });
  };

  // Handle monster placement
  const handlePlaceMonster = () => {
    if (!selectedMonsterId || !isPlacingMonster) return;

    // Place the monster at the ghost position
    placeMonster(selectedMonsterId, ghostPosition);

    // Play placement sound
    generateNote("G4", "marimba", 0.3, 0.7, ["reverb"]);

    // Reset placement state
    setSelectedMonsterId(null);
    setIsPlacingMonster(false);
  };

  // Select a monster from the book to place
  const startPlacement = (monsterId: string) => {
    setSelectedMonsterId(monsterId);
    setIsPlacingMonster(true);

    // Play selection sound
    generateNote("E4", "piano", 0.1, 0.6);
  };

  // Cancel placement on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPlacingMonster) {
        setSelectedMonsterId(null);
        setIsPlacingMonster(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlacingMonster]);

  // Get time of day styles
  const getTimeOfDayStyles = () => {
    switch (timeOfDay) {
      case "day":
        return {
          backgroundColor: "#87CEEB",
          overlay: "rgba(255, 255, 255, 0)",
        };
      case "sunset":
        return {
          backgroundColor: "#FF7E47",
          overlay: "rgba(255, 120, 50, 0.2)",
        };
      case "night":
        return {
          backgroundColor: "#0A1F44",
          overlay: "rgba(0, 0, 50, 0.4)",
        };
      default:
        return {
          backgroundColor: "#87CEEB",
          overlay: "rgba(255, 255, 255, 0)",
        };
    }
  };

  const timeStyles = getTimeOfDayStyles();

  return (
    <div
      ref={islandRef}
      className="msm-island relative w-full h-full"
      style={{
        backgroundImage: `url(${island.imageUrl})`,
        backgroundColor: timeStyles.backgroundColor,
      }}
      onMouseMove={handleMouseMove}
      onClick={handlePlaceMonster}
    >
      {/* Time of day overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: timeStyles.overlay }}
      />

      {/* Environmental effects */}
      {island.environment?.weather === "cloudy" && (
        <div
          className="msm-clouds"
          style={{ backgroundImage: "url(/images/msm/environment/clouds.png)" }}
        />
      )}

      {/* Island name and info */}
      <div className="absolute top-20 left-4 z-10">
        <div className="msm-resource bg-white/80 py-1 px-4 text-lg">
          <h2 className="msm-heading text-[#7147e8]">{island.name}</h2>
        </div>

        <button
          className="mt-2 flex items-center gap-1 bg-white/60 rounded-full py-1 px-3 text-sm"
          onClick={() => setShowInfoDrawer(!showInfoDrawer)}
        >
          <img
            src="/images/msm/icons/info.png"
            alt="Info"
            className="w-4 h-4"
          />
          <span className="msm-text">Island Info</span>
        </button>
      </div>

      {/* Info drawer */}
      <AnimatePresence>
        {showInfoDrawer && (
          <motion.div
            className="absolute bottom-24 left-4 w-80 bg-white/90 rounded-lg p-4 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h3 className="msm-heading text-[#7147e8] mb-2">{island.name}</h3>
            <p className="msm-text text-sm mb-3">{island.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {island.elements.map((element) => (
                <div
                  key={element}
                  className="px-2 py-1 rounded-full text-xs msm-text text-white"
                  style={{
                    backgroundColor: `var(--msm-${element})`,
                    textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                  }}
                >
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </div>
              ))}
            </div>

            <div className="text-sm msm-text">
              <span className="font-bold">Max Monsters:</span>{" "}
              {island.maxMonsters}
            </div>

            <div className="mt-3 text-xs text-right msm-text text-gray-600">
              {islandPlacements.length} / {island.maxMonsters} monsters placed
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available monster browser */}
      {!isPlacingMonster && (
        <div className="absolute bottom-20 right-4 flex flex-col gap-2 items-end">
          <button
            className="msm-button py-2 px-4 flex items-center gap-2"
            onClick={() => setShowInfoDrawer(!showInfoDrawer)}
          >
            <img
              src="/images/msm/icons/monster.png"
              alt="Place Monster"
              className="w-6 h-6"
            />
            <span className="msm-text">Place Monster</span>
          </button>

          <div className="bg-white/80 p-2 rounded-lg max-h-40 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {monsters
                .filter(
                  (monster) =>
                    monster.unlocked &&
                    monster.elements.some((element) =>
                      island.elements.includes(element)
                    )
                )
                .map((monster) => (
                  <div
                    key={monster.id}
                    className="w-16 h-16 bg-white/50 rounded-lg p-1 cursor-pointer hover:bg-[#7147e8]/20 transition-colors"
                    onClick={() => startPlacement(monster.id)}
                  >
                    <div className="w-full h-full relative flex items-center justify-center">
                      <img
                        src={monster.imageUrl}
                        alt={monster.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Monster placements */}
      {islandPlacements.map((placement) => (
        <MonsterPlacement
          key={placement.id}
          placement={placement}
          monster={monsters.find((m) => m.id === placement.monsterId)!}
          onCollect={() => collectCoins(placement.id)}
          isPlaying={isPlaying}
        />
      ))}

      {/* Placement ghost (for placing new monsters) */}
      {isPlacingMonster && selectedMonsterId && (
        <PlacementGhost
          monsterId={selectedMonsterId}
          position={ghostPosition}
          monster={monsters.find((m) => m.id === selectedMonsterId)!}
        />
      )}
    </div>
  );
};

export default IslandView;
