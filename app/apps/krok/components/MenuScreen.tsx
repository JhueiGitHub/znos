"use client";

import React from "react";

interface MenuScreenProps {
  onStart: () => void;
  getColor: (color: string) => string;
  error?: string | null;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStart, getColor, error }) => {
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
          Zenith Drift
        </h1>
        
        <div 
          className="mb-8"
          style={{ color: getColor("Text Secondary (Bd)") }}
        >
          <p className="mb-4 text-center">
            Master the art of drifting in this high-speed racing experience.
          </p>
          
          <div className="border rounded-lg p-4 mb-4" style={{ borderColor: getColor("Brd") }}>
            <h3 className="text-lg font-medium mb-2" style={{ color: getColor("Text Primary (Hd)") }}>
              Controls:
            </h3>
            <ul className="space-y-1">
              <li>↑ / ↓ - Accelerate / Brake</li>
              <li>← / → - Steer left / right</li>
              <li>Space - Handbrake (for drifting)</li>
              <li>Esc - Pause game</li>
            </ul>
          </div>
        </div>
        
        {error && (
          <div 
            className="mb-6 p-4 rounded-lg border" 
            style={{
              backgroundColor: getColor("Night"),
              borderColor: "#FF4444",
              color: "#FF4444"
            }}
          >
            <p>{error}</p>
            <p className="mt-2 text-sm">Please try refreshing the app or contact support if the issue persists.</p>
          </div>
        )}
          
        <div className="flex justify-center">
          <button
            onClick={onStart}
            className="px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            style={{
              backgroundColor: getColor("Lilac Accent"),
              color: getColor("Text Primary (Hd)"),
            }}
          >
            Start Racing
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;