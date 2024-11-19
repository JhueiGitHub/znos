// components/Desktop.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import Window from "./Window";
import Dock from "./Dock";
import Wallpaper from "./Wallpaper";
import { useStyles } from "../hooks/useStyles";
import LoadingScreen from "@os/components/LoadingScreen";
import axios from "axios";

const Desktop: React.FC = () => {
  const { openApps, activeAppId } = useAppStore();
  const { getColor, getFont } = useStyles();
  const [isLoading, setIsLoading] = useState(true);

  // Combine both effects into one
  useEffect(() => {
    const initializeDesktop = async () => {
      // First handle loading screen
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      // Then initialize Orion config
      try {
        const response = await axios.get("/api/apps/orion/config");
        if (response.data?.components) {
          const wallpaperComponent = response.data.components.find(
            (c: any) => c.type === "WALLPAPER"
          );

          if (wallpaperComponent) {
            useAppStore.getState().updateWallpaper({
              mode: wallpaperComponent.mode,
              value: wallpaperComponent.value,
              tokenId: wallpaperComponent.tokenId,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load Orion config:", error);
      }

      // Cleanup timer if component unmounts
      return () => clearTimeout(timer);
    };

    initializeDesktop();
  }, []);

  // Render loading screen if loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Main desktop render
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <Wallpaper />
      <div
        className="relative z-10 h-full"
        style={{
          color: getColor("Text Primary (Hd)"),
          fontFamily: getFont("Text Primary"),
        }}
      >
        {openApps.map((app) => (
          <Window key={app.id} app={app} isActive={app.id === activeAppId} />
        ))}
        <Dock />
      </div>
    </div>
  );
};

export default Desktop;
