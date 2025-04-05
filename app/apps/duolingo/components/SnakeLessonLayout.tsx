// /root/app/apps/duolingo/components/SnakeLessonLayout.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Image
import { useDuolingoActions } from "../contexts/DuolingoContext";
import {
  italianLessonNodes,
  calculateSnakeHeight,
  characterPositions,
} from "../data/italianLessons";
import LessonNode from "./LessonNode";
import { zenith } from "../styles/zenithStyles";
import { LessonNodeData } from "../types/DuolingoTypes";

const CONTAINER_WIDTH_PX = 178;

// SnakePath Component (No changes needed from previous response)
const SnakePath = ({ nodes }: { nodes: LessonNodeData[] }) => {
  // ... (keep the implementation from the previous response) ...
  if (nodes.length < 2) return null;
  const getNodeCenter = (node: LessonNodeData) => ({
    x: node.position.x + (node.size?.width ?? 34) / 2,
    y: node.position.y + (node.size?.height ?? 34) / 2,
  });
  const pathData = nodes.reduce((acc, node, index) => {
    const center = getNodeCenter(node);
    const command = index === 0 ? "M" : "L";
    return `${acc} ${command} ${center.x} ${center.y}`;
  }, "");
  const totalHeight = calculateSnakeHeight();
  return (
    <svg
      width={`${CONTAINER_WIDTH_PX}px`}
      height={`${totalHeight}px`}
      style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      viewBox={`0 0 ${CONTAINER_WIDTH_PX} ${totalHeight}`}
      preserveAspectRatio="xMidYMin slice"
    >
      <path
        d={pathData}
        fill="none"
        stroke={zenith.colors.latte}
        strokeWidth="3"
        strokeOpacity={zenith.opacity.thin}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// --- Main SnakeLessonLayout Component ---
const SnakeLessonLayout = () => {
  const { startLesson } = useDuolingoActions();
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(500);

  useEffect(() => {
    setTotalHeight(calculateSnakeHeight());
  }, []);

  const handleStartLesson = (node: LessonNodeData) => {
    if (
      node.status === "available" &&
      (node.type === "lesson" || node.type === "checkpoint")
    ) {
      startLesson(node.id);
    } else if (node.type === "start") {
      const firstLessonNode = italianLessonNodes.find(
        (n) => n.type === "lesson"
      );
      if (firstLessonNode) {
        const element = document.getElementById(
          `lesson-node-${firstLessonNode.id}`
        );
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    // Use Flexbox on the direct parent to center the snake container
    <div className="flex items-center justify-center h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-latte/50 scrollbar-track-transparent"
        style={{ width: `${CONTAINER_WIDTH_PX}px` }}
      >
        {/* Container for positioning */}
        <div className="relative" style={{ height: `${totalHeight}px` }}>
          <SnakePath nodes={italianLessonNodes} />

          {/* Render Decorative Characters using Images */}
          {/* Assuming only one type 'girl1.png' for now, adjust if multiple */}
          {/* Position based on extracted Figma coordinates */}
          <div
            className={`absolute pointer-events-none`}
            style={{ left: `0px`, top: `70.62px`, zIndex: 1 }} // Position from figma character 1
          >
            <Image
              src="/apps/duolingo/images/girl1.png" // Use the specific character image
              alt="Decorative Character 1"
              width={54} // Extracted from Figma SVG width
              height={83} // Extracted from Figma SVG height
              unoptimized={true}
              className="opacity-70" // Apply opacity if needed
            />
          </div>
          {/* Add the second character if you have girl2.png etc. */}
          {/* Example for second char position from figma */}
          {/* <div
                         className={`absolute pointer-events-none`}
                         style={{ left: `134.09px`, top: `237.56px`, zIndex: 1 }}
                         >
                         <Image
                             src="/apps/duolingo/images/girl2.png" // Assuming a second image
                             alt="Decorative Character 2"
                             width={44} // Extracted from Figma SVG
                             height={74} // Extracted from Figma SVG
                             unoptimized={true}
                             className="opacity-70"
                         />
                     </div> */}

          {/* Render lesson nodes using updated LessonNode */}
          {italianLessonNodes.map((node, index) => (
            <motion.div
              key={node.id}
              id={`lesson-node-${node.id}`}
              className="absolute"
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                zIndex: 2,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <LessonNode node={node} onClick={() => handleStartLesson(node)} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SnakeLessonLayout;
