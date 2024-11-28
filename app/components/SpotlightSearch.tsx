// components/SpotlightSearch.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MediaItem, Flow, Stream } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import { useStyles } from "@/app/hooks/useStyles";
import { useAppStore } from "@/app/store/appStore";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FlowWithComponents extends Flow {
  components: any[];
}

interface StreamWithFlows extends Stream {
  flows: FlowWithComponents[];
}

export function SpotlightSearch({ isOpen, onClose }: SpotlightSearchProps) {
  const { getColor, getFont } = useStyles();
  const { openApp } = useAppStore();
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: streams = [] } = useQuery<StreamWithFlows[]>({
    queryKey: ["streams"],
    queryFn: async () => {
      const response = await axios.get("/api/streams");
      return response.data ?? [];
    },
    enabled: showResults,
  });

  const { data: mediaItems = [] } = useQuery<MediaItem[]>({
    queryKey: ["mediaItems"],
    queryFn: async () => {
      const response = await axios.get("/api/media");
      return response.data ?? [];
    },
    enabled: showResults,
  });

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (value && !showResults) {
      setShowResults(true);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setShowResults(false);
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMediaItems = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allFlows = streams.flatMap((stream) => stream.flows);
  const filteredFlows = allFlows.filter((flow) =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemSelect = (type: "stream" | "flow" | "media", item: any) => {
    onClose();

    if (type === "flow") {
      openApp({
        id: "flow",
        name: "Flow",
        icon: "flow-icon",
        dockPosition: 1,
        animationType: "magnify",
        isMinimized: false,
      });
    } else if (type === "stream") {
      openApp({
        id: "flow",
        name: "Flow",
        icon: "flow-icon",
        dockPosition: 1,
        animationType: "magnify",
        isMinimized: false,
      });
    } else if (type === "media") {
      openApp({
        id: "stellar",
        name: "Stellar",
        icon: "stellar-icon",
        dockPosition: 2,
        animationType: "grow",
        isMinimized: false,
      });
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command
        className="bg-red-500 bg-opacity-0"
        style={{
          backdropFilter: "blur(8px)",
          borderColor: "rgba(255, 255, 255, 0.10)",
          borderWidth: "0.6px",
          fontFamily: getFont("Text Primary"),
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <CommandInput
          placeholder="Search flows, streams and media..."
          value={searchQuery}
          onValueChange={handleInputChange}
          className="h-14 bg-transparent px-3 text-white/70 placeholder:text-white/40 border-none"
        />
        <CommandList className="max-h-[400px] overflow-y-auto scrollbar-none bg-transparent">
          <CommandEmpty className="py-6 text-sm text-white/40">
            No results found.
          </CommandEmpty>

          {filteredStreams.length > 0 && (
            <CommandGroup
              heading="Streams"
              className="px-2 text-sm text-white/40"
            >
              {filteredStreams.map((stream) => (
                <CommandItem
                  key={stream.id}
                  className="flex items-center gap-2 rounded-md px-2 py-3 hover:bg-white/5 cursor-pointer"
                  onSelect={() => handleItemSelect("stream", stream)}
                >
                  <Image
                    src="/icns/_folder.png"
                    alt={stream.name}
                    width={16}
                    height={16}
                    className="opacity-70"
                  />
                  <span style={{ color: getColor("Text Primary (Hd)") }}>
                    {stream.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredFlows.length > 0 && (
            <CommandGroup
              heading="Flows"
              className="px-2"
              style={{
                color: getColor("Text Secondary (Bd)"),
              }}
            >
              {filteredFlows.map((flow) => (
                <CommandItem
                  key={flow.id}
                  className="flex items-center gap-2 rounded-md px-2 py-3 hover:bg-white/5 cursor-pointer"
                  onSelect={() => handleItemSelect("flow", flow)}
                >
                  <Image
                    src="/icns/_flow.png"
                    alt={flow.name}
                    width={16}
                    height={16}
                    className="opacity-70"
                  />
                  <span style={{ color: getColor("Text Primary (Hd)") }}>
                    {flow.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredMediaItems.length > 0 && (
            <CommandGroup
              heading="Media"
              className="px-2"
              style={{
                color: getColor("Text Secondary (Bd)"),
              }}
            >
              {filteredMediaItems.map((item) => (
                <CommandItem
                  key={item.id}
                  className="flex items-center gap-2 rounded-md px-2 py-3 hover:bg-white/5 cursor-pointer"
                  onSelect={() => handleItemSelect("media", item)}
                >
                  {item.type === "IMAGE" ? (
                    <div className="w-8 h-8 rounded overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Image
                      src={
                        item.type === "VIDEO"
                          ? "/icns/_video.png"
                          : "/icns/_font.png"
                      }
                      alt={item.type.toLowerCase()}
                      width={16}
                      height={16}
                      className="opacity-70"
                    />
                  )}
                  <span style={{ color: getColor("Text Primary (Hd)") }}>
                    {item.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
