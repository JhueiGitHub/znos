// Dock.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appDefinitions } from "../types/AppTypes";
import { useAppStore } from "../store/appStore";
import { FloatingDock } from "./ui/floating-dock";
import { useStyles } from "../hooks/useStyles";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Dock.tsx
interface DockIcon {
  id: string;
  name: string;
  // Fill
  mode: "color" | "media";
  value: string | null;
  tokenId?: string | undefined;
  // Outline (missing - need to add)
  outlineMode: "color" | "media";
  outlineValue: string | null;
  outlineTokenId?: string;
  order: number;
}

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

const DOCK_HEIGHT = 70;
const DOCK_WIDTH = 450;
const TRIGGER_AREA_HEIGHT = 60;
const DOCK_BOTTOM_MARGIN = 9;

const Dock: React.FC = () => {
  const appStore = useAppStore();
  const { getColor } = useStyles();
  const [isDockVisible, setIsDockVisible] = useState(false);
  const dockIcons = useAppStore((state) => state.orionConfig?.dockIcons);
  const updateDockIcons = useAppStore((state) => state.updateDockIcons);
  const openApps = useAppStore((state) => state.openApps);
  const dockRef = useRef<HTMLDivElement>(null);
  const activeOSFlowId = useAppStore((state) => state.activeOSFlowId);

  useQuery({
    queryKey: ["active-flow-dock", activeOSFlowId],
    queryFn: async () => {
      if (!activeOSFlowId) return null;
      const { data } = await axios.get(
        `/api/flows/${activeOSFlowId}/components`
      );
      const icons = data?.components
        ?.filter((c: any) => c.type === "DOCK_ICON")
        ?.sort((a: any, b: any) => a.order - b.order);
      if (icons?.length) {
        updateDockIcons(icons);
      }
      return icons;
    },
    enabled: !!activeOSFlowId,
  });

  const handleAppClick = useCallback(
    (app: (typeof appDefinitions)[number]) => {
      const openApp = appStore.openApps?.find((a) => a.id === app.id);
      if (openApp) {
        appStore.toggleAppMinimize?.(app.id);
      } else {
        appStore.openApp?.(app);
      }
    },
    [appStore]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const hasOpenApps = openApps.length > 0;

      if (hasOpenApps) {
        const triggerLeft = (windowWidth - DOCK_WIDTH) / 2;
        const triggerRight = triggerLeft + DOCK_WIDTH;
        const triggerTop = windowHeight - DOCK_HEIGHT;

        const isInTriggerArea =
          clientY > triggerTop &&
          clientY <= windowHeight &&
          clientX >= triggerLeft &&
          clientX <= triggerRight;

        setIsDockVisible(isInTriggerArea);
      } else {
        const shouldShowDock =
          clientY > windowHeight - DOCK_HEIGHT - TRIGGER_AREA_HEIGHT;
        setIsDockVisible(shouldShowDock);
      }
    },
    [openApps.length]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // Inside the dockItems mapping in Dock.tsx
  const dockItems = appDefinitions.map((app, index) => {
    const openApp = appStore.openApps?.find((a) => a.id === app.id);
    const isOpen = !!openApp;
    const isMinimized = openApp?.isMinimized || false;
    const dockIcon = dockIcons?.[index];
    const isColorFill = dockIcon?.mode === "color";

    return {
      title: app.name,
      isColorFill,
      // Pass the outline-related properties
      outlineMode: dockIcon?.outlineMode || "color",
      outlineValue: dockIcon?.outlineValue || null,
      // Pass the borderColor based on the outlineTokenId
      borderColor:
        dockIcon?.outlineMode === "color"
          ? getColor(dockIcon.outlineTokenId || "latte")
          : undefined,
      icon: (
        <button
          onClick={() => handleAppClick(app)}
          className="focus:outline-none w-full h-full flex items-center justify-center relative"
        >
          <div
            className="w-full h-full rounded-md flex items-center justify-center"
            style={{
              backgroundColor:
                dockIcon?.mode === "color"
                  ? getColor(dockIcon.tokenId || "Graphite")
                  : "transparent",
              minWidth: "24px",
              minHeight: "24px",
              maxWidth: isColorFill ? "48px" : "64px",
              maxHeight: isColorFill ? "48px" : "64px",
            }}
          >
            {dockIcon?.mode === "media" && dockIcon.value && (
              <img
                src={dockIcon.value}
                alt={app.name}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          {isOpen && (
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
              style={{
                backgroundColor: isMinimized
                  ? getColor("Warning")
                  : getColor("Active"),
              }}
            />
          )}
        </button>
      ),
      href: "#",
    };
  });

  return (
    <>
      <div
        ref={dockRef}
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2"
        style={{
          height: DOCK_HEIGHT,
          width: DOCK_WIDTH,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
      <div
        className="fixed inset-x-0 bottom-0 grid place-items-center"
        style={{ zIndex: 10000, pointerEvents: "none" }}
      >
        <AnimatePresence>
          {isDockVisible && (
            <motion.div
              initial={{ y: DOCK_HEIGHT, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: DOCK_HEIGHT, scale: 0.95, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
              className="flex justify-center items-end"
              style={{
                width: "fit-content",
                marginBottom: `${DOCK_BOTTOM_MARGIN}px`,
                pointerEvents: "auto",
              }}
            >
              <FloatingDock
                items={dockItems}
                backgroundColor="transparent" // Changed to transparent since we're handling the background in FloatingDock
                borderColor={getColor("Brd")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Dock;
