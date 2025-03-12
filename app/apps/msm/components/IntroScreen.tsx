"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateNote } from "../utils/audioEngine";

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(true);

  // Handle step progression
  const nextStep = () => {
    if (step < 3) {
      setTyping(true);
      setStep(step + 1);

      // Play UI sound
      generateNote("E4", "piano", 0.1, 0.7);
    } else {
      // Complete intro
      onComplete();

      // Play completion sound
      generateNote("C5", "piano", 0.3, 0.8, ["reverb"]);
    }
  };

  // Auto-progress typing animation
  useEffect(() => {
    if (typing) {
      const timer = setTimeout(() => {
        setTyping(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [typing, step]);

  // Intro content
  const introContent = [
    {
      title: "Welcome to Harmony Island!",
      text: "A magical place where musical monsters create beautiful melodies together. Your journey as a monster collector begins now!",
      image: "/images/msm/intro/intro1.png",
    },
    {
      title: "Collect Unique Monsters",
      text: "Each monster has its own musical talent. Collect them all to create amazing songs that will enchant the islands!",
      image: "/images/msm/intro/intro2.png",
    },
    {
      title: "Breed New Species",
      text: "Combine different monsters to discover new species with unique sounds. The more you breed, the more complex your music becomes!",
      image: "/images/msm/intro/intro3.png",
    },
    {
      title: "Your Adventure Awaits!",
      text: "Are you ready to become the ultimate monster collector and music maestro? Let's begin your musical journey!",
      image: "/images/msm/intro/intro4.png",
    },
  ];

  const currentContent = introContent[step];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#44b4e5] to-[#7147e8] flex flex-col items-center justify-end z-50">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="msm-clouds opacity-50"
          style={{ backgroundImage: "url(/images/msm/environment/clouds.png)" }}
        />
        <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-[#7147e8] to-transparent" />
      </div>

      {/* Logo */}
      <motion.div
        className="absolute top-10 left-1/2 transform -translate-x-1/2"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
      >
        <img
          src="/images/msm/logo.png"
          alt="My Singing Monsters"
          className="w-32 h-32"
        />
        <div className="text-center text-white text-xl msm-title mt-2">
          Harmony Island
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative w-full max-w-md mx-auto mb-20">
        {/* Image */}
        <motion.div
          className="mb-6 flex justify-center"
          key={`image-${step}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-64 h-64 flex items-center justify-center">
            <img
              src={currentContent.image}
              alt={currentContent.title}
              className="max-w-full max-h-full object-contain drop-shadow-lg"
            />
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-lg p-5 mx-4 shadow-lg relative"
          key={`content-${step}`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl text-[#7147e8] msm-heading mb-2">
            {currentContent.title}
          </h2>

          <AnimatePresence mode="wait">
            <motion.p
              key={`text-${step}`}
              className="text-sm msm-text text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {typing ? (
                <span className="inline-block w-4 h-5 bg-[#7147e8] animate-pulse" />
              ) : (
                currentContent.text
              )}
            </motion.p>
          </AnimatePresence>

          {/* Dots navigation */}
          <div className="flex justify-center mt-4 gap-2">
            {introContent.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === step ? "bg-[#7147e8]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            className="msm-button absolute -bottom-5 right-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: typing ? 0 : 1 }}
            onClick={nextStep}
            disabled={typing}
          >
            {step < 3 ? "Next" : "Start!"}
          </motion.button>
        </motion.div>
      </div>

      {/* Skip button */}
      <button
        className="absolute top-5 right-5 text-white/80 text-sm hover:text-white"
        onClick={onComplete}
      >
        Skip Intro
      </button>
    </div>
  );
};

export default IntroScreen;
