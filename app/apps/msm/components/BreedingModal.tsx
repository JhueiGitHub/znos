"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMSM } from "../context/MSMContext";
import { generateNote } from "../utils/audioEngine";

interface BreedingModalProps {
  onClose: () => void;
}

const BreedingModal: React.FC<BreedingModalProps> = ({ onClose }) => {
  const { monsters, breedingMonsters, breedingTimeLeft, startBreeding } =
    useMSM();

  const [selectedMonster1, setSelectedMonster1] = useState<string | null>(null);
  const [selectedMonster2, setSelectedMonster2] = useState<string | null>(null);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [possibleOffspring, setPossibleOffspring] = useState<string[]>([]);

  // Format breeding time
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "--:--";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle monster selection
  const handleSelectMonster = (monsterId: string, slot: 1 | 2) => {
    // Don't allow selecting the same monster for both slots
    if (slot === 1 && monsterId === selectedMonster2) return;
    if (slot === 2 && monsterId === selectedMonster1) return;

    // Update selection
    if (slot === 1) {
      setSelectedMonster1(monsterId);
    } else {
      setSelectedMonster2(monsterId);
    }

    // Play selection sound
    generateNote("E4", "piano", 0.1, 0.6);
  };

  // Check compatibility when selections change
  useEffect(() => {
    if (selectedMonster1 && selectedMonster2) {
      setShowCompatibility(true);

      const monster1 = monsters.find((m) => m.id === selectedMonster1);
      const monster2 = monsters.find((m) => m.id === selectedMonster2);

      if (monster1 && monster2) {
        // Calculate compatibility based on matching elements
        const monster1Elements = new Set(monster1.elements);
        const monster2Elements = new Set(monster2.elements);
        const commonElements = Array.from(monster1Elements).filter((e) =>
          monster2Elements.has(e)
        );

        // Score from 0-100
        const score = Math.round(
          (commonElements.length /
            Math.max(monster1Elements.size, monster2Elements.size)) *
            100
        );
        setCompatibilityScore(score);

        // Find possible offspring
        const combinedElements = [
          ...new Set([...monster1.elements, ...monster2.elements]),
        ];
        const potentialOffspring = monsters
          .filter((m) => !m.unlocked)
          .filter((m) => {
            // A monster can be bred if all its elements are in the combined parent elements
            return m.elements.every((element) =>
              combinedElements.includes(element)
            );
          })
          .map((m) => m.name);

        setPossibleOffspring(potentialOffspring);
      }
    } else {
      setShowCompatibility(false);
    }
  }, [selectedMonster1, selectedMonster2, monsters]);

  // Handle starting breeding
  const handleStartBreeding = () => {
    if (!selectedMonster1 || !selectedMonster2) return;

    startBreeding(selectedMonster1, selectedMonster2);

    // Play breeding start sound
    generateNote("C5", "piano", 0.3, 0.7, ["reverb"]);

    // Reset selections
    setSelectedMonster1(null);
    setSelectedMonster2(null);
  };

  // Filter breedable monsters
  const breedableMonsters = monsters.filter((monster) => monster.unlocked);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-[90%] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ffbd36] to-[#ff8de3] py-3 px-6">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-2xl msm-heading">Breeding</h2>
            <button onClick={onClose}>
              <img
                src="/images/msm/icons/close.png"
                alt="Close"
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Current breeding status */}
          {breedingMonsters && breedingTimeLeft !== null ? (
            <div className="bg-[#fff7e0] rounded-lg p-4 mb-4 border border-[#ffbd36]">
              <h3 className="text-[#7147e8] msm-heading mb-3">
                Currently Breeding
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {/* Parent 1 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-lg shadow-md p-1 mx-auto mb-1">
                      <img
                        src={
                          monsters.find(
                            (m) => m.id === breedingMonsters.monster1Id
                          )?.imageUrl || ""
                        }
                        alt="Monster 1"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs msm-text">
                      {
                        monsters.find(
                          (m) => m.id === breedingMonsters.monster1Id
                        )?.name
                      }
                    </div>
                  </div>

                  {/* Heart icon */}
                  <div className="flex items-center">
                    <img
                      src="/images/msm/icons/heart.png"
                      alt="Breeding"
                      className="w-8 h-8 msm-breeding-glow"
                    />
                  </div>

                  {/* Parent 2 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-lg shadow-md p-1 mx-auto mb-1">
                      <img
                        src={
                          monsters.find(
                            (m) => m.id === breedingMonsters.monster2Id
                          )?.imageUrl || ""
                        }
                        alt="Monster 2"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs msm-text">
                      {
                        monsters.find(
                          (m) => m.id === breedingMonsters.monster2Id
                        )?.name
                      }
                    </div>
                  </div>
                </div>

                {/* Time remaining */}
                <div className="text-center">
                  <div className="text-3xl msm-heading font-bold">
                    {formatTime(breedingTimeLeft)}
                  </div>
                  <div className="text-xs text-gray-500">remaining</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Breeding slot 1 */}
              <div className="bg-white rounded-lg shadow p-3 text-center">
                <h3 className="text-[#7147e8] msm-text mb-2">
                  Select Monster 1
                </h3>

                {selectedMonster1 ? (
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-[#f5f5f5] rounded-lg p-2 mx-auto mb-2">
                      <img
                        src={
                          monsters.find((m) => m.id === selectedMonster1)
                            ?.imageUrl || ""
                        }
                        alt="Selected Monster"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-sm msm-text font-medium">
                      {monsters.find((m) => m.id === selectedMonster1)?.name}
                    </div>
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center"
                      onClick={() => setSelectedMonster1(null)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-400">Empty</span>
                  </div>
                )}
              </div>

              {/* Breeding slot 2 */}
              <div className="bg-white rounded-lg shadow p-3 text-center">
                <h3 className="text-[#7147e8] msm-text mb-2">
                  Select Monster 2
                </h3>

                {selectedMonster2 ? (
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-[#f5f5f5] rounded-lg p-2 mx-auto mb-2">
                      <img
                        src={
                          monsters.find((m) => m.id === selectedMonster2)
                            ?.imageUrl || ""
                        }
                        alt="Selected Monster"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-sm msm-text font-medium">
                      {monsters.find((m) => m.id === selectedMonster2)?.name}
                    </div>
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center"
                      onClick={() => setSelectedMonster2(null)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-400">Empty</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compatibility info */}
          <AnimatePresence>
            {showCompatibility && (
              <motion.div
                className="bg-[#f0f0f0] rounded-lg p-4 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-[#7147e8] msm-heading mb-2">
                  Compatibility
                </h3>

                {/* Compatibility score */}
                <div className="mb-3">
                  <div className="flex items-center">
                    <div className="text-sm font-medium mr-2">Match:</div>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${compatibilityScore}%`,
                          background: `linear-gradient(to right, #f5426c, #ffbd36 50%, #44d362)`,
                        }}
                      />
                    </div>
                    <div className="ml-2 text-sm font-bold">
                      {compatibilityScore}%
                    </div>
                  </div>
                </div>

                {/* Possible offspring */}
                <div>
                  <div className="text-sm font-medium mb-1">
                    Possible offspring:
                  </div>
                  {possibleOffspring.length > 0 ? (
                    <div className="text-sm">
                      {possibleOffspring.slice(0, 3).map((name, index) => (
                        <span
                          key={index}
                          className="inline-block bg-white px-2 py-1 rounded mr-2 mb-2"
                        >
                          {name}
                        </span>
                      ))}
                      {possibleOffspring.length > 3 && (
                        <span className="text-gray-500">
                          +{possibleOffspring.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No new monsters possible
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Available monsters */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-[#7147e8] msm-heading mb-3">
              Available Monsters
            </h3>

            {breedableMonsters.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {breedableMonsters.map((monster) => (
                  <div
                    key={monster.id}
                    className={`bg-[#f5f5f5] rounded-lg p-2 text-center cursor-pointer hover:bg-[#e0e0e0] transition-colors ${
                      monster.id === selectedMonster1 ||
                      monster.id === selectedMonster2
                        ? "ring-2 ring-[#7147e8]"
                        : ""
                    }`}
                    onClick={() => {
                      if (!selectedMonster1) {
                        handleSelectMonster(monster.id, 1);
                      } else if (!selectedMonster2) {
                        handleSelectMonster(monster.id, 2);
                      } else if (monster.id === selectedMonster1) {
                        setSelectedMonster1(null);
                      } else if (monster.id === selectedMonster2) {
                        setSelectedMonster2(null);
                      } else {
                        // Replace monster in slot 1 if both are filled
                        handleSelectMonster(monster.id, 1);
                      }
                    }}
                  >
                    <div className="w-full aspect-square flex items-center justify-center">
                      <img
                        src={monster.imageUrl}
                        alt={monster.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="text-xs msm-text mt-1 truncate">
                      {monster.name}
                    </div>

                    {/* Element indicators */}
                    <div className="flex justify-center gap-1 mt-1">
                      {monster.elements.slice(0, 3).map((element, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `var(--msm-${element})` }}
                          title={element}
                        />
                      ))}
                      {monster.elements.length > 3 && (
                        <div className="w-3 h-3 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-white">
                          +
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No monsters available for breeding yet!</p>
                <p className="text-sm mt-2">
                  Purchase monsters from the shop first.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action footer */}
        <div className="bg-[#f0f0f0] p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 msm-text">
            {breedingMonsters
              ? "A breeding session is in progress"
              : "Select two monsters to start breeding"}
          </div>

          <button
            className={`msm-button py-2 px-6 ${
              breedingMonsters || !selectedMonster1 || !selectedMonster2
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleStartBreeding}
            disabled={
              breedingMonsters !== null ||
              !selectedMonster1 ||
              !selectedMonster2
            }
          >
            Start Breeding
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BreedingModal;
