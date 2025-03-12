"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMSM } from "../context/MSMContext";

interface MusicControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const MusicControlBar: React.FC<MusicControlBarProps> = ({
  isPlaying,
  onTogglePlay,
}) => {
  const { volume, setVolume } = useMSM();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle music play/pause
  const handleTogglePlay = () => {
    onTogglePlay();
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <motion.div
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
      layout
    >
      <motion.div
        className="bg-white/80 rounded-full shadow-lg p-1 flex items-center"
        layout
      >
        {/* Play/Pause Button */}
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isPlaying ? "bg-[#7147e8] text-white" : "bg-white/50"
          }`}
          onClick={handleTogglePlay}
        >
          {isPlaying ? (
            <img
              src="/images/msm/icons/pause.png"
              alt="Pause"
              className="w-5 h-5"
            />
          ) : (
            <img
              src="/images/msm/icons/play.png"
              alt="Play"
              className="w-5 h-5"
            />
          )}
        </button>

        {/* Music Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex items-center gap-3 pl-3 pr-2"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Volume Button */}
              <div className="relative">
                <button
                  className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                >
                  <img
                    src={
                      volume > 0
                        ? "/images/msm/icons/volume.png"
                        : "/images/msm/icons/mute.png"
                    }
                    alt="Volume"
                    className="w-4 h-4"
                  />
                </button>

                {/* Volume Slider */}
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-white/90 p-2 rounded-lg shadow-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 accent-[#7147e8]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Music Status */}
              <div className="text-xs msm-text font-medium">
                {isPlaying ? (
                  <div className="flex items-center gap-1">
                    <span>Now Playing:</span>
                    <span className="text-[#7147e8] font-bold">
                      Island Melodies
                    </span>

                    {/* Animated equalizer bars */}
                    <div className="flex items-end gap-px ml-1 h-3">
                      {[0.8, 1, 0.6, 0.9, 0.7].map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-[#7147e8]"
                          animate={{
                            height: ["50%", `${height * 100}%`, "50%"],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <span>Monsters are waiting to sing!</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center"
          onClick={toggleExpanded}
        >
          <motion.img
            src="/images/msm/icons/arrow.png"
            alt="Toggle"
            className="w-4 h-4"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MusicControlBar;
