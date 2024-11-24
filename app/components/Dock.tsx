import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appDefinitions } from "../types/AppTypes";
import { useAppStore } from "../store/appStore";
import { FloatingDock } from "./ui/floating-dock";
import { useStyles } from "../hooks/useStyles";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// PRESERVED: Original interfaces
interface DockIcon {
  id: string;
  name: string;
  mode: "color" | "media";
  value: string | null;
  tokenId: string | undefined;
  order: number;
}

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

// PRESERVED: Original constants
const DOCK_HEIGHT = 70;
const TRIGGER_AREA_HEIGHT = 60;
const DOCK_BOTTOM_MARGIN = 9;

const Dock: React.FC = () => {
  // PRESERVED: Original hooks and state
  const appStore = useAppStore();
  const { getColor } = useStyles();
  const [isDockVisible, setIsDockVisible] = useState(false);
  const dockIcons = useAppStore((state) => state.orionConfig?.dockIcons);
  const updateDockIcons = useAppStore((state) => state.updateDockIcons);
  
  // NEW: Get active flow ID
  const activeOSFlowId = useAppStore((state) => state.activeOSFlowId);

  // NEW: Query for active flow's dock icons
  useQuery({
    queryKey: ["active-flow-dock", activeOSFlowId],
    queryFn: async () => {
      if (!activeOSFlowId) return null;
      // AFTER (correct):
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

  // PRESERVED: Original app click handler
  const handleAppClick = useCallback((app: (typeof appDefinitions)[number]) => {
    const openApp = appStore.openApps?.find((a) => a.id === app.id);
    if (openApp) {
      appStore.toggleAppMinimize?.(app.id);
    } else {
      appStore.openApp?.(app);
    }
  }, [appStore]);

  // PRESERVED: Original dock items mapping
  const dockItems: DockItem[] = appDefinitions.map((app, index) => {
    const openApp = appStore.openApps?.find((a) => a.id === app.id);
    const isOpen = !!openApp;
    const isMinimized = openApp?.isMinimized || false;
    const dockIcon = dockIcons?.[index];

    return {
      title: app.name,
      icon: (
        <button
          onClick={() => handleAppClick(app)}
          className="focus:outline-none w-12 h-12 flex items-center justify-center relative"
          style={{ backgroundColor: getColor("Overlaying BG") }}
        >
          <div
            className="w-8 h-8 rounded-md"
            style={{
              backgroundColor:
                dockIcon?.mode === "color"
                  ? getColor(dockIcon.tokenId || "Graphite")
                  : "transparent",
              backgroundImage:
                dockIcon?.mode === "media" && dockIcon.value
                  ? `url(${dockIcon.value})`
                  : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
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

  // PRESERVED: Original mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientY } = e;
    const windowHeight = window.innerHeight;
    const shouldShowDock =
      clientY > windowHeight - DOCK_HEIGHT - TRIGGER_AREA_HEIGHT;
    setIsDockVisible(shouldShowDock);
  }, []);

  // PRESERVED: Original mouse move effect
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // PRESERVED: Original render with exact animation
  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0"
        style={{ height: TRIGGER_AREA_HEIGHT, zIndex: 9999 }}
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
                backgroundColor={getColor("Glass")}
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