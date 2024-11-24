"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import Window from "./Window";
import Dock from "./Dock";
import Wallpaper from "./Wallpaper";
import MenuBar from "./MenuBar";
import { useStyles } from "../hooks/useStyles";
import LoadingScreen from "@os/components/LoadingScreen";
import axios from "axios";
import { FlowComponent } from "@/app/types/flow";

const Desktop: React.FC = () => {
  const {
    openApps,
    activeAppId,
    updateWallpaper,
    updateDockIcons,
    setActiveOSFlowId,
    setOrionConfig
  } = useAppStore();
  
  const { getColor, getFont } = useStyles();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDesktop = async () => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      try {
        const { data: orionConfig } = await axios.get("/api/apps/orion/config");

        if (orionConfig?.flow) {
          setActiveOSFlowId(orionConfig.flow.id);

          const wallpaper = orionConfig.flow.components?.find(
            (c: FlowComponent) => c.type === "WALLPAPER"
          );

          if (wallpaper) {
            updateWallpaper({
              mode: wallpaper.mode,
              value: wallpaper.value,
              tokenId: wallpaper.tokenId,
              mediaId: wallpaper.mediaId,
            });
          }

          const dockIcons = orionConfig.flow.components
            ?.filter((c: FlowComponent) => c.type === "DOCK_ICON")
            ?.sort((a: FlowComponent, b: FlowComponent) => a.order - b.order);

          if (dockIcons?.length) {
            updateDockIcons(dockIcons);
          }

          setOrionConfig({
            wallpaper: wallpaper || {
              mode: "color",
              value: null,
              tokenId: "Black",
            },
            dockIcons: dockIcons || [],
          });
        }
      } catch (error) {
        console.error("Failed to load OS config:", error);
      }

      return () => clearTimeout(timer);
    };

    initializeDesktop();
  }, [updateWallpaper, updateDockIcons, setActiveOSFlowId, setOrionConfig]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <Wallpaper />
      <MenuBar />
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