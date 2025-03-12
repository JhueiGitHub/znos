"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMSM } from "../context/MSMContext";
import { generateNote } from "../utils/audioEngine";

interface CollectionModalProps {
  onClose: () => void;
}

type CollectionTab = "monsters" | "islands" | "achievements";

const CollectionModal: React.FC<CollectionModalProps> = ({ onClose }) => {
  const { monsters, islands } = useMSM();

  const [activeTab, setActiveTab] = useState<CollectionTab>("monsters");
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterElement, setFilterElement] = useState<string | null>(null);

  // Handle tab change
  const handleTabChange = (tab: CollectionTab) => {
    setActiveTab(tab);
    setSelectedMonsterId(null);
    setSearchQuery("");
    setFilterElement(null);

    // Play UI sound
    generateNote("G4", "piano", 0.1, 0.5);
  };

  // Handle monster selection
  const handleSelectMonster = (monsterId: string) => {
    setSelectedMonsterId(monsterId);

    // Play monster sound
    const monster = monsters.find((m) => m.id === monsterId);
    if (monster) {
      generateNote(
        monster.soundProfile.notes[0],
        monster.soundProfile.instrument,
        0.3,
        0.7
      );
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle element filter
  const handleElementFilter = (element: string | null) => {
    setFilterElement(element === filterElement ? null : element);

    // Play UI sound
    generateNote("A4", "piano", 0.1, 0.6);
  };

  // Filter monsters based on search and element filter
  const filteredMonsters = monsters.filter((monster) => {
    const matchesSearch = monster.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesElement = filterElement
      ? monster.elements.includes(filterElement as any)
      : true;
    return matchesSearch && matchesElement;
  });

  // Group monsters by unlocked status
  const unlockedMonsters = filteredMonsters.filter((m) => m.unlocked);
  const lockedMonsters = filteredMonsters.filter((m) => !m.unlocked);

  // Calculate collection progress
  const monstersProgress = Math.round(
    (unlockedMonsters.length / monsters.length) * 100
  );
  const islandsProgress = Math.round(
    (islands.filter((i) => i.unlocked).length / islands.length) * 100
  );

  // Dummy achievements data
  const achievements = [
    {
      id: "ach1",
      name: "Monster Collector",
      description: "Collect 5 different monsters",
      completed: unlockedMonsters.length >= 5,
      progress: Math.min(unlockedMonsters.length / 5, 1),
    },
    {
      id: "ach2",
      name: "Island Explorer",
      description: "Unlock 3 different islands",
      completed: islands.filter((i) => i.unlocked).length >= 3,
      progress: Math.min(islands.filter((i) => i.unlocked).length / 3, 1),
    },
    {
      id: "ach3",
      name: "Melody Maker",
      description: "Create a song with 4+ monsters",
      completed: false,
      progress: 0,
    },
    {
      id: "ach4",
      name: "Breeding Expert",
      description: "Successfully breed 3 new monsters",
      completed: false,
      progress: 0,
    },
  ];

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
        <div className="bg-gradient-to-r from-[#7147e8] to-[#44b4e5] py-3 px-6">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-2xl msm-heading">Collection</h2>
            <button onClick={onClose}>
              <img
                src="/images/msm/icons/close.png"
                alt="Close"
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#f0f0f0] flex space-x-1 p-2">
          {(["monsters", "islands", "achievements"] as CollectionTab[]).map(
            (tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg msm-text capitalize ${
                  activeTab === tab
                    ? "bg-[#7147e8] text-white"
                    : "bg-white/70 hover:bg-white"
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === "monsters" && (
              <motion.div
                key="monsters-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                {/* Search and filters */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search monsters..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {["plant", "water", "air", "earth", "fire"].map(
                      (element) => (
                        <button
                          key={element}
                          className={`w-8 h-8 rounded-full ${
                            filterElement === element
                              ? "ring-2 ring-white ring-offset-2"
                              : ""
                          }`}
                          style={{ backgroundColor: `var(--msm-${element})` }}
                          onClick={() => handleElementFilter(element)}
                          title={
                            element.charAt(0).toUpperCase() + element.slice(1)
                          }
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Collection Progress</span>
                    <span>
                      {unlockedMonsters.length} / {monsters.length} (
                      {monstersProgress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7147e8]"
                      style={{ width: `${monstersProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex">
                  {/* Monster list */}
                  <div
                    className="w-2/3 pr-3 overflow-y-auto"
                    style={{ maxHeight: "400px" }}
                  >
                    {/* Unlocked monsters */}
                    {unlockedMonsters.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-[#7147e8] msm-heading mb-2">
                          Unlocked Monsters
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          {unlockedMonsters.map((monster) => (
                            <div
                              key={monster.id}
                              className={`bg-white rounded-lg shadow p-2 cursor-pointer hover:shadow-md transition-shadow ${
                                selectedMonsterId === monster.id
                                  ? "ring-2 ring-[#7147e8]"
                                  : ""
                              }`}
                              onClick={() => handleSelectMonster(monster.id)}
                            >
                              <div className="aspect-square rounded bg-[#f5f5f5] flex items-center justify-center p-2 mb-1">
                                <img
                                  src={monster.imageUrl}
                                  alt={monster.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <h3 className="text-xs msm-text text-center truncate">
                                {monster.name}
                              </h3>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locked monsters */}
                    {lockedMonsters.length > 0 && (
                      <div>
                        <h3 className="text-gray-400 msm-heading mb-2">
                          Locked Monsters
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          {lockedMonsters.map((monster) => (
                            <div
                              key={monster.id}
                              className="bg-gray-100 rounded-lg shadow p-2 relative"
                            >
                              <div className="aspect-square rounded bg-[#f5f5f5] flex items-center justify-center p-2 mb-1 opacity-50">
                                <img
                                  src={monster.imageUrl}
                                  alt={monster.name}
                                  className="max-w-full max-h-full object-contain filter grayscale"
                                />
                              </div>
                              <h3 className="text-xs msm-text text-center text-gray-400 truncate">
                                {monster.name}
                              </h3>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/30 rounded-full p-1">
                                  <img
                                    src="/images/msm/icons/lock.png"
                                    alt="Locked"
                                    className="w-5 h-5"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Monster details */}
                  <div className="w-1/3 bg-[#f5f5f5] rounded-lg p-3">
                    {selectedMonsterId ? (
                      (() => {
                        const monster = monsters.find(
                          (m) => m.id === selectedMonsterId
                        );
                        if (!monster) return null;

                        return (
                          <div>
                            <h3 className="text-lg msm-heading text-[#7147e8] mb-2">
                              {monster.name}
                            </h3>

                            <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-4 mb-3">
                              <img
                                src={monster.imageUrl}
                                alt={monster.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>

                            <p className="text-xs mb-3">
                              {monster.description}
                            </p>

                            <div className="mb-2">
                              <div className="text-xs font-semibold mb-1">
                                Elements:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {monster.elements.map((element) => (
                                  <div
                                    key={element}
                                    className="px-2 py-0.5 rounded-full text-[10px] msm-text text-white"
                                    style={{
                                      backgroundColor: `var(--msm-${element})`,
                                      textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                                    }}
                                  >
                                    {element.charAt(0).toUpperCase() +
                                      element.slice(1)}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mb-2">
                              <div className="text-xs font-semibold mb-1">
                                Sound Type:
                              </div>
                              <div className="text-xs">
                                {monster.soundProfile.instrument} (
                                {monster.soundProfile.notes.join(", ")})
                              </div>
                            </div>

                            <div className="mb-2">
                              <div className="text-xs font-semibold mb-1">
                                Rarity:
                              </div>
                              <div className="flex">
                                {[...Array(monster.rarity)].map((_, i) => (
                                  <img
                                    key={i}
                                    src="/images/msm/icons/star.png"
                                    alt="Star"
                                    className="w-4 h-4"
                                  />
                                ))}
                              </div>
                            </div>

                            <button
                              className="w-full py-1 px-2 bg-[#7147e8] text-white rounded-lg text-xs msm-text mt-2"
                              onClick={() => {
                                // Play monster sound
                                const notes = monster.soundProfile.notes;
                                const note =
                                  notes[
                                    Math.floor(Math.random() * notes.length)
                                  ];
                                generateNote(
                                  note,
                                  monster.soundProfile.instrument,
                                  0.5,
                                  0.7,
                                  monster.soundProfile.effects || []
                                );
                              }}
                            >
                              Play Sound
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <img
                          src="/images/msm/icons/monster.png"
                          alt="Select Monster"
                          className="w-12 h-12 opacity-30 mb-2"
                        />
                        <p className="text-sm msm-text text-center">
                          Select a monster to view details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "islands" && (
              <motion.div
                key="islands-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                {/* Islands progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Islands Unlocked</span>
                    <span>
                      {islands.filter((i) => i.unlocked).length} /{" "}
                      {islands.length} ({islandsProgress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#44b4e5]"
                      style={{ width: `${islandsProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {islands.map((island) => (
                    <div
                      key={island.id}
                      className={`${
                        island.unlocked ? "bg-white" : "bg-gray-100"
                      } rounded-lg shadow p-3 relative`}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden mb-3">
                        <img
                          src={island.imageUrl}
                          alt={island.name}
                          className={`w-full h-full object-cover ${!island.unlocked ? "filter grayscale opacity-50" : ""}`}
                        />

                        {!island.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/30 rounded-full p-2">
                              <img
                                src="/images/msm/icons/lock.png"
                                alt="Locked"
                                className="w-6 h-6"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <h3
                        className={`text-base msm-heading mb-1 ${!island.unlocked ? "text-gray-400" : "text-[#44b4e5]"}`}
                      >
                        {island.name}
                      </h3>

                      <p
                        className={`text-xs mb-2 ${!island.unlocked ? "text-gray-400" : ""}`}
                      >
                        {island.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-1">
                        {island.elements.map((element) => (
                          <div
                            key={element}
                            className={`px-1.5 py-0.5 rounded-full text-[10px] msm-text text-white ${!island.unlocked ? "opacity-50" : ""}`}
                            style={{
                              backgroundColor: `var(--msm-${element})`,
                              textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                            }}
                          >
                            {element.charAt(0).toUpperCase() + element.slice(1)}
                          </div>
                        ))}
                      </div>

                      {!island.unlocked && (
                        <div className="mt-2 text-xs text-gray-400 flex items-center">
                          <img
                            src="/images/msm/icons/diamond.png"
                            alt="Cost"
                            className="w-4 h-4 mr-1"
                          />
                          <span>{island.cost.diamonds} diamonds to unlock</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "achievements" && (
              <motion.div
                key="achievements-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`bg-white rounded-lg shadow p-3 ${
                        achievement.completed
                          ? "border-l-4 border-[#44d362]"
                          : ""
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            achievement.completed
                              ? "bg-[#44d362]"
                              : "bg-gray-200"
                          }`}
                        >
                          {achievement.completed ? (
                            <img
                              src="/images/msm/icons/check.png"
                              alt="Completed"
                              className="w-6 h-6"
                            />
                          ) : (
                            <img
                              src="/images/msm/icons/trophy.png"
                              alt="Trophy"
                              className="w-6 h-6 opacity-30"
                            />
                          )}
                        </div>

                        <div className="flex-1">
                          <h3
                            className={`text-base msm-heading ${
                              achievement.completed
                                ? "text-[#44d362]"
                                : "text-gray-600"
                            }`}
                          >
                            {achievement.name}
                          </h3>

                          <p className="text-xs text-gray-500 mb-2">
                            {achievement.description}
                          </p>

                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                achievement.completed
                                  ? "bg-[#44d362]"
                                  : "bg-[#7147e8]"
                              }`}
                              style={{
                                width: `${achievement.progress * 100}%`,
                              }}
                            />
                          </div>

                          <div className="text-right text-xs mt-1">
                            {Math.round(achievement.progress * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CollectionModal;
