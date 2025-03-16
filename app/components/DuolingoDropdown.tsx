import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Award,
  Flame,
  Check,
  Clock,
  Calendar,
  Zap,
  BookOpen,
  Target,
} from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import localFont from "next/font/local";

const exemplarPro = localFont({
  src: "../../public/fonts/ExemplarPro.otf",
});

// Interface for lessons
interface Lesson {
  id: string;
  name: string;
  progress: number;
  isCompleted: boolean;
  xpReward: number;
  estimatedTime: string;
}

// Interface for the dropdown component props
interface DuolingoDropdownProps {
  currentStreak: number;
  totalXP: number;
  dailyGoal: number;
  dailyProgress: number;
  lessons: Lesson[];
  onSelectLesson: (lessonId: string) => void;
}

const DuolingoDropdown: React.FC<DuolingoDropdownProps> = ({
  currentStreak = 0,
  totalXP = 0,
  dailyGoal = 50,
  dailyProgress = 0,
  lessons = [],
  onSelectLesson,
}) => {
  const { getColor } = useStyles();
  const [showLessons, setShowLessons] = useState(true);

  // Calculate streak percentage for the progress circle
  const streakPercentage = Math.min(100, (dailyProgress / dailyGoal) * 100);

  return (
    <DropdownMenuContent
      className="w-[202px] p-3 space-y-3"
      align="end"
      alignOffset={-3}
      sideOffset={4}
      style={{
        height: "461px",
        backgroundColor: getColor("black-thick"),
        borderColor: getColor("Brd"),
        borderRadius: "9px",
      }}
    >
      {/* User Stats Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(76, 79, 105, 0.2)" }}
          >
            <Flame size={18} className="text-[#ff9600]" />
            <div
              className="absolute inset-0 rounded-full border-2 border-[#ff9600]"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${streakPercentage}%, 0 ${streakPercentage}%)`,
              }}
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-sm font-medium"
              style={{
                ...exemplarPro.style,
                color: "rgba(76, 79, 105, 0.95)",
              }}
            >
              {currentStreak} day streak
            </span>
            <span
              className="text-xs"
              style={{
                color: "rgba(76, 79, 105, 0.6)",
              }}
            >
              {dailyProgress}/{dailyGoal} XP today
            </span>
          </div>
        </div>
        <div className="flex items-center p-1 rounded-full bg-[#58cc02]/10">
          <Zap size={16} className="text-[#58cc02]" />
        </div>
      </div>

      <div className="h-px w-full bg-[rgba(76,79,105,0.2)]" />

      {/* Lessons Section */}
      <div>
        <button
          onClick={() => setShowLessons(!showLessons)}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
          style={{ color: "rgba(76, 79, 105, 0.81)" }}
        >
          <BookOpen size={16} />
          <span className="text-sm flex-1 text-left" style={exemplarPro.style}>
            Lessons
          </span>
          <ChevronRight
            size={16}
            className={`transform transition-transform ${showLessons ? "rotate-90" : ""}`}
          />
        </button>

        <AnimatePresence>
          {showLessons && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2 max-h-[280px] overflow-y-auto">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {/* Lesson icon or progress indicator */}
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: lesson.isCompleted
                          ? "rgba(88, 204, 2, 0.2)"
                          : "rgba(76, 79, 105, 0.2)",
                      }}
                    >
                      {lesson.isCompleted ? (
                        <Check size={14} className="text-[#58cc02]" />
                      ) : (
                        <Target
                          size={14}
                          style={{ color: "rgba(76, 79, 105, 0.81)" }}
                        />
                      )}
                    </div>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{
                          ...exemplarPro.style,
                          color: "rgba(76, 79, 105, 0.95)",
                        }}
                      >
                        {lesson.name}
                      </div>
                      <div
                        className="flex items-center text-xs gap-1"
                        style={{ color: "rgba(76, 79, 105, 0.6)" }}
                      >
                        <Clock size={10} />
                        <span>{lesson.estimatedTime}</span>
                        <span className="mx-1">•</span>
                        <Award size={10} />
                        <span>{lesson.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px w-full bg-[rgba(76,79,105,0.2)]" />

      {/* Bottom Shortcuts */}
      <div className="space-y-1.5">
        <DropdownMenuItem
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer"
          style={{ color: "rgba(76, 79, 105, 0.81)" }}
        >
          <Target size={16} />
          <span className="text-sm" style={exemplarPro.style}>
            Daily Goals
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer"
          style={{ color: "rgba(76, 79, 105, 0.81)" }}
        >
          <Calendar size={16} />
          <span className="text-sm" style={exemplarPro.style}>
            Practice Schedule
          </span>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
};

export default DuolingoDropdown;
