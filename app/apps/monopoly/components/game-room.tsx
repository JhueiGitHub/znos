// /root/app/apps/monopoly/components/game-room.tsx
import { useState, useEffect } from "react";
import CountdownTransition from "./countdown-transition";
import GameBoard from "./game-board";
import type { Player } from "../types/game";

interface GameRoomProps {
  players: Player[];
}

export default function GameRoom({ players }: GameRoomProps) {
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    // Auto-hide countdown after animation completes
    const timer = setTimeout(() => {
      setShowCountdown(false);
    }, 3000); // 3 seconds for 3-2-1 countdown

    return () => clearTimeout(timer);
  }, []);

  if (showCountdown) {
    return <CountdownTransition />;
  }

  return <GameBoard players={players} />;
}
