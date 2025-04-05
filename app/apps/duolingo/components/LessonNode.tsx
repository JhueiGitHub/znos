// /root/app/apps/duolingo/components/LessonNode.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { LessonNodeData } from "../types/DuolingoTypes";

interface LessonNodeProps {
  node: LessonNodeData;
  onClick: () => void;
}

const LessonNode = ({ node, onClick }: LessonNodeProps) => {
  const isClickable = node.status === "available";
  const isLocked = node.status === "locked";

  let imageSrc = "";
  switch (node.type) {
    case "start":
      imageSrc = "/apps/duolingo/images/start.png";
      break;
    case "lesson":
      imageSrc = isLocked
        ? "/apps/duolingo/images/locked.png"
        : "/apps/duolingo/images/lesson.png";
      break;
    case "checkpoint":
      imageSrc = isLocked
        ? "/apps/duolingo/images/locked.png"
        : "/apps/duolingo/images/chest.png";
      break;
    default:
      imageSrc = "/apps/duolingo/images/locked.png";
  }

  const width = node.size?.width ?? 34;
  const height = node.size?.height ?? 34;

  let nodeClasses = `relative transition-all duration-150 ease-in-out `;
  if (isClickable || node.type === "start") {
    nodeClasses += ` cursor-pointer hover:scale-105 active:scale-95 hover:brightness-110 active:brightness-95`;
  } else {
    nodeClasses += ` cursor-not-allowed ${isLocked ? "opacity-60" : ""}`;
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isClickable && node.type !== "start"}
      className={nodeClasses}
      style={{ width: `${width}px`, height: `${height}px` }}
      title={node.title} // Add title attribute for tooltips
    >
      <Image
        src={imageSrc}
        alt={node.title}
        width={width}
        height={height}
        priority={node.type === "start"}
        unoptimized={true}
        className="object-contain" // Use contain to prevent stretching
      />
    </motion.button>
  );
};

export default LessonNode;
