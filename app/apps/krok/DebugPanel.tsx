"use client";

import React from "react";

interface GameStats {
  fps: number;
  speed: number;
  position: { x: number; y: number; z: number };
  direction: { x: number; z: number };
  isDrifting: boolean;
  currentTexture: string;
  cameraMode: string;
}

interface DebugPanelProps {
  stats: GameStats;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ stats }) => {
  // Format position and direction values
  const formatValue = (value: number) => value.toFixed(2);

  // List of all enabled MCP abilities
  const mcpAbilities = [
    "FileSystem",
    "GitHub",
    "Brave Search",
    "Web Tools",
    "Analysis Tools",
    "Artifacts",
  ];

  // Highlight specific abilities being used for this task
  const highlightedAbilities = ["FileSystem", "GitHub", "Brave Search"];

  return (
    <div
      className="absolute top-4 right-4 w-64 p-4 rounded-lg z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold mb-2" style={{ color: "#4C4F69" }}>
          KROK DRIFT DEBUG
        </h3>
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase opacity-70 mb-1">Performance</h4>
        <div className="flex justify-between text-sm">
          <span>FPS</span>
          <span className="font-mono">{stats.fps}</span>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase opacity-70 mb-1">Vehicle</h4>
        <div className="flex justify-between text-sm">
          <span>Speed</span>
          <span className="font-mono">{stats.speed} km/h</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Drifting</span>
          <span
            className="font-mono"
            style={{ color: stats.isDrifting ? "#4C4F69" : "white" }}
          >
            {stats.isDrifting ? "YES" : "NO"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Texture</span>
          <span className="font-mono">{stats.currentTexture}</span>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase opacity-70 mb-1">Position</h4>
        <div className="grid grid-cols-3 gap-1 text-sm">
          <span className="opacity-70">X:</span>
          <span className="font-mono col-span-2">
            {formatValue(stats.position.x)}
          </span>
          <span className="opacity-70">Y:</span>
          <span className="font-mono col-span-2">
            {formatValue(stats.position.y)}
          </span>
          <span className="opacity-70">Z:</span>
          <span className="font-mono col-span-2">
            {formatValue(stats.position.z)}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase opacity-70 mb-1">Direction</h4>
        <div className="grid grid-cols-3 gap-1 text-sm">
          <span className="opacity-70">X:</span>
          <span className="font-mono col-span-2">
            {formatValue(stats.direction.x)}
          </span>
          <span className="opacity-70">Z:</span>
          <span className="font-mono col-span-2">
            {formatValue(stats.direction.z)}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-xs uppercase opacity-70 mb-1">Camera</h4>
        <div className="flex justify-between text-sm">
          <span>Mode</span>
          <span className="font-mono">{stats.cameraMode}</span>
        </div>
      </div>

      <div className="text-xs opacity-60 mt-4 pt-3 border-t border-white border-opacity-10">
        <p className="mb-1">MCP Capabilities:</p>
        <ul className="list-none pl-0">
          {mcpAbilities.map((ability) => (
            <li
              key={ability}
              className="mb-1"
              style={{
                color: highlightedAbilities.includes(ability)
                  ? "#4C4F69"
                  : "inherit",
                fontWeight: highlightedAbilities.includes(ability)
                  ? "bold"
                  : "normal",
              }}
            >
              • {ability}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-center mt-4 opacity-50">
        Press C - Change camera | V - Change texture
      </div>
    </div>
  );
};

export default DebugPanel;
