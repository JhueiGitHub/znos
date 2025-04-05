// /root/app/apps/krokDrift/components/KrokGameHost.tsx - Pass Element to createWorld

"use client";

import React, { useRef, useEffect, useState } from "react";

import { createWorld } from "@newkrok/three-game/src/js/newkrok/three-game/world.js"; // Verify path
import CarsWorldConfig from "../lib/js/drift/drift-world-config.js";
import "../lib/js/effects-config.js";
import "../lib/js/static.js";

// Use 'any' for world instance type
interface GameWorld {
  dispose?: () => void;
}

interface KrokGameHostProps {
  // Changed prop back: Expect the ref object
  containerRef: React.RefObject<HTMLDivElement>;
}

const KrokGameHost: React.FC<KrokGameHostProps> = ({ containerRef }) => {
  const [loadStatus, setLoadStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [loadMessage, setLoadMessage] = useState("");
  const worldInstanceRef = useRef<any | null>(null);

  useEffect(() => {
    // Check ref.current now instead of containerId
    // Cast loadStatus to string for comparison
    if (
      !containerRef.current ||
      (loadStatus as string) !== "idle" ||
      worldInstanceRef.current
    ) {
      return;
    }

    // Get the actual DOM element from the ref
    const gameContainerElement = containerRef.current;

    setLoadStatus("loading");
    setLoadMessage("Initializing Game Engine...");
    console.log(
      "KrokDrift Host: Container ready. Creating Krok World with CarsWorldConfig."
    );

    const driftConfig = { ...CarsWorldConfig };

    // Setup Progress/Load Handlers
    const originalOnProgress = driftConfig.onProgress;
    driftConfig.onProgress = (ratio: number) => {
      if (loadStatus === "loading") {
        setLoadMessage(`Loading Assets: ${Math.round(ratio * 100)}%`);
        if (ratio >= 1) {
          setLoadMessage("Finalizing...");
        }
      }
      if (originalOnProgress) originalOnProgress(ratio);
    };

    const originalOnLoaded = driftConfig.onLoaded;
    driftConfig.onLoaded = (loadedWorld: any) => {
      if (originalOnLoaded) originalOnLoaded(loadedWorld);
      worldInstanceRef.current = loadedWorld;
      setLoadStatus("loaded");
      setLoadMessage("");
      console.log(
        "KrokDrift Host: World loaded and ready (onLoaded triggered)."
      );
    };

    // Create World
    let createPromise: Promise<any>;
    try {
      // --- Pass the actual DOM element ---
      // Add ts-ignore if the 'HTMLDivElement not assignable to string' error reappears
      // @ts-ignore
      createPromise = createWorld({
        target: gameContainerElement, // Pass the HTMLDivElement
        worldConfig: driftConfig,
        verbose: false,
      });
    } catch (error) {
      console.error(
        "KrokDrift Host: Error during immediate createWorld call:",
        error
      );
      setLoadStatus("error");
      setLoadMessage("Error: Failed during engine setup.");
      return;
    }

    createPromise
      .then((createdWorld) => {
        if (!worldInstanceRef.current) worldInstanceRef.current = createdWorld;
        console.log("KrokDrift Host: createWorld promise resolved.");
      })
      .catch((e) => {
        console.error("KrokDrift Host: Failed to create world:", e.stack || e);
        if (loadStatus !== "error") {
          setLoadStatus("error");
          setLoadMessage("Error: Failed to create game world.");
        }
      });

    // Cleanup Function
    return () => {
      console.log("KrokDrift Host: Cleanup initiated...");
      if (worldInstanceRef.current) {
        if (typeof worldInstanceRef.current.dispose === "function") {
          try {
            worldInstanceRef.current.dispose();
            console.log("KrokDrift Host: Called world.dispose()");
          } catch (error) {
            console.error(
              "KrokDrift Host: Error during world.dispose():",
              error
            );
          }
        } else {
          console.warn(
            "KrokDrift Host: World instance missing dispose() method."
          );
        }
      }
      worldInstanceRef.current = null;
      setLoadStatus("idle");
      console.log("KrokDrift Host: Cleanup complete.");
    };
    // Depend on the ref's current value (though ref object identity is stable)
    // Using containerRef.current directly isn't ideal dependency, rely on initial check.
  }, [containerRef]); // Depend on the ref object itself

  // Render Loading/Error States
  const showOverlay = loadStatus === "loading" || loadStatus === "error";

  return (
    <>
      {showOverlay && (
        <div
          style={
            {
              /* Loading overlay styles */
            }
          }
        >
          {loadMessage}
        </div>
      )}
      {/* Canvas/UI is appended by Krok's createWorld into the containerRef div */}
    </>
  );
};

export default KrokGameHost;
