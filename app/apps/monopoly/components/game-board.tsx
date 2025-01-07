// /root/app/apps/monopoly/components/game-board.tsx
import { useState } from "react";
import type { Player } from "../types/game";
import { DiceRoller } from "./dice-roller";
import { PlayerToken } from "./player-token";

interface GameBoardProps {
  players: Player[];
}

export default function GameBoard({ players }: GameBoardProps) {
  const [currentAmount] = useState(1500);
  const [currentPlayer, setCurrentPlayer] = useState(players[0]);
  const [playerPositions, setPlayerPositions] = useState<
    Record<string, number>
  >(
    players.reduce(
      (acc, player) => ({
        ...acc,
        [player.id]: 0,
      }),
      {} as Record<string, number>
    )
  );
  const [isMoving, setIsMoving] = useState(false);
  const [showDice, setShowDice] = useState(false);

  const handleDiceRoll = (result: number) => {
    if (isMoving) return;
    setShowDice(true);
    setIsMoving(true);

    // Hide dice after animation
    setTimeout(() => {
      setShowDice(false);
      // Move piece square by square
      const currentPosition = playerPositions[currentPlayer.id];
      const totalSpaces = result;
      let currentSpace = 0;

      const moveInterval = setInterval(() => {
        if (currentSpace >= totalSpaces) {
          clearInterval(moveInterval);
          const finalPosition = (currentPosition + totalSpaces) % 40;
          setPlayerPositions((prev) => ({
            ...prev,
            [currentPlayer.id]: finalPosition,
          }));
          return;
        }

        currentSpace++;
        const newPosition = (currentPosition + currentSpace) % 40;
        setPlayerPositions((prev) => ({
          ...prev,
          [currentPlayer.id]: newPosition,
        }));
      }, 300); // Move every 300ms

      // Change turns after movement completes
      setTimeout(() => {
        setIsMoving(false);
        const currentIndex = players.findIndex(
          (p) => p.id === currentPlayer.id
        );
        const nextIndex = (currentIndex + 1) % players.length;
        setCurrentPlayer(players[nextIndex]);
      }, 1000);
    }, 1500); // Match dice animation duration
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 bg-black/80 p-4 overflow-y-auto">
        <h2 className="text-white text-2xl mb-4">Players</h2>
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center mb-2">
            <img
              src={`/monopoly/p${player.figurineId}.png`}
              alt="player token"
              className="w-8 h-8 mr-2"
            />
            <div>
              <span className="text-white">{player.name}</span>
              <div className="flex gap-2">
                <span
                  className={`bg-green-800 px-2 rounded ${player.id === currentPlayer.id ? "ring-2 ring-white" : ""}`}
                >
                  {currentAmount}
                </span>
                <span className="bg-blue-800 px-2 rounded">0</span>
              </div>
            </div>
          </div>
        ))}

        {/* Money display */}
        <div className="fixed bottom-4 left-4">
          <div className="bg-green-800 px-4 py-2 rounded text-white text-xl">
            {currentAmount} M
          </div>
        </div>
      </div>

      {/* Main game board */}
      <div className="flex-1 relative overflow-hidden bg-[#c6ebc9]">
        {/* Board image */}
        <img
          src="/monopoly/board.png"
          alt="Monopoly Board"
          className="w-full h-full object-contain"
        />

        {/* Player tokens */}
        {players.map((player, index) => (
          <PlayerToken
            key={player.id}
            player={player}
            position={playerPositions[player.id]}
            isMoving={isMoving && player.id === currentPlayer.id}
            tokenNumber={index + 1}
          />
        ))}

        {/* Centered dice roll animation */}
        {showDice && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <DiceRoller onRollComplete={handleDiceRoll} />
          </div>
        )}

        {/* Action buttons overlay */}
        <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 flex gap-4 z-40">
          <button
            className={`bg-black/80 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer hover:bg-black/90 ${isMoving ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() =>
              !isMoving &&
              !showDice &&
              handleDiceRoll(Math.floor(Math.random() * 6) + 1)
            }
            disabled={isMoving || showDice}
          >
            ROLL THE
            <img src="/monopoly/c1.png" alt="Dice" className="w-6 h-6" />
            <img src="/monopoly/morgage.png" alt="Trade" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
