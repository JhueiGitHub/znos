"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Space } from "lucide-react";

interface IntroScreenProps {
  onComplete: () => void;
  profileId: string;
}

const IntroScreen = ({ onComplete, profileId }: IntroScreenProps) => {
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSkipped(true);
        // Update profile
        await axios.patch(`/api/profile/${profileId}`, {
          hasSeenIntro: true
        });
        // Small delay before completing
        setTimeout(onComplete, 500);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [profileId, onComplete]);

  // Auto-complete after crawl finishes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isSkipped) {
        await axios.patch(`/api/profile/${profileId}`, {
          hasSeenIntro: true
        });
        onComplete();
      }
    }, 45000); // Adjust based on animation duration

    return () => clearTimeout(timer);
  }, [isSkipped, profileId, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {!isSkipped && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black overflow-hidden"
        >
          {/* Starfield background */}
          <div className="absolute inset-0 bg-[url('/media/stars.png')] opacity-50" />
          
          {/* Text crawl container */}
          <div className="relative h-full perspective-[400px]">
            <motion.div
              initial={{ rotateX: 25, y: "100vh" }}
              animate={{ 
                rotateX: 25,
                y: "-200vh",
                transition: {
                  duration: 40,
                  ease: "linear"
                }
              }}
              className="relative w-full max-w-[40rem] mx-auto text-[#FFE81F] text-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl mb-8">Episode I</h2>
                <h1 className="text-6xl mb-16">A New Operating System</h1>
              </div>

              <div className="text-2xl leading-relaxed space-y-8">
                <p>
                  In a digital realm not so far away, a new operating system emerges from the depths of innovation.
                </p>
                <p>
                  ZENITH OS, a revolutionary platform born from the marriage of aesthetics and functionality, 
                  promises to redefine how we interact with our digital world.
                </p>
                <p>
                  As you embark on this journey, remember that each pixel, each interaction, 
                  each moment is crafted to elevate your computing experience to new heights.
                </p>
                <p>
                  May your workflows be efficient, your interfaces be beautiful, 
                  and your digital dreams take flight in this new frontier...
                </p>
              </div>
            </motion.div>
          </div>

          {/* Space bar indicator */}
          <motion.div 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-2"
            initial={{ y: 0 }}
            animate={{ y: -10 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
              ease: "easeInOut"
            }}
          >
            <Space className="w-6 h-6" />
            <span className="text-sm">Press space to skip</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroScreen;