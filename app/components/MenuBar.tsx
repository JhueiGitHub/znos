"use client";

import React from "react";
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
import { StreamWithFlows, FlowWithComponents, FlowComponent } from "@/app/types/flow";

const FlowSelector = () => {
  const { getColor, getFont } = useStyles();
  const { openApps, activeOSFlowId, setActiveOSFlowId, setOrionConfig } = useAppStore();

  // First get the Orion config to get the stream ID
  const { data: orionConfig } = useQuery({
    queryKey: ["orion-config"],
    queryFn: async () => {
      const response = await axios.get("/api/apps/orion/config");
      return response.data;
    },
    enabled: openApps.length === 0,
  });

  // Then get the stream data using the correct stream ID
  const { data: streamData } = useQuery<StreamWithFlows>({
    queryKey: ["orion-stream", orionConfig?.flow?.streamId],
    queryFn: async () => {
      const response = await axios.get(`/api/streams/${orionConfig?.flow?.streamId}`);
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
      .map(c => ({
        id: c.id,
        name: c.name,
        mode: c.mode as "color" | "media",
        value: c.value,
        tokenId: c.tokenId || undefined,
        mediaId: c.mediaId || undefined,
        order: c.order
      }));

    setOrionConfig({
      wallpaper: wallpaper ? {
        mode: wallpaper.mode as "color" | "media",
        value: wallpaper.value,
        tokenId: wallpaper.tokenId || undefined,
        mediaId: wallpaper.mediaId || undefined
      } : {
        mode: "color",
        value: null,
        tokenId: "Black"
      },
      dockIcons
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-8 px-3 hover:bg-white/5 rounded transition-colors"
        style={{
          color: getColor("Text Primary (Hd)"),
          fontFamily: getFont("Text Primary"),
        }}
      >
        Flow ({flows.length})
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[180px] p-1"
        style={{
          backgroundColor: getColor("Glass"),
          borderColor: getColor("Brd"),
        }}
      >
        <AnimatePresence>
          {flows.map((flow: FlowWithComponents) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DropdownMenuItem
                className="flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded-sm cursor-pointer"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
                onClick={() => handleFlowSelect(flow)}
              >
                <span className="text-sm">{flow.name}</span>
                {flow.id === activeOSFlowId && (
                  <Check className="w-4 h-4 ml-2" />
                )}
              </DropdownMenuItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const MenuBar = () => {
  const { getColor } = useStyles();
  const { openApps } = useAppStore();

  if (openApps.length > 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 right-0 h-8 flex items-center px-2 z-50 backdrop-blur-sm"
      style={{
        backgroundColor: getColor("Glass"),
        borderBottom: `1px solid ${getColor("Brd")}`,
      }}
    >
      <FlowSelector />
    </motion.div>
  );
};

export default MenuBar;