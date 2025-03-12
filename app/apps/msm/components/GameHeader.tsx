"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMSM } from "../context/MSMContext";

interface GameHeaderProps {
  onMenuClick: (menuType: string) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onMenuClick }) => {
  const { resources } = useMSM();
  const [showReminder, setShowReminder] = useState(false);

  // Periodically show reminders to check on monsters
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      // 10% chance to show a reminder
      if (Math.random() < 0.1) {
        setShowReminder(true);

        // Hide reminder after 5 seconds
        setTimeout(() => {
          setShowReminder(false);
        }, 5000);
      }
    }, 60000); // Check every minute

    return () => clearInterval(reminderInterval);
  }, []);

  return (
    <header className="w-full py-2 px-4 absolute top-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/30 to-transparent">
      {/* Logo & Reminders area */}
      <div className="flex items-center">
        <motion.img
          src="/images/msm/logo.png"
          alt="MSM"
          className="h-12 w-12"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 1] }}
          transition={{ duration: 1, times: [0, 0.5, 1] }}
        />

        {/* Reminders */}
        {showReminder && (
          <motion.div
            className="ml-4 bg-white/90 px-3 py-1 rounded-full text-sm text-[#7147e8] msm-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            Your monsters are waiting for you!
          </motion.div>
        )}
      </div>

      {/* Resources */}
      <div className="flex items-center gap-2">
        <div className="msm-resource">
          <img src="/images/msm/icons/coin.png" alt="Coins" />
          <span>{resources.coins.toLocaleString()}</span>
        </div>

        <div className="msm-resource">
          <img src="/images/msm/icons/diamond.png" alt="Diamonds" />
          <span>{resources.diamonds.toLocaleString()}</span>
        </div>

        <div className="msm-resource">
          <img src="/images/msm/icons/food.png" alt="Food" />
          <span>{resources.food.toLocaleString()}</span>
        </div>

        <div className="msm-resource">
          <img src="/images/msm/icons/star.png" alt="Star Power" />
          <span>{resources.starpower.toLocaleString()}</span>
        </div>
      </div>

      {/* Menu buttons */}
      <div className="flex items-center gap-3">
        <button
          className="msm-button py-1 px-3 text-sm"
          onClick={() => onMenuClick("shop")}
        >
          Shop
        </button>

        <button
          className="msm-button msm-button-secondary py-1 px-3 text-sm"
          onClick={() => onMenuClick("breeding")}
        >
          Breeding
        </button>

        <button
          className="msm-button py-1 px-3 text-sm"
          onClick={() => onMenuClick("collection")}
        >
          Collection
        </button>

        <button
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
          onClick={() => onMenuClick("settings")}
        >
          <img
            src="/images/msm/icons/settings.png"
            alt="Settings"
            className="w-5 h-5"
          />
        </button>
      </div>
    </header>
  );
};

export default GameHeader;
