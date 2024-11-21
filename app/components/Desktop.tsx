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
  const { openApps, activeAppId, updateWallpaper, updateDockIcons } =
    useAppStore();
  const { getColor, getFont } = useStyles();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDesktop = async () => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      try {
        const { data } = await axios.get("/api/apps/orion/config");
        console.log("Full Orion config response:", data);

        if (data?.flow?.components) {
          const wallpaper = data.flow.components.find(
            (c: any) => c.type === "WALLPAPER"
          );

          if (wallpaper) {
            // Include ALL wallpaper properties when updating
            const wallpaperConfig = {
              mode: wallpaper.mode,
              value: wallpaper.value,
              tokenId: wallpaper.tokenId,
              mediaId: wallpaper.mediaId, // Make sure to include mediaId
            };
            console.log("Updating wallpaper with config:", wallpaperConfig);
            updateWallpaper(wallpaperConfig);
          }

          const dockIcons = data.flow.components
            .filter((c: any) => c.type === "DOCK_ICON")
            .sort((a: any, b: any) => a.order - b.order);

          if (dockIcons.length) {
            updateDockIcons(dockIcons);
          }
        }
      } catch (error) {
        console.error("Failed to load Orion config:", error);
      }

      return () => clearTimeout(timer);
    };

    initializeDesktop();
  }, [updateWallpaper, updateDockIcons]);

  if (isLoading) {
    return <LoadingScreen />;
  }

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
