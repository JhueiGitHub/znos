"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Monster,
  MonsterPlacement as MonsterPlacementType,
} from "../types/game";
import { useMSM } from "../context/MSMContext";
import { generateNote } from "../utils/audioEngine";

interface MonsterPlacementProps {
  placement: MonsterPlacementType;
  monster: Monster;
  onCollect: () => void;
  isPlaying: boolean;
}

const MonsterPlacement: React.FC<MonsterPlacementProps> = ({
  placement,
  monster,
  onCollect,
  isPlaying,
}) => {
  const { moveMonster, removeMonster, playMonsterSound, stopMonsterSound } =
    useMSM();

  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [hasCoins, setHasCoins] = useState(false);
  const [singing, setSinging] = useState(false);

  const monsterRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const infoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if monster has coins to collect
  useEffect(() => {
    const checkCoins = () => {
      const timeSinceCollection =
        (Date.now() - placement.lastCollection) / 1000; // in seconds
      const baseCoinsPerMinute = monster.coinRate; // coins per minute
      const coinsPerSecond = baseCoinsPerMinute / 60;
      const levelMultiplier = 1 + (placement.level - 1) * 0.2; // 20% increase per level

      let coinsToCollect = Math.floor(
        coinsPerSecond * timeSinceCollection * levelMultiplier
      );
      coinsToCollect = Math.min(
        coinsToCollect,
        monster.maxCoins * levelMultiplier
      );

      setHasCoins(coinsToCollect > 0);
    };

    // Check initially
    checkCoins();

    // Check periodically
    const interval = setInterval(checkCoins, 5000);

    return () => clearInterval(interval);
  }, [placement, monster]);

  // Singing animation when music is playing
  useEffect(() => {
    if (isPlaying) {
      // Start singing animation with a random delay to create visual variety
      const randomDelay = Math.random() * 1000;
      const timeout = setTimeout(() => {
        setSinging(true);
      }, randomDelay);

      return () => clearTimeout(timeout);
    } else {
      setSinging(false);
    }
  }, [isPlaying]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    // Play a sound
    generateNote("A3", "marimba", 0.1, 0.5);

    // Add global mouse event listeners
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  // Handle drag move
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !monsterRef.current) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    // Update the monster's position
    const newX = placement.position.x + dx;
    const newY = placement.position.y + dy;

    monsterRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
  };

  // Handle drag end
  const handleDragEnd = (e: MouseEvent) => {
    if (!isDragging || !monsterRef.current) return;

    setIsDragging(false);

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    // Update the monster's position in the game state
    const newX = placement.position.x + dx;
    const newY = placement.position.y + dy;

    moveMonster(placement.id, { x: newX, y: newY });

    // Play a sound
    generateNote("C4", "marimba", 0.1, 0.5);

    // Remove global mouse event listeners
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
  };

  // Show monster info on hover
  const handleMouseEnter = () => {
    infoTimeoutRef.current = setTimeout(() => {
      setShowInfo(true);
    }, 500); // Delay to prevent flickering
  };

  const handleMouseLeave = () => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }
    setShowInfo(false);
  };

  // Handle monster click to collect coins
  const handleMonsterClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasCoins) {
      onCollect();

      // Play coin collection sound
      generateNote("E5", "piano", 0.2, 0.7, ["vibrato"]);
    } else {
      // Play "no coins" sound
      generateNote("A3", "piano", 0.1, 0.3);
    }
  };

  // Play a custom sound when monster is hovered
  const handleMonsterSound = () => {
    playMonsterSound(monster.id);

    // Stop the sound after a short duration
    setTimeout(() => {
      if (!isPlaying) {
        stopMonsterSound(monster.id);
      }
    }, 1500);
  };

  // Render the monster
  return (
    <motion.div
      ref={monsterRef}
      className={`msm-monster ${singing ? "singing" : ""}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: placement.position.x,
        y: placement.position.y,
      }}
      transition={{
        type: "spring",
        duration: 0.5,
      }}
      style={{ zIndex: Math.floor(placement.position.y) }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleMonsterClick}
    >
      {/* Monster image */}
      <div
        className="w-24 h-24 relative flex items-center justify-center"
        onMouseDown={handleDragStart}
      >
        <img
          src={monster.imageUrl}
          alt={monster.name}
          className="max-w-full max-h-full object-contain"
          onDoubleClick={handleMonsterSound}
        />

        {/* Level */}
        <div className="absolute -right-2 -top-2 w-6 h-6 bg-[#7147e8] rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
          {placement.level}
        </div>

        {/* Has coins indicator */}
        {hasCoins && (
          <div className="absolute -left-1 -top-1 animate-bounce">
            <img
              src="/images/msm/icons/coin.png"
              alt="Coins"
              className="w-6 h-6"
            />
          </div>
        )}
      </div>

      {/* Monster info */}
      {showInfo && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 bg-white/90 rounded-lg p-2 text-center">
          <h3 className="text-sm font-bold text-[#7147e8] msm-heading">
            {monster.name}
          </h3>
          <div className="flex justify-center gap-1 mt-1">
            {monster.elements.map((element) => (
              <div
                key={element}
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: `var(--msm-${element})` }}
                title={element.charAt(0).toUpperCase() + element.slice(1)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Coin collection animation */}
      {/* (We would add the coin collection animation here) */}
    </motion.div>
  );
};

export default MonsterPlacement;
