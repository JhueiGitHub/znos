// /root/app/apps/monopoly/components/welcome-screen.tsx
import { useState } from "react";
import LobbyRoom from "./lobby-room";

export default function WelcomeScreen() {
  const [gameMode, setGameMode] = useState("online");
  const [playerName, setPlayerName] = useState("");
  const [botCount, setBotCount] = useState(1);
  const [showLobby, setShowLobby] = useState(false);

  const handleModeChange = (mode: "online" | "computer") => {
    setGameMode(mode);
  };

  const handleStart = () => {
    if (playerName.trim()) {
      setShowLobby(true);
    }
  };

  if (showLobby) {
    return (
      <LobbyRoom
        playerName={playerName}
        botCount={botCount}
        onBack={() => setShowLobby(false)}
      />
    );
  }

  return (
    <div className="entry">
      <nav>
        <button data-select="true" data-tooltip-hover="play">
          <img src="./icon.png" alt="" />
        </button>
        <button data-select="false" data-tooltip-hover="server">
          <img src="./server.png" alt="" />
        </button>
        <button
          data-select="false"
          data-tooltip-hover="account"
          disabled={true}
        >
          <img src="./human.png" alt="" />
        </button>
        <br />
        <button data-select="false" data-tooltip-hover="credits">
          <img src="./credits.png" alt="" />
        </button>
        <button data-select="false" data-tooltip-hover="settings">
          <img src="./settings.png" alt="" />
        </button>
      </nav>

      <main>
        <header>
          Welcome to the <h3>MONOPOLY</h3>
          <p
            style={{
              fontSize: 9,
              cursor: "pointer",
              opacity: 0.8,
              width: "fit-content",
            }}
          >
            @itaylayzer - 10.12.23
          </p>
          Game
        </header>

        <nav className="join">
          <button
            data-tooltip-hover="online"
            data-select={gameMode === "online"}
            onClick={() => handleModeChange("online")}
          >
            <img src="./online.png" alt="" />
          </button>
          <button
            data-tooltip-hover="computer"
            data-select={gameMode === "computer"}
            onClick={() => handleModeChange("computer")}
          >
            <img src="./bot.png" alt="" />
          </button>
        </nav>

        <br />

        {gameMode === "online" ? (
          <>
            <div>
              <p>please enter your code:</p>
              <input type="text" placeholder="enter code" />
            </div>
            <div>
              <p>please enter your name:</p>
              <input
                type="text"
                placeholder="enter name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <p>please enter your name:</p>
              <input
                type="text"
                placeholder="enter name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <div>
              <p>bots settings:</p>
              <input
                type="number"
                min="1"
                max="3"
                value={botCount}
                onChange={(e) => setBotCount(parseInt(e.target.value))}
                style={{
                  fontSize: 20,
                  color: "#ccccccb3",
                  backgroundColor: "rgba(0, 0, 0, 0)",
                  border: 0,
                  borderBottom: "1px solid #ccccccb3",
                  marginBottom: 30,
                  width: "100%",
                }}
              />
            </div>
          </>
        )}

        <center>
          <button onClick={handleStart}>
            {gameMode === "online" ? "join" : "start"}
          </button>
        </center>
      </main>
    </div>
  );
}
