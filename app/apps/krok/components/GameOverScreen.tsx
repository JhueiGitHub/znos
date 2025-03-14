"use client";

import React, { useState, useEffect } from "react";

interface GameOverScreenProps {
  score: number;
  bestLapTime: number;
  onRestart: () => void;
  getColor: (color: string) => string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  bestLapTime,
  onRestart,
  getColor,
}) => {
  const [highScore, setHighScore] = useState<number>(0);
  const [newHighScore, setNewHighScore] = useState<boolean>(false);

  // Format time as mm:ss.ms
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0").substring(0, 2)}`;
  };

  // Save score and check for high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("drifting_high_score");
    const parsedHighScore = savedHighScore ? parseInt(savedHighScore) : 0;

    setHighScore(parsedHighScore);

    if (score > parsedHighScore) {
      localStorage.setItem("drifting_high_score", score.toString());
      setHighScore(score);
      setNewHighScore(true);
    }
  }, [score]);

  return (
    <div
      className="menu-overlay"
      style={{ backgroundColor: `${getColor("Night")}E6` }} // Adding E6 for 90% opacity
    >
      <div
        className="menu-container"
        style={{
          backgroundColor: getColor("Glass"),
          border: `1px solid ${getColor("Brd")}`,
        }}
      >
        <h1
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: getColor("Text Primary (Hd)") }}
        >
          Race Complete
        </h1>

        <div
          className="mb-8 space-y-4"
          style={{ color: getColor("Text Secondary (Bd)") }}
        >
          <div className="flex justify-between items-center">
            <span className="text-lg">Drift Score:</span>
            <span
              className="text-xl font-bold"
              style={{ color: getColor("Text Primary (Hd)") }}
            >
              {Math.floor(score).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg">Best Lap Time:</span>
            <span
              className="text-xl font-bold"
              style={{ color: getColor("Text Primary (Hd)") }}
            >
              {bestLapTime > 0 ? formatTime(bestLapTime) : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg">High Score:</span>
            <span
              className="text-xl font-bold"
              style={{
                color: newHighScore
                  ? getColor("Lilac Accent")
                  : getColor("Text Primary (Hd)"),
              }}
            >
              {Math.floor(highScore).toLocaleString()}
              {newHighScore && " (New!)"}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onRestart}
            className="px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            style={{
              backgroundColor: getColor("Lilac Accent"),
              color: getColor("Text Primary (Hd)"),
            }}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
