// components/Desktop.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import Window from "./Window";
import Dock from "./Dock";
import Wallpaper from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { useStyles } from "../hooks/useStyles";
import LoadingScreen from "@os/components/LoadingScreen";
import { SpotlightSearch } from "./SpotlightSearch";
import axios from "axios";
import { FlowComponent } from "@prisma/client";

const Desktop: React.FC = () => {
  // Preserve existing state
  const {
    openApps,
    activeAppId,
    updateWallpaper,
    updateDockIcons,
    setActiveOSFlowId,
    setOrionConfig,
  } = useAppStore();

  const { getColor, getFont } = useStyles();
  const [isLoading, setIsLoading] = useState(true);

  // Add spotlight state
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Preserve existing initialization effect
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

  // Add spotlight keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input elements are focused
      if (
        e.key === " " &&
        !["INPUT", "TEXTAREA"].includes(
          (document.activeElement?.tagName || "").toUpperCase()
        )
      ) {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      <SpotlightSearch
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </div>
  );
};

export default Desktop;
