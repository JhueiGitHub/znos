"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMSM } from "../context/MSMContext";
import { generateNote } from "../utils/audioEngine";

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { volume, setVolume, resetGame } = useMSM();

  const [activeTab, setActiveTab] = useState<"audio" | "game" | "about">(
    "audio"
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Handle tab change
  const handleTabChange = (tab: "audio" | "game" | "about") => {
    setActiveTab(tab);

    // Play UI sound
    generateNote("G4", "piano", 0.1, 0.5);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    // Play test sound at new volume
    if (newVolume > 0) {
      generateNote("C4", "piano", 0.1, newVolume);
    }
  };

  // Handle game reset
  const handleResetGame = () => {
    resetGame();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-[90%] max-w-md overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7147e8] to-[#44b4e5] py-3 px-6">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-2xl msm-heading">Settings</h2>
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
          <button
            className={`px-4 py-2 rounded-lg msm-text ${
              activeTab === "audio"
                ? "bg-[#7147e8] text-white"
                : "bg-white/70 hover:bg-white"
            }`}
            onClick={() => handleTabChange("audio")}
          >
            Audio
          </button>

          <button
            className={`px-4 py-2 rounded-lg msm-text ${
              activeTab === "game"
                ? "bg-[#7147e8] text-white"
                : "bg-white/70 hover:bg-white"
            }`}
            onClick={() => handleTabChange("game")}
          >
            Game
          </button>

          <button
            className={`px-4 py-2 rounded-lg msm-text ${
              activeTab === "about"
                ? "bg-[#7147e8] text-white"
                : "bg-white/70 hover:bg-white"
            }`}
            onClick={() => handleTabChange("about")}
          >
            About
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "audio" && (
            <div>
              <h3 className="text-[#7147e8] msm-heading mb-3">
                Audio Settings
              </h3>

              <div className="bg-white rounded-lg shadow p-4 space-y-4">
                {/* Master volume */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Master Volume</label>
                    <span className="text-sm">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-[#7147e8]"
                  />
                </div>

                {/* Sound effects switch */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Sound Effects</label>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    <div className="absolute left-1 top-1 bg-[#7147e8] w-3 h-3 rounded-full transition-transform transform translate-x-5"></div>
                  </div>
                </div>

                {/* Background music switch */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Background Music
                  </label>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    <div className="absolute left-1 top-1 bg-[#7147e8] w-3 h-3 rounded-full transition-transform transform translate-x-5"></div>
                  </div>
                </div>

                <button
                  className="text-sm text-[#7147e8] hover:underline"
                  onClick={() => {
                    // Play test sound at current volume
                    generateNote("C4", "piano", 0.1, volume);

                    // Use setTimeout to add delay between notes
                    setTimeout(() => {
                      generateNote("E4", "piano", 0.1, volume);
                    }, 100); // 100ms delay

                    setTimeout(() => {
                      generateNote("G4", "piano", 0.1, volume);
                    }, 200); // 200ms delay
                  }}
                >
                  Play Test Sound
                </button>
              </div>
            </div>
          )}

          {activeTab === "game" && (
            <div>
              <h3 className="text-[#7147e8] msm-heading mb-3">Game Settings</h3>

              <div className="bg-white rounded-lg shadow p-4 space-y-4">
                {/* Notifications switch */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Notifications</label>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    <div className="absolute left-1 top-1 bg-[#7147e8] w-3 h-3 rounded-full transition-transform transform translate-x-5"></div>
                  </div>
                </div>

                {/* Auto-save switch */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Auto-save</label>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    <div className="absolute left-1 top-1 bg-[#7147e8] w-3 h-3 rounded-full transition-transform transform translate-x-5"></div>
                  </div>
                </div>

                {/* High quality switch */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    High Quality Graphics
                  </label>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    <div className="absolute left-1 top-1 bg-[#7147e8] w-3 h-3 rounded-full transition-transform transform translate-x-5"></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-red-500 mb-2">
                    Danger Zone
                  </h4>

                  {showResetConfirm ? (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600 mb-2">
                        Are you sure? This will reset all your progress!
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          onClick={handleResetGame}
                        >
                          Yes, Reset
                        </button>
                        <button
                          className="bg-gray-300 px-3 py-1 rounded text-sm"
                          onClick={() => setShowResetConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => setShowResetConfirm(true)}
                    >
                      Reset Game Progress
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div>
              <h3 className="text-[#7147e8] msm-heading mb-3">About</h3>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col items-center mb-4">
                  <img
                    src="/images/msm/logo.png"
                    alt="My Singing Monsters"
                    className="w-24 h-24 mb-2"
                  />
                  <h3 className="text-xl msm-heading text-[#7147e8]">
                    My Singing Monsters: Harmony Island
                  </h3>
                  <p className="text-sm text-gray-500">Version 1.0.0</p>
                </div>

                <p className="text-sm mb-4">
                  A musical monster collecting game where you discover and breed
                  unique creatures to create catchy tunes!
                </p>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Developer:</span>
                    <span className="ml-2">Claude 3.7 Sonnet</span>
                  </div>

                  <div>
                    <span className="font-medium">Graphics:</span>
                    <span className="ml-2">Claude 3.7 Sonnet</span>
                  </div>

                  <div>
                    <span className="font-medium">Music:</span>
                    <span className="ml-2">Claude 3.7 Sonnet</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center space-x-4">
                  <button className="text-[#7147e8] hover:underline text-sm">
                    Privacy Policy
                  </button>
                  <button className="text-[#7147e8] hover:underline text-sm">
                    Terms of Service
                  </button>
                  <button className="text-[#7147e8] hover:underline text-sm">
                    Credits
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;
