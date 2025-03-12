"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMSM } from "../context/MSMContext";
import { generateNote } from "../utils/audioEngine";

interface ShopModalProps {
  onClose: () => void;
}

type ShopCategory = "monsters" | "structures" | "decorations" | "resources";

const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const { monsters, resources, purchaseMonster } = useMSM();

  const [activeCategory, setActiveCategory] =
    useState<ShopCategory>("monsters");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Handle category change
  const handleCategoryChange = (category: ShopCategory) => {
    setActiveCategory(category);
    setSelectedItem(null);

    // Play UI sound
    generateNote("G4", "piano", 0.1, 0.5);
  };

  // Handle selecting an item
  const handleSelectItem = (id: string) => {
    setSelectedItem(id);

    // Play UI sound
    generateNote("A4", "piano", 0.1, 0.6);
  };

  // Handle buying a monster
  const handleBuyMonster = (monsterId: string) => {
    const monster = monsters.find((m) => m.id === monsterId);
    if (!monster) return;

    // Check if player has enough resources
    if (resources.coins < monster.cost.coins) {
      // Play error sound
      generateNote("A3", "piano", 0.1, 0.3);
      return;
    }

    // Purchase the monster
    purchaseMonster(monsterId);

    // Play purchase sound
    generateNote("C5", "piano", 0.3, 0.7, ["reverb"]);
  };

  // Filter monsters that are not unlocked and can be purchased
  const availableMonsters = monsters.filter(
    (monster) => !monster.unlocked && monster.cost.coins <= 5000
  );

  // Dummy data for other categories
  const dummyStructures = [
    {
      id: "breeding-structure",
      name: "Breeding Structure",
      cost: { coins: 2000 },
      imageUrl: "/images/msm/structures/breeding.png",
    },
    {
      id: "nursery",
      name: "Nursery",
      cost: { coins: 1500 },
      imageUrl: "/images/msm/structures/nursery.png",
    },
  ];

  const dummyDecorations = [
    {
      id: "flower-bed",
      name: "Flower Bed",
      cost: { coins: 500 },
      imageUrl: "/images/msm/decorations/flower-bed.png",
    },
    {
      id: "torch",
      name: "Torch",
      cost: { coins: 750 },
      imageUrl: "/images/msm/decorations/torch.png",
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
            <h2 className="text-white text-2xl msm-heading">Shop</h2>
            <button onClick={onClose}>
              <img
                src="/images/msm/icons/close.png"
                alt="Close"
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="bg-[#f0f0f0] flex space-x-1 p-2">
          {(
            [
              "monsters",
              "structures",
              "decorations",
              "resources",
            ] as ShopCategory[]
          ).map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg msm-text capitalize ${
                activeCategory === category
                  ? "bg-[#7147e8] text-white"
                  : "bg-white/70 hover:bg-white"
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Item grid */}
          <div className="w-3/5 p-4 overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              {activeCategory === "monsters" &&
                availableMonsters.map((monster) => (
                  <div
                    key={monster.id}
                    className={`bg-white rounded-lg shadow p-2 cursor-pointer hover:shadow-md transition-shadow ${
                      selectedItem === monster.id ? "ring-2 ring-[#7147e8]" : ""
                    }`}
                    onClick={() => handleSelectItem(monster.id)}
                  >
                    <div className="aspect-square rounded bg-[#f5f5f5] flex items-center justify-center p-2 mb-2">
                      <img
                        src={monster.imageUrl}
                        alt={monster.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-sm msm-text text-center truncate">
                      {monster.name}
                    </h3>
                    <div className="flex items-center justify-center mt-1">
                      <img
                        src="/images/msm/icons/coin.png"
                        alt="Coins"
                        className="w-4 h-4 mr-1"
                      />
                      <span className="text-xs font-medium">
                        {monster.cost.coins}
                      </span>
                    </div>
                  </div>
                ))}

              {activeCategory === "structures" &&
                dummyStructures.map((structure) => (
                  <div
                    key={structure.id}
                    className={`bg-white rounded-lg shadow p-2 cursor-pointer hover:shadow-md transition-shadow ${
                      selectedItem === structure.id
                        ? "ring-2 ring-[#7147e8]"
                        : ""
                    }`}
                    onClick={() => handleSelectItem(structure.id)}
                  >
                    <div className="aspect-square rounded bg-[#f5f5f5] flex items-center justify-center p-2 mb-2">
                      <img
                        src={structure.imageUrl}
                        alt={structure.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-sm msm-text text-center truncate">
                      {structure.name}
                    </h3>
                    <div className="flex items-center justify-center mt-1">
                      <img
                        src="/images/msm/icons/coin.png"
                        alt="Coins"
                        className="w-4 h-4 mr-1"
                      />
                      <span className="text-xs font-medium">
                        {structure.cost.coins}
                      </span>
                    </div>
                  </div>
                ))}

              {activeCategory === "decorations" &&
                dummyDecorations.map((decoration) => (
                  <div
                    key={decoration.id}
                    className={`bg-white rounded-lg shadow p-2 cursor-pointer hover:shadow-md transition-shadow ${
                      selectedItem === decoration.id
                        ? "ring-2 ring-[#7147e8]"
                        : ""
                    }`}
                    onClick={() => handleSelectItem(decoration.id)}
                  >
                    <div className="aspect-square rounded bg-[#f5f5f5] flex items-center justify-center p-2 mb-2">
                      <img
                        src={decoration.imageUrl}
                        alt={decoration.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-sm msm-text text-center truncate">
                      {decoration.name}
                    </h3>
                    <div className="flex items-center justify-center mt-1">
                      <img
                        src="/images/msm/icons/coin.png"
                        alt="Coins"
                        className="w-4 h-4 mr-1"
                      />
                      <span className="text-xs font-medium">
                        {decoration.cost.coins}
                      </span>
                    </div>
                  </div>
                ))}

              {activeCategory === "resources" && (
                <div className="col-span-3 flex flex-col items-center justify-center p-4">
                  <img
                    src="/images/msm/icons/coming-soon.png"
                    alt="Coming Soon"
                    className="w-32 h-32 mb-4"
                  />
                  <p className="msm-text text-center text-gray-600">
                    Resource shop coming soon!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Item details */}
          <div className="w-2/5 bg-[#f9f9f9] p-4 border-l border-gray-200 overflow-y-auto">
            {selectedItem ? (
              activeCategory === "monsters" ? (
                // Monster details
                (() => {
                  const monster = monsters.find((m) => m.id === selectedItem);
                  if (!monster) return null;

                  return (
                    <div className="h-full flex flex-col">
                      <h3 className="text-xl msm-heading text-[#7147e8] mb-2">
                        {monster.name}
                      </h3>

                      <div className="bg-white rounded-lg p-3 mb-4 flex-1">
                        <div className="aspect-square rounded bg-[#f5f5f5] flex items-center justify-center p-4 mb-3">
                          <img
                            src={monster.imageUrl}
                            alt={monster.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        <p className="text-sm mb-3 text-gray-600">
                          {monster.description}
                        </p>

                        <div className="mb-3">
                          <div className="text-sm font-semibold mb-1">
                            Elements:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {monster.elements.map((element) => (
                              <div
                                key={element}
                                className="px-2 py-1 rounded-full text-xs msm-text text-white"
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

                        <div className="mb-3">
                          <div className="text-sm font-semibold mb-1">
                            Sound Type:
                          </div>
                          <div className="px-2 py-1 bg-[#f0f0f0] rounded text-xs">
                            {monster.soundProfile.instrument}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#f0f0f0] p-2 rounded">
                            <div className="font-semibold">Coin Rate:</div>
                            <div className="flex items-center mt-1">
                              <img
                                src="/images/msm/icons/coin.png"
                                alt="Coins"
                                className="w-4 h-4 mr-1"
                              />
                              <span>{monster.coinRate}/min</span>
                            </div>
                          </div>

                          <div className="bg-[#f0f0f0] p-2 rounded">
                            <div className="font-semibold">Max Coins:</div>
                            <div className="flex items-center mt-1">
                              <img
                                src="/images/msm/icons/coin.png"
                                alt="Coins"
                                className="w-4 h-4 mr-1"
                              />
                              <span>{monster.maxCoins}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src="/images/msm/icons/coin.png"
                            alt="Coins"
                            className="w-5 h-5 mr-1"
                          />
                          <span className="text-lg font-bold">
                            {monster.cost.coins}
                          </span>
                        </div>

                        <button
                          className={`msm-button py-2 px-4 ${
                            resources.coins < monster.cost.coins
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleBuyMonster(monster.id)}
                          disabled={resources.coins < monster.cost.coins}
                        >
                          Buy Monster
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Other categories (simplified)
                <div className="flex flex-col items-center justify-center h-full">
                  <img
                    src="/images/msm/icons/coming-soon.png"
                    alt="Coming Soon"
                    className="w-32 h-32 mb-4"
                  />
                  <p className="msm-text text-center text-gray-600">
                    This feature is coming soon!
                  </p>
                </div>
              )
            ) : (
              // No selection
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <img
                  src="/images/msm/icons/select.png"
                  alt="Select"
                  className="w-16 h-16 mb-3 opacity-50"
                />
                <p className="msm-text text-center">
                  Select an item to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShopModal;
