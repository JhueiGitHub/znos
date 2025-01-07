// /root/app/apps/monopoly/components/player-token.tsx
import { motion } from "framer-motion";
import type { Player } from "../types/game";
import { boardCoordinates } from "../utils/coordinates";

interface PlayerTokenProps {
  player: Player;
  position: number;
  isMoving: boolean;
  tokenNumber: number;
}

export function PlayerToken({
  player,
  position,
  isMoving,
  tokenNumber,
}: PlayerTokenProps) {
  const { x, y } = boardCoordinates.getCellWithOffset(
    position,
    tokenNumber - 1
  );

  return (
    <motion.div
      initial={false}
      animate={{
        x,
        y,
        scale: isMoving ? 1.2 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500, // Increased stiffness for more precise movement
        damping: 30, // Adjusted damping for better positioning
        mass: 0.7, // Lighter mass for quicker settling
      }}
      className="absolute left-0 top-0"
      style={{
        width: "30px", // Slightly smaller size for better fit
        height: "30px",
        zIndex: isMoving ? 31 : 30,
        transform: `translate(-50%, -50%)`, // Center the token on its coordinates
      }}
    >
      <motion.img
        src={`/monopoly/p${player.figurineId}.png`}
        alt={`${player.name}'s token`}
        className="w-full h-full object-contain"
        animate={{
          rotate: isMoving ? [0, 360] : 0,
        }}
        transition={{
          duration: 0.3,
          repeat: isMoving ? Infinity : 0,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}
