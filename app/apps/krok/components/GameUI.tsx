"use client";

import React from "react";

interface GameUIProps {
  speed: number;
  lapTime: number;
  bestLapTime: number;
  driftScore: number;
  onPause: () => void;
  getColor: (color: string) => string;
}

const GameUI: React.FC<GameUIProps> = ({
  speed,
  lapTime,
  bestLapTime,
  driftScore,
  onPause,
  getColor,
}) => {
  // Format time as mm:ss.ms
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0").substring(0, 2)}`;
  };

  return (
    <>
      {/* Speedometer */}
      <div
        className="hud-element speedometer"
        style={{
          backgroundColor: `${getColor("Night")}B3`, // Adding B3 for 70% opacity
          border: `1px solid ${getColor("Brd")}`,
          color: getColor("Text Primary (Hd)"),
        }}
      >
        <div className="text-3xl font-bold">{Math.round(speed)}</div>
        <div className="text-xs opacity-70">KM/H</div>
      </div>

      {/* Lap Timer */}
      <div
        className="hud-element lap-timer"
        style={{
          backgroundColor: `${getColor("Night")}B3`,
          border: `1px solid ${getColor("Brd")}`,
          color: getColor("Text Primary (Hd)"),
        }}
      >
        <div className="flex flex-col">
          <div className="text-sm opacity-70">Current Lap</div>
          <div className="text-xl font-medium">{formatTime(lapTime)}</div>

          {bestLapTime > 0 && (
            <>
              <div className="text-sm opacity-70 mt-2">Best Lap</div>
              <div className="text-lg font-medium">
                {formatTime(bestLapTime)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Drift Score */}
      <div
        className="hud-element"
        style={{
          backgroundColor: `${getColor("Night")}B3`,
          border: `1px solid ${getColor("Brd")}`,
          color: getColor("Text Primary (Hd)"),
          top: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div className="text-center">
          <div className="text-xs opacity-70">DRIFT SCORE</div>
          <div className="text-xl font-bold">
            {Math.floor(driftScore).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Pause Button */}
      <div
        className="hud-element pause-button interactive"
        style={{
          backgroundColor: `${getColor("Night")}B3`,
          border: `1px solid ${getColor("Brd")}`,
          color: getColor("Text Primary (Hd)"),
          cursor: "pointer",
        }}
        onClick={onPause}
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <span>Pause</span>
        </div>
      </div>
    </>
  );
};

export default GameUI;
