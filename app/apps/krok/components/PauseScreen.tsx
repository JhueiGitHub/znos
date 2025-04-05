"use client";

import React from "react";

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  getColor: (color: string) => string;
}

const PauseScreen: React.FC<PauseScreenProps> = ({
  onResume,
  onRestart,
  getColor,
}) => {
  return (
    <div
      className="menu-overlay"
      style={{ backgroundColor: `${getColor("Night")}C0` }} // Adding C0 for 75% opacity
    >
      <div
        className="menu-container"
        style={{
          backgroundColor: getColor("Glass"),
          border: `1px solid ${getColor("Brd")}`,
        }}
      >
        <h1
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: getColor("Text Primary (Hd)") }}
        >
          Game Paused
        </h1>

        <div className="flex flex-col gap-4">
          <button
            onClick={onResume}
            className="px-6 py-3 rounded-lg text-lg font-medium transition-colors"
            style={{
              backgroundColor: getColor("Lilac Accent"),
              color: getColor("Text Primary (Hd)"),
            }}
          >
            Resume Game
          </button>

          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-lg text-lg font-medium transition-colors"
            style={{
              backgroundColor: getColor("Night"),
              color: getColor("Text Primary (Hd)"),
              border: `1px solid ${getColor("Brd")}`,
            }}
          >
            Return to Menu
          </button>
        </div>

        <div
          className="mt-6 text-sm text-center"
          style={{ color: getColor("Text Secondary (Bd)") }}
        >
          <p>Press ESC to resume</p>
        </div>
      </div>
    </div>
  );
};

export default PauseScreen;
