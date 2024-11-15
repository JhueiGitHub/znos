import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appDefinitions } from "../types/AppTypes";
import { useAppStore } from "../store/appStore";
import { FloatingDock } from "./ui/floating-dock";
import { useStyles } from "../hooks/useStyles";

const DOCK_HEIGHT = 70;
const TRIGGER_AREA_HEIGHT = 60;
const DOCK_BOTTOM_MARGIN = 9;

const Dock: React.FC = () => {
  const appStore = useAppStore();
  const { getColor } = useStyles();
  const [isDockVisible, setIsDockVisible] = useState(false);

  const handleAppClick = (app: (typeof appDefinitions)[number]) => {
    const openApp = appStore.openApps?.find((a) => a.id === app.id);
    if (openApp) {
      appStore.toggleAppMinimize?.(app.id);
    } else {
      appStore.openApp?.(app);
    }
  };

  const dockItems = appDefinitions.map((app) => {
    const openApp = appStore.openApps?.find((a) => a.id === app.id);
    const isOpen = !!openApp;
    const isMinimized = openApp?.isMinimized || false;

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
            style={{ backgroundColor: getColor("Overlaying BG") }}
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
