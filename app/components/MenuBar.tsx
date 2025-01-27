"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  SkipBack,
} from "lucide-react";
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
// Add this new import
import { useMusicContext } from "../apps/music/context/MusicContext";

const MENU_HEIGHT = 32;
const TRIGGER_AREA_HEIGHT = 20;

interface SystemIconProps {
  src: string;
  children: React.ReactNode;
  onReset?: () => Promise<void>;
  onOpenChange?: (open: boolean) => void; // Add this prop
}

const formatTime = (seconds: number): string => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Update the MusicDropdown interface
interface MusicDropdownProps {
  currentSong?: {
    title: string;
    artist: string;
    thumbnail?: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: number;
  currentTime: number;
  duration: number;
}

const MusicDropdown: React.FC<MusicDropdownProps> = ({
  currentSong = { title: "song1", artist: "Unknown Artist" },
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  progress,
  currentTime,
  duration,
}) => {
  const { getColor } = useStyles();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const {
    playlists,
    currentPlaylist,
    playPlaylist,
    seek,
    isWallpaperMode,
    toggleWallpaperMode,
    fmModeEnabled,
    toggleFmMode,
  } = useMusicContext();
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Calculate hover time for preview
  const getHoverTime = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(position * duration, duration));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!progressBarRef.current) return;
    const hoverTime = getHoverTime(e.clientX);
    setHoverPosition((hoverTime / duration) * 100);
  };

  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (!progressBarRef.current) return;
    const clickTime = getHoverTime(e.clientX);
    seek(clickTime);
  };

  return (
    <DropdownMenuContent
      className="w-[300px] p-3 space-y-3"
      align="end"
      sideOffset={4}
      style={{
        backgroundColor: getColor("black-thick"),
        borderColor: getColor("Brd"),
        borderRadius: "9px",
      }}
    >
      {/* Current Song Info */}
      <div className="flex items-center gap-3">
        <img
          src={currentSong?.thumbnail || "/media/system/_empty_image.png"}
          alt={currentSong.title}
          className="w-12 h-12 rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-white">
            {currentSong.title}
          </div>
          <div className="text-xs text-white/60 truncate">
            {currentSong.artist}
          </div>
        </div>
      </div>

      {/* Progress Bar and Time */}
      <div className="space-y-1">
        <div
          ref={progressBarRef}
          className="flex items-center gap-2 px-1 relative h-4 group cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={handleProgressBarClick}
        >
          {/* Base progress bar background */}
          <div className="w-full bg-white/10 rounded-full h-[3px] transition-all relative">
            {/* Active progress */}
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                backgroundColor: "rgba(76, 79, 105, 0.81)",
              }}
            />

            {/* Current position marker - positioned above the progress bar */}
            <div
              className="absolute w-[2px] h-4 -top-[6.5px] rounded-full bg-[#626581] -translate-x-1/2 transition-opacity duration-200"
              style={{
                left: `${progress}%`,
                opacity: isHovering ? 1 : 0,
              }}
            />

            {/* Hover position marker - positioned above the progress bar */}
            {isHovering && (
              <div
                className="absolute w-[2px] h-4 -top-[6.5px] rounded-full bg-[#626581] -translate-x-1/2 opacity-40"
                style={{
                  left: `${hoverPosition}%`,
                }}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between px-1 text-xs text-[rgba(76,79,105,0.81)]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Rest of the component stays the same */}
      <div className="flex justify-center items-center gap-6">
        <button
          onClick={onPrevious}
          className="text-[rgba(76,79,105,0.81)] hover:text-[rgba(76,79,105,0.95)] transition-colors"
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={onPlayPause}
          className="text-[rgba(76,79,105,0.81)] hover:text-[rgba(76,79,105,0.95)] transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={onNext}
          className="text-[rgba(76,79,105,0.81)] hover:text-[rgba(76,79,105,0.95)] transition-colors"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Playlists Section */}
      <div>
        <button
          onClick={() => setShowPlaylists(!showPlaylists)}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
          style={{ color: "rgba(76, 79, 105, 0.81)" }}
        >
          <img src="/media/playlists.png" alt="Playlists" className="w-4 h-4" />
          <span className="text-sm flex-1 text-left">Playlists</span>
        </button>

        <AnimatePresence>
          {showPlaylists && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors relative group"
                  >
                    {/* Left side with thumbnail and play button */}
                    <div className="relative">
                      <img
                        src={playlist.thumbnail}
                        alt={playlist.name}
                        className="w-10 h-10 rounded"
                      />
                      <div
                        className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50 rounded cursor-pointer"
                        onClick={() => playPlaylist(playlist.id)}
                      >
                        <Play
                          size={20}
                          className="text-white"
                          style={{
                            color: "rgba(76, 79, 105, 0.81)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Middle section with playlist info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{
                          color:
                            currentPlaylist?.id === playlist.id
                              ? "rgba(76, 79, 105, 0.95)"
                              : "rgba(76, 79, 105, 0.81)",
                        }}
                      >
                        {playlist.name}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFmMode(playlist.id);
                          }}
                          style={{
                            color: fmModeEnabled[playlist.id]
                              ? "inherit"
                              : "rgba(76, 79, 105, 0.4)",
                          }}
                        >
                          FM
                        </span>
                      </div>
                      <div className="text-xs text-white/40 truncate">
                        {playlist.songCount} songs
                      </div>
                    </div>

                    {/* Right side with wallpaper toggle */}
                    <div
                      className="absolute right-5 hidden group-hover:flex items-center justify-center cursor-pointer"
                      onClick={() => toggleWallpaperMode()}
                      style={{ color: "rgba(76, 79, 105, 0.81)" }}
                    >
                      <div className="w-[27px] h-[27px] flex items-center justify-center">
                        <img
                          src="/media/music-wallpaper.png"
                          alt="Toggle Wallpaper"
                          className={`w-auto h-auto max-w-full max-h-full object-cover opacity-60 hover:opacity-100 transition-opacity ${
                            isWallpaperMode ? "opacity-100" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DropdownMenuContent>
  );
};

const SystemIcon: React.FC<SystemIconProps> = ({
  src,
  children,
  onOpenChange,
}) => {
  const { getColor } = useStyles();

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
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
  const { getColor } = useStyles();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { activeOSFlowId, setActiveOSFlowId, setOrionConfig } = useAppStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Remove these local states since they come from context
  // const [currentSong, setCurrentSong] = useState<{title: string; artist: string} | undefined>();
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [progress, setProgress] = useState(0);

  // Get everything from context instead
  const {
    songs,
    currentSongIndex,
    isPlaying,
    songProgress, // MUST match the context property name exactly
    togglePlay,
    playNext,
    playPrevious,
    currentTime, // Add this line to get currentTime from context
    duration, // Ensure duration is also obtained from context
  } = useMusicContext();

  // Get current song info
  const currentSong = songs[currentSongIndex]
    ? {
        title: songs[currentSongIndex].title,
        artist: songs[currentSongIndex].artist,
      }
    : undefined;

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const resetAllData = useMutation({
    mutationFn: async () => {
      // Execute both resets in parallel
      const [obsidianRes, loomRes] = await Promise.all([
        axios.post("/api/profile/reset-obsidian"),
        axios.post("/api/profile/reset-loom"),
      ]);

      return {
        obsidian: obsidianRes.data,
        loom: loomRes.data,
      };
    },
    onSuccess: () => {
      // Invalidate queries for both apps
      queryClient.invalidateQueries({ queryKey: ["vault-folders"] });
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      toast.success("Successfully reset all app data");
    },
    onError: () => {
      toast.error("Failed to reset app data");
    },
  });

  // PRESERVED: Original queries
  const { data: orionConfig } = useQuery({
    queryKey: ["orion-config"],
    queryFn: async () => {
      const response = await axios.get("/api/apps/orion/config");
      return response.data;
    },
    staleTime: 0, // Ensure fresh data on each query
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
    staleTime: 0, // Ensure fresh data on each query
  });

  const flows = streamData?.flows || [];

  // PRESERVED: Original flow selection handler
  const handleFlowSelect = async (flow: FlowWithComponents) => {
    setActiveOSFlowId(flow.id);

    const wallpaper = flow.components.find(
      (c: FlowComponent) => c.type === "WALLPAPER"
    );
    const cursor = flow.components.find(
      (c: FlowComponent) => c.type === "CURSOR"
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
        outlineMode: c.outlineMode as "color" | "media",
        outlineValue: c.outlineValue || null,
        outlineTokenId: c.outlineTokenId || undefined,
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
      cursor: cursor
        ? {
            // Convert null to undefined to match the OrionConfig type
            tokenId: cursor.tokenId || undefined,
            outlineTokenId: cursor.outlineTokenId || undefined,
          }
        : undefined,
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
                  className="min-w-[280px] p-1"
                  style={{
                    backgroundColor: getColor("black-thick"),
                    borderColor: getColor("Brd"),
                  }}
                >
                  <DropdownMenuItem
                    onClick={() => resetAllData.mutate()}
                    className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer"
                    style={{
                      color: "rgba(76, 79, 105, 0.81)",
                    }}
                  >
                    <span className="text-sm">Reset All App Data</span>
                  </DropdownMenuItem>
                  <div className="px-3 py-2">
                    <span className="text-sm opacity-50">
                      Resets both Obsidian and Loom data
                    </span>
                  </div>
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
                <DropdownMenu
                  onOpenChange={(open) => {
                    setDropdownOpen(open);
                    if (open) {
                      // Refresh both queries when dropdown opens
                      queryClient.invalidateQueries({
                        queryKey: ["orion-config"],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["orion-stream", orionConfig?.flow?.streamId],
                      });
                    }
                  }}
                >
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

            <div className="flex">
              <div className="flex items-center gap-2">
                <SystemIcon
                  src="/icns/system/_play.png"
                  onOpenChange={setDropdownOpen}
                >
                  <MusicDropdown
                    currentSong={
                      songs[currentSongIndex]
                        ? {
                            title: songs[currentSongIndex].title,
                            artist: songs[currentSongIndex].artist,
                          }
                        : { title: "song1", artist: "Unknown Artist" }
                    }
                    isPlaying={isPlaying}
                    onPlayPause={togglePlay}
                    onNext={playNext}
                    onPrevious={playPrevious}
                    progress={songProgress}
                    currentTime={currentTime}
                    duration={duration}
                  />
                </SystemIcon>
                <div
                  className="text-xs font-medium"
                  style={{
                    color: "rgba(76, 79, 105, 0.81)",
                  }}
                >
                  {formattedDate}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
