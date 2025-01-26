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
import { MusicProvider } from "../apps/music/context/MusicContext";
import MusicWallpaper from "./MusicWallpaper";
import CustomCursor from "./CustomCursor";

const Desktop: React.FC = () => {
  const {
    openApps,
    activeAppId,
    updateWallpaper,
    updateDockIcons,
    updateCursor, // Add this
    setActiveOSFlowId,
    setOrionConfig,
  } = useAppStore();

  const { getColor, getFont } = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // In Desktop.tsx, update the initializeDesktop function
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
          const cursor = orionConfig.flow.components?.find(
            (c: FlowComponent) => c.type === "CURSOR"
          );
          const dockIcons = orionConfig.flow.components
            ?.filter((c: FlowComponent) => c.type === "DOCK_ICON")
            ?.sort((a: FlowComponent, b: FlowComponent) => a.order - b.order);

          if (wallpaper) {
            updateWallpaper({
              mode: wallpaper.mode,
              value: wallpaper.value,
              tokenId: wallpaper.tokenId,
              mediaId: wallpaper.mediaId,
            });
          }

          if (cursor) {
            updateCursor({
              tokenId: cursor.tokenId,
              outlineTokenId: cursor.outlineTokenId,
            });
          }

          if (dockIcons?.length) {
            updateDockIcons(dockIcons);
          }

          setOrionConfig({
            wallpaper: wallpaper || {
              mode: "color",
              value: null,
              tokenId: "Black",
            },
            cursor: cursor && {
              tokenId: cursor.tokenId,
              outlineTokenId: cursor.outlineTokenId,
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
  }, [
    updateWallpaper,
    updateDockIcons,
    updateCursor,
    setActiveOSFlowId,
    setOrionConfig,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    <MusicProvider>
      <div className="h-full w-full overflow-hidden fixed inset-0">
        <CustomCursor /> {/* Move it here, right after the root div */}
        <Wallpaper />
        <MusicWallpaper />
        <MenuBar />
        <div
          className="relative z-10 h-full overflow-hidden"
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
    </MusicProvider>
  );
};

export default Desktop;
