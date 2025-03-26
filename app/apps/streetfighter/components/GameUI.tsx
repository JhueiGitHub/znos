// /root/app/apps/streetfighter/components/GameUI.tsx
"use client";

import React from "react";

interface GameUIProps {
  gameState: {
    player1Health: number;
    player2Health: number;
    timer: number;
    isGameOver: boolean;
    winner: string | null;
  };
}

export default function GameUI({ gameState }: GameUIProps) {
  const { player1Health, player2Health, timer, isGameOver, winner } = gameState;

  return (
    <div className="w-full py-2 px-4 flex items-center justify-between bg-black bg-opacity-80 z-10">
      {/* HUD image for visual styling */}
      <img
        src="/apps/streetfighter/assets/hud.png"
        alt="HUD"
        className="absolute top-0 left-0 w-full h-16 object-contain opacity-80 z-0"
      />

      {/* Player 1 Health Bar */}
      <div className="flex-1 max-w-xs z-10 relative">
        <div className="h-6 bg-gray-900 border-2 border-white">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${player1Health}%` }}
          />
        </div>
        <div className="text-white text-xs mt-1 font-bold">RYU</div>
      </div>

      {/* Timer */}
      <div className="mx-4 px-4 py-2 bg-gray-900 border-2 border-white rounded-md z-10 relative">
        <div className="text-white text-xl font-bold">{timer}</div>
      </div>

      {/* Player 2 Health Bar */}
      <div className="flex-1 max-w-xs z-10 relative">
        <div className="h-6 bg-gray-900 border-2 border-white">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ml-auto"
            style={{ width: `${player2Health}%` }}
          />
        </div>
        <div className="text-white text-xs mt-1 text-right font-bold">KEN</div>
      </div>

      {/* VS Logo in center */}
      <img
        src="/apps/streetfighter/assets/vsLogo.png"
        alt="VS"
        className="absolute top-1 left-1/2 transform -translate-x-1/2 h-14 object-contain z-10"
      />

      {/* Game Over Message */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-black bg-opacity-70 px-8 py-4 rounded-lg border-2 border-white">
            <div className="text-white text-4xl font-bold text-center">
              {winner === "tie"
                ? "TIE!"
                : winner === "player1"
                  ? "RYU WINS!"
                  : "KEN WINS!"}
            </div>
            <img
              src="/apps/streetfighter/assets/winnerText.png"
              alt="Winner"
              className="h-16 object-contain mx-auto mt-4"
            />
          </div>
        </div>
      )}
    </div>
  );
}
