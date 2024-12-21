// app/components/MenuBar.tsx
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAppStore } from "@/app/store/appStore";
import { StreamWithFlows, FlowWithComponents } from "@/app/types/flow";
import { FlowComponent } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// PRESERVED: Original constants
const MENU_HEIGHT = 32;
const TRIGGER_AREA_HEIGHT = 20;

interface SystemIconProps {
  src: string;
  children: React.ReactNode;
  onReset?: () => Promise<void>;
}

const SystemIcon: React.FC<SystemIconProps> = ({ src, children }) => {
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

export const MenuBar = () => {
  // PRESERVED: Original hooks and state
  const { getColor } = useStyles();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { activeOSFlowId, setActiveOSFlowId, setOrionConfig } = useAppStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // PRESERVED: Original date update effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // PRESERVED: Original mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientY } = e;
      const menuRect = menuRef.current?.getBoundingClientRect();
      const inTriggerZone = clientY <= MENU_HEIGHT + TRIGGER_AREA_HEIGHT;

      const inMenuBounds =
        menuRect &&
        ((clientY >= menuRect.top && clientY <= menuRect.bottom) ||
          dropdownOpen);

      if (inTriggerZone || inMenuBounds) {
        setIsMenuVisible(true);
      } else if (!dropdownOpen) {
        setIsMenuVisible(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [dropdownOpen]);

  const resetObsidian = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/profile/reset-obsidian");
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["vault-folders"] });
      toast.success("Obsidian data has been reset");
    },
    onError: () => {
      toast.error("Failed to reset Obsidian data");
    },
  });

  // PRESERVED: Original queries
  const { data: orionConfig } = useQuery({
    queryKey: ["orion-config"],
    queryFn: async () => {
      const response = await axios.get("/api/apps/orion/config");
      return response.data;
    },
  });

  const { data: streamData } = useQuery<StreamWithFlows>({
    queryKey: ["orion-stream", orionConfig?.flow?.streamId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/streams/${orionConfig?.flow?.streamId}`
      );
      return response.data;
    },
    enabled: !!orionConfig?.flow?.streamId,
  });

  const flows = streamData?.flows || [];

  // PRESERVED: Original flow selection handler
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

  // PRESERVED: Original date formatting
  const formattedDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return currentDate.toLocaleString("en-US", options);
  }, [currentDate]);

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
            ref={menuRef}
            initial={{ opacity: 0, y: -MENU_HEIGHT }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -MENU_HEIGHT }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-2 z-[9999] backdrop-blur-sm"
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
                    backgroundColor: getColor("black-thick"),
                    borderColor: getColor("Brd"),
                  }}
                >
                  <span className="text-sm opacity-50">
                    More system settings coming soon
                  </span>
                </DropdownMenuContent>
              </SystemIcon>

              <SystemIcon src="/icns/system/_stellar.png">
                <DropdownMenuContent
                  className="min-w-[280px] p-4"
                  style={{
                    backgroundColor: getColor("black-thick"),
                    borderColor: getColor("Brd"),
                  }}
                >
                  <span className="text-sm opacity-50">
                    Media system coming soon
                  </span>
                </DropdownMenuContent>
              </SystemIcon>

              <div className="transform -translate-x-[4.5px]">
                <DropdownMenu onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="relative p-2 rounded-md flex items-center justify-center hover:bg-white/5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.img
                        src="/icns/system/_orion.png"
                        alt="Orion"
                        className="w-4 h-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-[280px] p-1"
                    align="start"
                    alignOffset={-10}
                    sideOffset={4}
                    style={{
                      backgroundColor: getColor("black-med"),
                      borderColor: getColor("Brd"),
                    }}
                  >
                    {flows.map((flow) => (
                      <DropdownMenuItem
                        key={flow.id}
                        onClick={() => handleFlowSelect(flow)}
                        className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer"
                        style={{
                          color: "rgba(76, 79, 105, 0.81)",
                        }}
                      >
                        <span className="text-sm">{flow.name}</span>
                        {flow.id === activeOSFlowId && (
                          <Check className="w-4 h-4 ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div
              className="text-xs font-medium"
              style={{
                color: "rgba(76, 79, 105, 0.81)",
              }}
            >
              {formattedDate}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
