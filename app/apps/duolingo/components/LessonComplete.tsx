// /root/app/apps/duolingo/components/LessonComplete.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { playAudio } from "../utils/audioUtils";
import { useStyles } from "@/app/hooks/useStyles";

interface Props {
  onContinue: () => void;
  onRetry: () => void;
}

const LessonComplete: React.FC<Props> = ({ onContinue, onRetry }) => {
  const { getColor } = useStyles();

  // Play celebration sound on mount
  useEffect(() => {
    playAudio("/apps/duolingo/audio/complete.mp3");
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Confetti animation using latte colors
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 2 === 0 ? getColor("latte") : getColor("Graphite"),
            top: `${Math.random() * 20}%`,
            left: `${Math.random() * 100}%`,
          }}
          initial={{
            y: -20,
            opacity: 0,
          }}
          animate={{
            y: `${100 + Math.random() * 50}%`,
            opacity: [0, 1, 0],
            x: `${(Math.random() - 0.5) * 50}%`,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random(),
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full px-5 py-6 text-center relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Confetti />

      <motion.div variants={itemVariants} className="mb-6">
        <Image
          src="/apps/duolingo/characters/duohappy.svg"
          alt="Success"
          width={100}
          height={100}
          priority
          className="animate-bounce"
        />
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="text-xl font-bold mb-2"
        style={{ color: getColor("Graphite") }}
      >
        Lesson Complete!
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-6 text-sm px-4"
        style={{ color: getColor("Graphite") }}
      >
        Great job! You've completed the Italian lesson.
      </motion.p>

      {/* XP award */}
      <motion.div
        variants={itemVariants}
        className="px-4 py-2 rounded-full font-bold mb-6 flex items-center border"
        style={{
          backgroundColor: "rgba(76, 79, 105, 0.1)",
          color: getColor("latte"),
          borderColor: getColor("Brd"),
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="ml-2">+10 XP</span>
      </motion.div>

      {/* Continue button */}
      <motion.button
        variants={itemVariants}
        className="px-6 py-3 rounded-xl font-bold text-white w-full max-w-[200px] border"
        style={{
          backgroundColor: getColor("latte"),
          borderColor: getColor("Brd"),
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
      >
        Continue
      </motion.button>

      {/* Secondary action */}
      <motion.button
        variants={itemVariants}
        className="mt-3 px-6 py-2 font-medium"
        style={{ color: getColor("Graphite") }}
        onClick={onRetry}
      >
        Practice Again
      </motion.button>
    </motion.div>
  );
};

export default LessonComplete;
