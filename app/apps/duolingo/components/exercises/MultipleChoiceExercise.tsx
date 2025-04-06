// /root/app/apps/duolingo/components/exercises/MultipleChoiceExercise.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MultipleChoiceExercise as MCExerciseType } from "../../types/DuolingoTypes";
import { VolumeIcon, Check, X } from "lucide-react";
import Image from "next/image";
import { playAudio } from "../../utils/audioUtils";
import { useStyles } from "@/app/hooks/useStyles";

interface Props {
  exercise: MCExerciseType;
  onAnswer: (answer: string) => void;
  userAnswer: string | null;
  isChecking: boolean;
  correctAnswer: string | null;
  showFeedback: boolean;
}

const MultipleChoiceExercise: React.FC<Props> = ({
  exercise,
  onAnswer,
  userAnswer,
  isChecking,
  correctAnswer,
  showFeedback,
}) => {
  const { getColor } = useStyles();

  // Play audio when component mounts
  useEffect(() => {
    if (exercise.audioSrc) {
      playAudio(exercise.audioSrc);
    }
  }, [exercise.audioSrc]);

  // Get character image based on option text
  const getCharacterImage = (option: string): string => {
    const text = option.toLowerCase();
    if (text.includes("cat")) return "/apps/duolingo/characters/cat.svg";
    if (text.includes("man")) return "/apps/duolingo/characters/vikramhead.svg";
    if (text.includes("boy")) return "/apps/duolingo/characters/junior.svg";
    if (text.includes("apple")) return "/apps/duolingo/characters/apple.svg";
    if (text.includes("woman")) return "/apps/duolingo/characters/zari.svg";
    if (text.includes("one")) return "/media/1.svg";
    return "/apps/duolingo/characters/junior.svg";
  };

  // Determine option status for styling
  const getOptionStatus = (option: string) => {
    if (!showFeedback) return "default";
    if (option === correctAnswer) return "correct";
    if (option === userAnswer && option !== correctAnswer) return "incorrect";
    return "inactive";
  };

  // Handle option selection
  const handleOptionClick = (option: string) => {
    if (!isChecking) {
      onAnswer(option);
    }
  };

  // Play audio when the audio button is clicked
  const handleAudioClick = () => {
    if (exercise.audioSrc) {
      playAudio(exercise.audioSrc);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Word Indicator */}
      <div className="mb-4">
        <motion.div
          className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: "rgba(76, 79, 105, 0.2)",
            borderColor: getColor("Brd"),
            color: getColor("latte"),
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ITALIAN
        </motion.div>
      </div>

      {/* Word to learn with audio button */}
      <div className="flex items-center mb-3">
        <motion.button
          className="mr-2 p-1.5 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          onClick={handleAudioClick}
          aria-label="Play pronunciation"
        >
          <VolumeIcon size={18} style={{ color: getColor("latte") }} />
        </motion.button>
        <motion.div
          className="text-lg font-bold"
          style={{ color: getColor("Graphite") }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {exercise.questionText || exercise.prompt}
        </motion.div>
      </div>

      <motion.p
        className="mb-4 text-sm"
        style={{ color: getColor("Graphite") }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Select the correct translation
      </motion.p>

      {/* Options */}
      <div className="space-y-2 flex-1">
        <AnimatePresence>
          {exercise.options.map((option, index) => {
            const status = getOptionStatus(option);
            const imageSrc = getCharacterImage(option);

            return (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 3) }}
                exit={{ opacity: 0, x: 20 }}
                className="p-2 rounded-xl cursor-pointer flex items-center border"
                style={{
                  backgroundColor:
                    status === "default"
                      ? "#191919"
                      : status === "correct"
                        ? getColor("latte")
                        : status === "incorrect"
                          ? "#333333"
                          : "#191919",
                  borderColor:
                    userAnswer === option && status === "default"
                      ? "white"
                      : getColor("Brd"),
                  opacity: status === "inactive" ? 0.5 : 1,
                }}
                whileHover={isChecking ? {} : { scale: 1.02 }}
                whileTap={isChecking ? {} : { scale: 0.98 }}
                onClick={() => handleOptionClick(option)}
              >
                <div
                  className="w-12 h-12 rounded overflow-hidden bg-black flex items-center justify-center mr-3 border"
                  style={{ borderColor: getColor("Brd") }}
                >
                  <Image
                    src={imageSrc}
                    alt={option}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="flex-1 text-sm font-medium text-white">
                  {option}
                </span>

                {/* Show check/x icon for feedback */}
                {showFeedback && (
                  <div className="ml-2">
                    {status === "correct" && (
                      <Check size={16} className="text-white" />
                    )}
                    {status === "incorrect" && (
                      <X size={16} className="text-white" />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultipleChoiceExercise;
