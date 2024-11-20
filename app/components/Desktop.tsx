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
      // Loading screen timer
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      try {
        // Fetch complete Orion config - single source for initial data
        const response = await axios.get("/api/apps/orion/config");

        if (response.data?.flow?.components) {
          const components = response.data.flow.components;

          // WALLPAPER INITIALIZATION
          const wallpaperComponent = components.find(
            (c: any) => c.type === "WALLPAPER"
          );
          if (wallpaperComponent) {
            updateWallpaper({
              mode: wallpaperComponent.mode,
              value: wallpaperComponent.value,
              tokenId: wallpaperComponent.tokenId,
            });
          }

          // DOCK ICONS INITIALIZATION - Parallel to wallpaper
          const dockIconComponents = components
            .filter((c: any) => c.type === "DOCK_ICON")
            .sort((a: any, b: any) => a.order - b.order); // Maintain order

          if (dockIconComponents.length) {
            updateDockIcons(
              dockIconComponents.map((icon: any) => ({
                id: icon.id,
                name: icon.name,
                mode: icon.mode,
                value: icon.value,
                tokenId: icon.tokenId,
                order: icon.order,
              }))
            );
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
