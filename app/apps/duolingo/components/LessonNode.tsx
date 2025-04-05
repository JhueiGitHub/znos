// /root/app/apps/duolingo/components/LessonNode.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Next.js Image component for optimization
import { LessonNodeData } from "../types/DuolingoTypes";
import { zenith } from "../styles/zenithStyles";

interface LessonNodeProps {
  node: LessonNodeData;
  onClick: () => void;
}

const LessonNode = ({ node, onClick }: LessonNodeProps) => {
  const isClickable = node.status === "available";
  const isLocked = node.status === "locked";
  // const isCompleted = node.status === 'completed'; // Future state

  // --- Determine Image Source ---
  let imageSrc = "";
  switch (node.type) {
    case "start":
      imageSrc = "/apps/duolingo/images/start.png";
      break;
    case "lesson":
      imageSrc = isLocked
        ? "/apps/duolingo/images/locked.png"
        : "/apps/duolingo/images/lesson.png";
      // Add logic for completed status image if needed later
      // if (isCompleted) imageSrc = '/apps/duolingo/images/lesson-completed.png';
      break;
    case "checkpoint":
      imageSrc = isLocked
        ? "/apps/duolingo/images/locked.png"
        : "/apps/duolingo/images/chest.png"; // Assuming locked checkpoints also use locked.png
      // if (isCompleted) imageSrc = '/apps/duolingo/images/chest-completed.png';
      break;
    default:
      imageSrc = "/apps/duolingo/images/locked.png"; // Default fallback
  }

  // --- Define Size (using provided node size or fallback) ---
  const width = node.size?.width ?? 34;
  const height = node.size?.height ?? 34;

  // --- Basic Button Styling (Image container) ---
  // Remove background/border styles as image provides visuals
  let nodeClasses = `relative transition-all duration-150 ease-in-out `;
  if (isClickable) {
    nodeClasses += ` cursor-pointer hover:brightness-110 active:scale-95 active:brightness-95`; // Subtle interaction feedback
  } else {
    nodeClasses += ` cursor-not-allowed ${isLocked ? "opacity-60" : ""}`; // Fade locked nodes slightly
  }
  // Add slight hover scale for start node too
  if (node.type === "start") {
    nodeClasses += ` cursor-pointer hover:scale-105 active:scale-98`;
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isClickable && node.type !== "start"}
      className={nodeClasses}
      style={{ width: `${width}px`, height: `${height}px` }} // Apply size to the button wrapper
      // Remove whileHover/whileTap scale if handled by active:scale
    >
      {/* Use Next.js Image component */}
      <Image
        src={imageSrc}
        alt={node.title} // Use title for alt text
        width={width} // Provide width/height for layout stability
        height={height}
        priority={node.type === "start"} // Prioritize loading the start image
        unoptimized={true} // If images are simple icons, optimization might not be needed / can cause issues
        className="object-contain" // Ensure image fits within the button bounds
      />
    </motion.button>
  );
};

export default LessonNode;
