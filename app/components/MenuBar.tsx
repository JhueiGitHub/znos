import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAppStore } from "@/app/store/appStore";
import { useStyles } from "@/app/hooks/useStyles";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  StreamWithFlows,
  FlowWithComponents,
  FlowComponent,
} from "@/app/types/flow";

// Constants for menu behavior
const MENU_HEIGHT = 32;
const TRIGGER_AREA_HEIGHT = 20;
const CONTROLS_ZONE = {
  top: 12,
  left: 10,
  width: 70,
  height: 20,
  padding: 10,
};

// System icons configuration
const SYSTEM_ICONS = [
  { id: "dopa", src: "/icns/system/_dopa.png", label: "System" },
  { id: "stellar", src: "/icns/system/_stellar.png", label: "Media" },
  { id: "orion", src: "/icns/system/_orion.png", label: "Configuration" },
] as const;

const isInControlZone = (x: number, y: number) => {
  const { top, left, width, height, padding } = CONTROLS_ZONE;
  return (
    x >= left - padding &&
    x <= left + width + padding &&
    y >= top - padding &&
    y <= top + height + padding
  );
};

// Common animation variants
const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 30 },
};

const SystemIcon: React.FC<{
  src: string;
  children?: React.ReactNode;
}> = ({ src, children }) => {
  const { getColor } = useStyles();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="relative p-2 rounded-md flex items-center justify-center hover:bg-white/5"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.img
            src={src}
            alt="System Icon"
            className="w-4 h-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
        </motion.button>
      </DropdownMenuTrigger>
      {children}
    </DropdownMenu>
  );
};

const OrionMenu = () => {
  const { getColor, getFont } = useStyles();
  const { openApps, activeOSFlowId, setActiveOSFlowId, setOrionConfig } =
    useAppStore();

  const { data: orionConfig } = useQuery({
    queryKey: ["orion-config"],
    queryFn: async () => {
      const response = await axios.get("/api/apps/orion/config");
      return response.data;
    },
    enabled: openApps.length === 0,
  });

  const { data: streamData } = useQuery<StreamWithFlows>({
    queryKey: ["orion-stream", orionConfig?.flow?.streamId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/streams/${orionConfig?.flow?.streamId}`
      );
      return response.data;
    },
    enabled: !!orionConfig?.flow?.streamId && openApps.length === 0,
  });

  const flows = streamData?.flows || [];

  const handleFlowSelect = async (flow: FlowWithComponents) => {
    setActiveOSFlowId(flow.id);

    const wallpaper = flow.components.find(
      (c: FlowComponent) => c.type === "WALLPAPER"
    );
    const dockIcons = flow.components
      .filter((c: FlowComponent) => c.type === "DOCK_ICON")
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        id: c.id,
        name: c.name,
        mode: c.mode as "color" | "media",
        value: c.value,
        tokenId: c.tokenId || undefined,
        mediaId: c.mediaId || undefined,
        order: c.order,
      }));

    setOrionConfig({
      wallpaper: wallpaper
        ? {
            mode: wallpaper.mode as "color" | "media",
            value: wallpaper.value,
            tokenId: wallpaper.tokenId || undefined,
            mediaId: wallpaper.mediaId || undefined,
          }
        : {
            mode: "color",
            value: null,
            tokenId: "Black",
          },
      dockIcons,
    });
  };

  return (
    <DropdownMenuContent
      className="min-w-[280px] p-1"
      style={{
        backgroundColor: getColor("Glass"),
        borderColor: getColor("Brd"),
      }}
    >
      <AnimatePresence>
        {flows.map((flow: FlowWithComponents) => (
          <motion.div
            key={flow.id}
            {...fadeInScale}
            transition={{ delay: 0.1 }}
          >
            <DropdownMenuItem
              className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
              onClick={() => handleFlowSelect(flow)}
            >
              <span className="text-sm">{flow.name}</span>
              {flow.id === activeOSFlowId && <Check className="w-4 h-4 ml-2" />}
            </DropdownMenuItem>
          </motion.div>
        ))}
      </AnimatePresence>
    </DropdownMenuContent>
  );
};

export const DebugPanel = () => {
  const [events, setEvents] = useState<
    Array<{
      id: number;
      text: string;
      timestamp: number;
    }>
  >([]);

  useEffect(() => {
    const eventBus = (e: CustomEvent<string>) => {
      setEvents((prev) =>
        [
          ...prev,
          {
            id: Date.now(),
            text: e.detail,
            timestamp: Date.now(),
          },
        ].slice(-10)
      ); // Keep last 10 events
    };

    window.addEventListener("menuDebug", eventBus as EventListener);
    return () =>
      window.removeEventListener("menuDebug", eventBus as EventListener);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[10000] w-96 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 p-4">
      <h3 className="text-white/80 text-sm font-bold mb-2">Menu Debug</h3>
      <div className="space-y-1">
        {events.map((event) => (
          <div key={event.id} className="text-xs text-white/60 flex gap-2">
            <span>
              {new Date(event.timestamp).toISOString().substr(11, 12)}
            </span>
            <span>{event.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const debugEvent = (text: string) => {
  window.dispatchEvent(new CustomEvent("menuDebug", { detail: text }));
};

export const MenuBar = () => {
  const { getColor } = useStyles();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [blockMenuDisplay, setBlockMenuDisplay] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const inTriggerZone = clientY <= MENU_HEIGHT + TRIGGER_AREA_HEIGHT;
      const inDeadZone = isInControlZone(clientX, clientY);

      // If we leave trigger zone, always hide and reset
      if (!inTriggerZone) {
        if (isMenuVisible) {
          debugEvent("🔴 Trigger area left - hiding menu bar");
          setIsMenuVisible(false);
          setBlockMenuDisplay(false);
        }
        return;
      }

      // First time entering trigger zone
      if (!isMenuVisible) {
        debugEvent(
          `🟡 Trigger area entered${inDeadZone ? " via deadzone" : ""}`
        );

        // If entering through deadzone, block menu
        if (inDeadZone && !blockMenuDisplay) {
          debugEvent("🚫 Deadzone entered first - blocking menu display");
          setBlockMenuDisplay(true);
          return;
        }

        // If not blocked and not in deadzone, show menu
        if (!blockMenuDisplay && !inDeadZone) {
          debugEvent("✅ Clean trigger area entry - showing menu");
          setIsMenuVisible(true);
          return;
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMenuVisible, blockMenuDisplay]);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[9999]"
        style={{
          height: MENU_HEIGHT + TRIGGER_AREA_HEIGHT,
          pointerEvents: "none",
        }}
      />

      <AnimatePresence>
        {isMenuVisible && (
          <motion.div
            initial={{ opacity: 0, y: -MENU_HEIGHT }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -MENU_HEIGHT }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 h-8 flex items-center px-2 z-[9999] backdrop-blur-sm"
            style={{
              backgroundColor: getColor("Glass"),
              borderBottom: `1px solid ${getColor("Brd")}`,
              pointerEvents: "auto",
            }}
          >
            <div className="flex items-center gap-3">
              <SystemIcon src="/icns/system/_dopa.png">
                <DropdownMenuContent
                  className="min-w-[280px] p-4"
                  style={{
                    backgroundColor: getColor("Glass"),
                    borderColor: getColor("Brd"),
                  }}
                >
                  <motion.div {...fadeInScale}>
                    <span className="text-sm opacity-50">
                      System settings coming soon
                    </span>
                  </motion.div>
                </DropdownMenuContent>
              </SystemIcon>

              <SystemIcon src="/icns/system/_stellar.png">
                <DropdownMenuContent
                  className="min-w-[280px] p-4"
                  style={{
                    backgroundColor: getColor("Glass"),
                    borderColor: getColor("Brd"),
                  }}
                >
                  <motion.div {...fadeInScale}>
                    <span className="text-sm opacity-50">
                      Media system coming soon
                    </span>
                  </motion.div>
                </DropdownMenuContent>
              </SystemIcon>

              <div className="transform -translate-x-[4.5px]">
                <SystemIcon src="/icns/system/_orion.png">
                  <OrionMenu />
                </SystemIcon>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
