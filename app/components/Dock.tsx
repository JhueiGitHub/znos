import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appDefinitions } from "../types/AppTypes";
import { useAppStore } from "../store/appStore";
import { FloatingDock } from "./ui/floating-dock";
import { useStyles } from "../hooks/useStyles";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Add interface for dock icon data
interface DockIcon {
  id: string;
  name: string;
  mode: "color" | "media";
  value: string | null;
  tokenId: string | undefined;
  order: number;
}

// Add interface for dock items
interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

const DOCK_HEIGHT = 70;
const TRIGGER_AREA_HEIGHT = 60;
const DOCK_BOTTOM_MARGIN = 9;

const Dock: React.FC = () => {
  const appStore = useAppStore();
  const { getColor } = useStyles();
  const [isDockVisible, setIsDockVisible] = useState(false);
  const dockIcons = useAppStore((state) => state.orionConfig?.dockIcons);
  const updateOrionConfig = useAppStore((state) => state.setOrionConfig);

  const { data: dockIconsData } = useQuery({
    queryKey: ["dock-icons-config"],
    queryFn: async () => {
      const response = await axios.get<DockIcon[]>(
        "/api/flows/components/dock-icons"
      );

      const updatedConfig = {
        wallpaper: useAppStore.getState().orionConfig?.wallpaper,
        dockIcons: response.data.map((icon: DockIcon) => ({
          id: icon.id,
          name: icon.name,
          mode: icon.mode,
          value: icon.value,
          tokenId: icon.tokenId,
          order: icon.order,
        })),
      };
      updateOrionConfig(updatedConfig);

      return response.data;
    },
  });

  const handleAppClick = (app: (typeof appDefinitions)[number]) => {
    const openApp = appStore.openApps?.find((a) => a.id === app.id);
    if (openApp) {
      appStore.toggleAppMinimize?.(app.id);
    } else {
      appStore.openApp?.(app);
    }
  };

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientY } = e;
    const windowHeight = window.innerHeight;
    const shouldShowDock =
      clientY > windowHeight - DOCK_HEIGHT - TRIGGER_AREA_HEIGHT;
    setIsDockVisible(shouldShowDock);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

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
                pointerEvents: "auto", // Fixed from pointerPoints to pointerEvents
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
