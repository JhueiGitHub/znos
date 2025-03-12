"use client";

import { useEffect } from "react";
import { MSMProvider } from "./context/MSMContext";
import GameApp from "./components/GameApp";
import { useStyles } from "@/app/hooks/useStyles";

export default function MSMApp() {
  const { getColor } = useStyles();

  // Set up initial game state
  useEffect(() => {
    // Preload assets or perform other initializations
    const preloadAssets = async () => {
      // This is just a placeholder for actual asset loading
      console.log("Preloading MSM assets...");
    };

    preloadAssets();

    // Set up custom styles for the app within the OS
    document.documentElement.style.setProperty(
      "--msm-shadow-color",
      getColor("Brd")
    );

    // Cleanup
    return () => {
      // Reset any custom styles
      document.documentElement.style.removeProperty("--msm-shadow-color");
    };
  }, [getColor]);

  return (
    <MSMProvider>
      <div className="h-full w-full overflow-hidden">
        <GameApp />
      </div>
    </MSMProvider>
  );
}
