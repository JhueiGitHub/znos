"use client";

import { motion } from "framer-motion";
import { Monster } from "../types/game";

interface PlacementGhostProps {
  monsterId: string;
  position: { x: number; y: number };
  monster: Monster;
}

const PlacementGhost: React.FC<PlacementGhostProps> = ({
  monsterId,
  position,
  monster,
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x - 40, // Center the ghost based on monster size
        top: position.y - 40,
        zIndex: 1000,
      }}
      animate={{
        scale: [0.9, 1.1, 0.9],
        opacity: 0.7,
      }}
      transition={{
        scale: {
          repeat: Infinity,
          duration: 1.5,
        },
      }}
    >
      <div className="w-20 h-20 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#7147e8] rounded-full opacity-20 animate-pulse"></div>
        <img
          src={monster.imageUrl}
          alt={monster.name}
          className="max-w-full max-h-full object-contain"
          style={{ filter: "brightness(0.7) drop-shadow(0 0 4px #7147e8)" }}
        />
      </div>

      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-sm msm-text text-[#7147e8]">
        Click to place
      </div>
    </motion.div>
  );
};

export default PlacementGhost;
