"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Island } from "../types/game";
import { useMSM } from "../context/MSMContext";
import { generateNote } from "../utils/audioEngine";

interface GameMenuProps {
  islands: Island[];
  currentIslandId: string;
  onIslandSelect: (islandId: string) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  islands,
  currentIslandId,
  onIslandSelect,
}) => {
  const { resources, buyIsland } = useMSM();

  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedIslandId, setExpandedIslandId] = useState<string | null>(null);

  // Filter islands to show unlocked ones first, then locked ones
  const sortedIslands = [...islands].sort((a, b) => {
    // Sort by unlock status first
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;

    // Then by name
    return a.name.localeCompare(b.name);
  });

  // Toggle the menu
  const toggleMenu = () => {
    setIsExpanded(!isExpanded);

    // Play sound
    generateNote(isExpanded ? "G3" : "C4", "piano", 0.1, 0.5);

    // Reset expanded island
    if (isExpanded) {
      setExpandedIslandId(null);
    }
  };

  // Handle clicking on an island
  const handleIslandClick = (island: Island) => {
    if (island.unlocked) {
      onIslandSelect(island.id);
      setIsExpanded(false);
    } else {
      setExpandedIslandId(expandedIslandId === island.id ? null : island.id);

      // Play sound
      generateNote("E4", "piano", 0.1, 0.6);
    }
  };

  // Handle unlocking an island
  const handleUnlockIsland = (e: React.MouseEvent, island: Island) => {
    e.stopPropagation();

    // Check if player has enough resources
    const diamondCost = island.cost.diamonds || 0;
    if (resources.diamonds >= diamondCost) {
      buyIsland(island.id);

      // Play unlock sound
      generateNote("C5", "piano", 0.3, 0.8, ["reverb"]);

      // Close the menu
      setIsExpanded(false);
    } else {
      // Play error sound
      generateNote("A3", "piano", 0.1, 0.3);
    }
  };

  return (
    <div className="absolute bottom-20 left-4 z-20">
      {/* Menu toggle button */}
      <motion.button
        className="msm-button flex items-center gap-2"
        onClick={toggleMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src="/images/msm/icons/map.png"
          alt="Islands"
          className="w-6 h-6"
        />
        <span>Islands</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src="/images/msm/icons/arrow.png"
            alt="Toggle"
            className="w-4 h-4"
          />
        </motion.div>
      </motion.button>

      {/* Island menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-14 left-0 bg-white/90 rounded-lg shadow-lg p-3 w-64"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <h3 className="msm-heading text-[#7147e8] mb-3">Select Island</h3>

            <div className="max-h-60 overflow-y-auto pr-2">
              <div className="space-y-2">
                {sortedIslands.map((island) => (
                  <motion.div
                    key={island.id}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      island.unlocked
                        ? island.id === currentIslandId
                          ? "bg-[#7147e8] text-white"
                          : "bg-white hover:bg-[#7147e8]/10"
                        : "bg-gray-100"
                    }`}
                    onClick={() => handleIslandClick(island)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {island.unlocked ? (
                          <img
                            src="/images/msm/icons/island-unlocked.png"
                            alt="Unlocked"
                            className="w-6 h-6"
                          />
                        ) : (
                          <img
                            src="/images/msm/icons/island-locked.png"
                            alt="Locked"
                            className="w-6 h-6"
                          />
                        )}
                        <span className="msm-text font-semibold">
                          {island.name}
                        </span>
                      </div>

                      {!island.unlocked && (
                        <img
                          src="/images/msm/icons/info.png"
                          alt="Info"
                          className="w-4 h-4"
                        />
                      )}
                    </div>

                    {/* Island unlock info */}
                    <AnimatePresence>
                      {!island.unlocked && expandedIslandId === island.id && (
                        <motion.div
                          className="mt-2 pt-2 border-t border-gray-200"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <p className="text-xs mb-2 text-gray-600">
                            {island.description}
                          </p>

                          <div className="text-xs mb-1">
                            <span className="font-semibold">Elements: </span>
                            {island.elements.map((element) => (
                              <span
                                key={element}
                                className="inline-block px-1 mx-1 rounded"
                                style={{
                                  backgroundColor: `var(--msm-${element})`,
                                  color: "white",
                                  textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                                }}
                              >
                                {element}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <img
                                src="/images/msm/icons/diamond.png"
                                alt="Cost"
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-bold">
                                {island.cost.diamonds || 0}
                              </span>
                            </div>

                            <button
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                resources.diamonds >=
                                (island.cost.diamonds || 0)
                                  ? "bg-[#7147e8] text-white"
                                  : "bg-gray-300 text-gray-600"
                              }`}
                              onClick={(e) => handleUnlockIsland(e, island)}
                              disabled={
                                resources.diamonds < (island.cost.diamonds || 0)
                              }
                            >
                              Unlock
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameMenu;
