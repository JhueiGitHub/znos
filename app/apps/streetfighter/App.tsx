// /root/app/apps/streetfighter/App.tsx
"use client";

import React, { useState } from "react";
import StreetFighter from "./components/StreetFighter";
import GameUI from "./components/GameUI";

export default function App() {
  const [gameState, setGameState] = useState({
    player1Health: 100,
    player2Health: 100,
    timer: 99,
    isGameOver: false,
    winner: null,
  });

  return (
    <div className="flex flex-col h-full w-full bg-black overflow-hidden relative">
      {/* Game UI (health bars, timer) */}
      <GameUI gameState={gameState} />

      {/* Main game canvas */}
      <div className="flex-1 flex items-center justify-center">
        <StreetFighter updateGameState={setGameState} />
      </div>
    </div>
  );
}
