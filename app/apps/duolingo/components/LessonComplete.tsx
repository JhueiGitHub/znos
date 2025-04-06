// /root/app/apps/duolingo/components/LessonComplete.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { playAudio } from "../utils/audioUtils";
import { zenith } from "../styles/zenithStyles";

interface Props {
  success: boolean;
  heartsRemaining: number;
  onContinue: () => void;
  onRetry: () => void;
}

const LessonComplete: React.FC<Props> = ({
  success = true,
  heartsRemaining = 5,
  onContinue,
  onRetry,
}) => {
  // Play celebration sound on mount
  useEffect(() => {
    if (success) {
      playAudio("/apps/duolingo/audio/complete.mp3");
    } else {
      playAudio("/apps/duolingo/audio/fail.mp3");
    }
  }, [success]);

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

  // Confetti animation for success
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ["#58CC02", "#FF9600", "#FF4B4B", "#A560FF", "#4C4F69"][
              i % 5
            ],
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
      {success && <Confetti />}

      <motion.div variants={itemVariants} className="mb-6">
        {success ? (
          <Image
            src="/apps/duolingo/characters/duohappy.svg"
            alt="Success"
            width={100}
            height={100}
            priority
            className="animate-bounce"
          />
        ) : (
          <Image
            src="/apps/duolingo/characters/duosad.svg"
            alt="Try Again"
            width={100}
            height={100}
            priority
          />
        )}
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="text-xl font-bold mb-2 text-white"
      >
        {success ? "Lesson Complete!" : "Try Again!"}
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-white/70 mb-6 text-sm px-4"
      >
        {success
          ? `Great job! You completed the lesson with ${heartsRemaining} ${heartsRemaining === 1 ? "heart" : "hearts"} remaining.`
          : "You ran out of hearts. Keep practicing to improve!"}
      </motion.p>

      {/* Hearts display */}
      {success && (
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mx-1">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={i < heartsRemaining ? "#FF4B4B" : "#2E3856"}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          ))}
        </motion.div>
      )}

      {/* XP award for success */}
      {success && (
        <motion.div
          variants={itemVariants}
          className="bg-[#FFD900]/20 text-[#FFD900] px-4 py-2 rounded-full font-bold mb-6 flex items-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD900">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="ml-2">+10 XP</span>
        </motion.div>
      )}

      {/* Primary action button */}
      <motion.button
        variants={itemVariants}
        className={`
          px-6 py-3 rounded-xl font-bold text-white w-full max-w-[200px]
          ${success ? "bg-[#58CC02] hover:bg-[#43a126]" : "bg-[#FF4B4B] hover:bg-[#e53e3e]"}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={success ? onContinue : onRetry}
      >
        {success ? "Continue" : "Try Again"}
      </motion.button>

      {/* Secondary action */}
      {!success && (
        <motion.button
          variants={itemVariants}
          className="mt-3 px-6 py-2 font-medium text-white/60 hover:text-white"
          onClick={onContinue}
        >
          Exit Lesson
        </motion.button>
      )}
    </motion.div>
  );
};

export default LessonComplete;
