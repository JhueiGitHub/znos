// /root/app/apps/monopoly/components/lobby-room.tsx
import { useState, useEffect } from "react";
import { generateBotName } from "../utils/name-generator";
import type { Player } from "../types/game";
import GameRoom from "./game-room";

interface LobbyRoomProps {
  playerName: string;
  botCount: number;
  onBack: () => void;
}

export default function LobbyRoom({
  playerName,
  botCount,
  onBack,
}: LobbyRoomProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Create initial player list with human player and bots
    const initialPlayers: Player[] = [
      {
        id: "player1",
        name: playerName,
        isBot: false,
        isReady: false,
        figurineId: 1, // Human player always gets figurine 1
      },
      ...Array(botCount)
        .fill(null)
        .map((_, index) => ({
          id: `bot${index + 1}`,
          name: generateBotName(),
          isBot: true,
          isReady: true,
          figurineId: index + 2, // Bots get figurines 2 onwards
        })),
    ];
    setPlayers(initialPlayers);
  }, [playerName, botCount]);

  const handleReady = () => {
    setIsReady(!isReady);
    setPlayers(
      players.map((player) =>
        player.id === "player1" ? { ...player, isReady: !isReady } : player
      )
    );
  };

  useEffect(() => {
    // Start game when all players are ready
    if (players.every((player) => player.isReady)) {
      const timer = setTimeout(() => {
        setGameStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [players]);

  if (gameStarted) {
    return <GameRoom players={players} />;
  }

  return (
    <div className="entry">
      <nav>
        <button onClick={onBack} data-tooltip-hover="back">
          <img src="./back.png" alt="" />
        </button>
      </nav>

      <main>
        <header>
          <h3>Lobby Room</h3>
        </header>

        <div
          className="players-list"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {players.map((player) => (
            <div
              key={player.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <img
                  src={`/monopoly/p${player.figurineId}.png`}
                  alt="player token"
                  style={{ width: "24px", height: "24px" }}
                />
                <span style={{ color: "#ccccccb3" }}>
                  {player.name} {player.isBot ? "(Bot)" : ""}
                </span>
              </div>
              <span
                style={{
                  color: player.isReady ? "#4CAF50" : "#ccccccb3",
                  fontSize: "14px",
                }}
              >
                {player.isReady ? "Ready" : "Not Ready"}
              </span>
            </div>
          ))}
        </div>

        <center>
          <button
            onClick={handleReady}
            style={{
              backgroundColor: isReady ? "#4CAF50" : "#4c4f69",
            }}
          >
            {isReady ? "Ready!" : "Ready?"}
          </button>
        </center>
      </main>
    </div>
  );
}
