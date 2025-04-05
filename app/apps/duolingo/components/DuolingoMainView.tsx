// /root/app/apps/duolingo/components/DuolingoMainView.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  useDuolingoState,
  useDuolingoActions,
} from "../contexts/DuolingoContext";
import {
  italianLessonNodes,
  calculateSnakeHeight,
  characterPositions,
} from "../data/italianLessons";
import LessonNode from "./LessonNode"; // Renders individual nodes
import LessonView from "./LessonView"; // Renders the active lesson screen
import { zenith } from "../styles/zenithStyles";
import { LessonNodeData } from "../types/DuolingoTypes";

const CONTAINER_WIDTH_PX = 178;

// --- SnakePath Component ---
const SnakePath = ({ nodes }: { nodes: LessonNodeData[] }) => {
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

// --- Main View Component ---
const DuolingoMainView = () => {
  const { isLessonActive } = useDuolingoState();
  const { startLesson } = useDuolingoActions();
  const containerRef = useRef<HTMLDivElement>(null);
  const [snakeHeight, setSnakeHeight] = useState(500);

  useEffect(() => {
    setSnakeHeight(calculateSnakeHeight());
  }, []);

  const handleStartLesson = (node: LessonNodeData) => {
    console.log(`handleStartLesson: Clicked node ${node.id}`);
    if (
      node.status === "available" &&
      (node.type === "lesson" || node.type === "checkpoint")
    ) {
      startLesson(node.id);
    } else if (node.type === "start") {
      const firstAvailableLessonNode = italianLessonNodes.find(
        (n) =>
          n.status === "available" &&
          (n.type === "lesson" || n.type === "checkpoint")
      );
      if (firstAvailableLessonNode) {
        const element = document.getElementById(
          `lesson-node-${firstAvailableLessonNode.id}`
        );
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const viewVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex items-center justify-center h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-full overflow-hidden rounded-lg border border-white/10" // Added subtle border
        style={{ width: `${CONTAINER_WIDTH_PX}px` }}
      >
        <AnimatePresence mode="wait">
          {!isLessonActive ? (
            // --- Snake Layout View ---
            <motion.div
              key="snake-layout"
              variants={viewVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-latte/50 scrollbar-track-transparent"
            >
              <div className="relative" style={{ height: `${snakeHeight}px` }}>
                <SnakePath nodes={italianLessonNodes} />
                {/* Decorative Characters */}
                {characterPositions.map((char) => (
                  <div
                    key={char.id}
                    className={`absolute pointer-events-none`}
                    style={{
                      left: `${char.left}px`,
                      top: `${char.top}px`,
                      zIndex: 1,
                    }}
                  >
                    {/* Placeholder - Replace with actual <Image> tags if you have the character images */}
                    {/* Example using girl1.png for char1 */}
                    {char.id === "char1" && (
                      <Image
                        src="/apps/duolingo/images/girl1.png"
                        alt=""
                        width={54}
                        height={83}
                        unoptimized={true}
                        className="opacity-70"
                      />
                    )}
                    {/* Add other characters similarly */}
                  </div>
                ))}
                {/* Nodes */}
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
                    <LessonNode
                      node={node}
                      onClick={() => handleStartLesson(node)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            // --- Lesson View ---
            <motion.div
              key="lesson-view"
              variants={viewVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full w-full flex flex-col bg-[#000000cc]" // Added slightly opaque black bg for lesson view contrast
            >
              <LessonView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DuolingoMainView;
