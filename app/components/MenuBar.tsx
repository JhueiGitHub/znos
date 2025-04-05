// /root/app/components/MenuBar.tsx
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
  Shuffle,
  RotateCcw,
  Repeat,
  ChevronLeft,
  BookOpen,
  Bookmark,
  Text,
  Download,
  Menu,
  X,
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
// Original baseline imports
import { useMusicContext } from "../apps/music/context/MusicContext";
// REMOVED: import DuolingoImageDropdown from "./DuolingoImageDropdown";
import PDFReader from "./PDFReader";
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import ZenithPDFReader from "./ZenithPDFReader";

// *** ADDED: New Duolingo App Imports ***
import { DuolingoProvider } from "../apps/duolingo/contexts/DuolingoContext";
import DuolingoMainView from "../apps/duolingo/components/DuolingoMainView";

// Interfaces from the original baseline code
interface PDFReaderDropdownProps {
  onOpenFullscreen: () => void;
}

interface Annotation {
  id: string;
  page: number;
  content: string;
  x: number;
  y: number;
  color: string;
}

interface PDFPageProxy {
  getViewport: (options: { scale: number }) => {
    width: number;
    height: number;
  };
  render: (options: any) => { promise: Promise<void> };
}

// Font from the original baseline code
import localFont from "next/font/local";

const exemplarPro = localFont({
  src: "../../public/fonts/ExemplarPro.otf",
});

// Constants from the original baseline code
const MENU_HEIGHT = 32;
const TRIGGER_AREA_HEIGHT = 20;

// Props Interface from the original baseline code
interface SystemIconProps {
  src: string;
  children: React.ReactNode;
  onReset?: () => Promise<void>;
  onOpenChange?: (open: boolean) => void;
}

// Helper Function from the original baseline code
const formatTime = (seconds: number): string => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// IconButton Component from the original baseline code
const IconButton: React.FC<{ src: string; onClick?: () => void }> = ({
  src,
  onClick,
}) => {
  return (
    <motion.button
      className="relative p-2 rounded-md flex items-center justify-center hover:bg-white/5"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
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
  );
};

// MusicDropdown Interface from the original baseline code
interface MusicDropdownProps {
  currentSong?: {
    title: string;
    artist: string;
    thumbnail?: string; // Thumbnail is optional in the prop type
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: number;
  currentTime: number;
  duration: number;
}

// MusicDropdown Component EXACTLY from the original baseline code ("OKAY NO THIS MENU BAR;")
// Including the lack of chevron on the playlist button and the internal thumbnail fallback logic
const MusicDropdown: React.FC<MusicDropdownProps> = ({
  currentSong = { title: "song1", artist: "Unknown Artist" }, // Original default prop value
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
    shuffleModeEnabled,
    toggleShuffleMode,
    resetShuffleForPlaylist,
  } = useMusicContext(); // Assuming context provides these
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const getHoverTime = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(position * duration, duration));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!progressBarRef.current || duration <= 0) return;
    const hoverTime = getHoverTime(e.clientX);
    setHoverPosition((hoverTime / duration) * 100);
  };

  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (!progressBarRef.current || duration <= 0) return;
    const clickTime = getHoverTime(e.clientX);
    seek(clickTime);
  };

  const handleShuffleToggle = (playlistId: string) => {
    // Original baseline logic assumes these exist if currentPlaylist exists
    if (shuffleModeEnabled[playlistId]) {
      resetShuffleForPlaylist(playlistId);
      toggleShuffleMode(playlistId);
    } else {
      toggleShuffleMode(playlistId);
    }
  };

  return (
    <DropdownMenuContent
      className="w-[300px] p-3 space-y-3 backdrop-blur-[18px] relative bg-[#00000090]"
      align="end"
      alignOffset={-3}
      sideOffset={4}
      style={{
        borderColor: "rgba(255, 255, 255, 0.06)",
        border: "0.6px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "9px",
        position: "relative",
      }}
    >
      {/* Light gradient overlay */}
      <div
        className="absolute inset-0 w-full h-full rounded-[9px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      {/* Content wrapper remains the same */}
      <div className="relative z-10 space-y-3">
        {/* Current Song Info */}
        <div className="flex items-center gap-3">
          {/* *** Ensures fallback to empty image if currentSong.thumbnail is missing/undefined *** */}
          <img
            src={currentSong?.thumbnail || "/media/system/_empty_image.png"}
            alt={currentSong?.title || "No song"} // Alt text uses optional chaining too
            className="w-12 h-12 rounded"
            style={exemplarPro.style}
          />
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate text-white"
              style={exemplarPro.style}
            >
              {currentSong?.title || "---"} {/* Fallback text */}
            </div>
            <div
              className="text-xs text-white/60 truncate"
              style={exemplarPro.style}
            >
              {currentSong?.artist || "---"} {/* Fallback text */}
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
            <div className="w-full bg-white/10 rounded-full h-[3px] transition-all relative">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "rgba(76, 79, 105, 0.81)",
                }}
              />
              <div
                className="absolute w-[2px] h-4 -top-[6.5px] rounded-full bg-[#626581] -translate-x-1/2 transition-opacity duration-200"
                style={{
                  left: `${progress}%`,
                  opacity: isHovering ? 1 : 0,
                }}
              />
              {isHovering && duration > 0 && (
                <div
                  className="absolute w-[2px] h-4 -top-[6.5px] rounded-full bg-[#626581] -translate-x-1/2 opacity-40"
                  style={{
                    left: `${hoverPosition}%`,
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex justify-between px-1">
            <span className="text-xs text-[rgba(76,79,105,0.81)]">
              {formatTime(currentTime)}
            </span>
            <div className="flex flex-col items-start">
              {" "}
              {/* Original items-start */}
              <span className="text-xs text-[rgba(76,79,105,0.81)]">
                {formatTime(duration)}
              </span>
              {/* Shuffle Button - Original baseline logic */}
              {currentPlaylist && (
                <button
                  onClick={() => handleShuffleToggle(currentPlaylist.id)}
                  className="mt-[5.7px] ml-[2.1px] opacity-60 hover:opacity-100 transition-opacity" // Original styling
                  style={{ color: "rgba(76, 79, 105, 0.81)" }}
                  title={
                    shuffleModeEnabled[currentPlaylist.id] // Assumes exists
                      ? "Reset shuffle"
                      : "Shuffle playlist"
                  }
                >
                  {shuffleModeEnabled[currentPlaylist.id] ? ( // Assumes exists
                    <Repeat size={18} /> // Original size 18
                  ) : (
                    <Shuffle size={18} /> // Original size 18
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Media Controls */}
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
          {/* *** THIS IS THE BUTTON FROM THE ORIGINAL BASELINE CODE - NO CHEVRON *** */}
          <button
            onClick={() => setShowPlaylists(!showPlaylists)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: "rgba(76, 79, 105, 0.81)" }}
          >
            <img
              src="/media/playlists.png"
              alt="Playlists"
              className="w-4 h-4"
            />
            <span className="text-sm flex-1 text-left">Playlists</span>
            {/* *** NO CHEVRON ICON HERE *** */}
          </button>

          <AnimatePresence>
            {showPlaylists && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden" // Original class
              >
                <div className="space-y-2 pt-2">
                  {" "}
                  {/* Original spacing/padding */}
                  {/* Original baseline mapping logic */}
                  {(playlists || []).map(
                    (
                      playlist // Added || [] for safety mapping undefined
                    ) => (
                      <div
                        key={playlist.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors relative group" // Original classes
                      >
                        {/* Left side with thumbnail and play button */}
                        <div className="relative">
                          <img
                            src={playlist.thumbnail} // Original src
                            alt={playlist.name}
                            className="w-10 h-10 rounded" // Original size
                          />
                          <div
                            className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50 rounded cursor-pointer" // Original overlay
                            onClick={() => playPlaylist(playlist.id)} // Assumes exists
                          >
                            <Play
                              size={20}
                              className="text-white" // Original class
                              style={{
                                color: "rgba(76, 79, 105, 0.81)", // Original color
                              }}
                            />
                          </div>
                        </div>

                        {/* Middle section with playlist info */}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium truncate" // Original classes
                            style={{
                              ...exemplarPro.style,
                              color:
                                currentPlaylist?.id === playlist.id
                                  ? "rgba(76, 79, 105, 0.95)" // Original colors
                                  : "rgba(76, 79, 105, 0.81)",
                            }}
                          >
                            {playlist.name}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFmMode(playlist.id); // Assumes exists
                              }}
                              style={{
                                color: fmModeEnabled[playlist.id] // Assumes exists
                                  ? "inherit"
                                  : "rgba(76, 79, 105, 0.4)", // Original colors
                              }}
                            >
                              FM
                            </span>
                          </div>
                          <div className="text-xs text-white/40 truncate flex items-center justify-between">
                            {" "}
                            {/* Original classes */}
                            <span>{playlist.songCount} songs</span>
                          </div>
                        </div>

                        {/* Right side with wallpaper toggle */}
                        <div
                          className="absolute right-5 hidden group-hover:flex items-center justify-center cursor-pointer" // Original classes
                          onClick={() => toggleWallpaperMode()} // Assumes exists
                          style={{ color: "rgba(76, 79, 105, 0.81)" }} // Original color
                        >
                          <div className="w-[27px] h-[27px] flex items-center justify-center">
                            {" "}
                            {/* Original wrapper */}
                            <img
                              src="/media/music-wallpaper.png"
                              alt="Toggle Wallpaper"
                              className={`w-auto h-auto max-w-full max-h-full object-cover opacity-60 hover:opacity-100 transition-opacity ${
                                isWallpaperMode ? "opacity-100" : ""
                              }`} // Original classes
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DropdownMenuContent>
  );
};

// PDFReaderDropdown Component EXACTLY from the original baseline code ("OKAY NO THIS MENU BAR;")
const PDFReaderDropdown: React.FC<{ onOpenFullscreen: () => void }> = ({
  onOpenFullscreen,
}) => {
  const { getColor } = useStyles();
  const [currentPage, setCurrentPage] = useState<number>(() => {
    // Added safety check for localStorage
    const storedPage =
      typeof window !== "undefined"
        ? localStorage.getItem("pdfReaderCurrentPage")
        : null;
    return parseInt(storedPage || "1");
  });
  const [totalPages] = useState(476);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]); // Original simple state []

  // Navigation functions from original baseline
  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      // Added safety check for localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("pdfReaderCurrentPage", newPage.toString());
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      // Added safety check for localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("pdfReaderCurrentPage", newPage.toString());
      }
    }
  };

  // Original simple toggle logic from baseline
  const toggleBookmark = () => {
    setBookmarks((prev: number[]) => {
      if (prev.includes(currentPage)) {
        return prev.filter((p) => p !== currentPage);
      } else {
        return [...prev, currentPage];
      }
    });
  };

  return (
    <DropdownMenuContent
      className="w-[350px] p-3 space-y-3 backdrop-blur-[18px] relative bg-[#00000090]"
      align="end"
      alignOffset={-3}
      sideOffset={4}
      style={{
        borderColor: "rgba(255, 255, 255, 0.06)",
        border: "0.6px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "9px",
        fontFamily: "var(--font-exemplar)",
        position: "relative",
      }}
    >
      {/* Light gradient overlay */}
      <div
        className="absolute inset-0 w-full h-full rounded-[9px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 space-y-3">
        {/* PDF Preview */}
        <div className="flex items-center gap-3">
          <img
            src="/apps/48/media/law-preview.jpg"
            alt={`Law ${currentPage}`}
            className="w-14 h-14 rounded"
            onError={(e) => {
              e.currentTarget.src = "/media/system/_empty_image.png";
            }}
          />
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{ color: getColor("latte") }}
            >
              Law {currentPage <= 48 ? currentPage : "—"}:{" "}
              {currentPage === 1
                ? "Never Outshine the Master"
                : `Law ${currentPage}`}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "rgba(76, 79, 105, 0.72)" }}
            >
              The 48 Laws of Power
            </div>
          </div>
        </div>

        {/* Page Navigation Bar */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-1 relative h-4">
            <div className="w-full bg-white/10 rounded-full h-[3px]">
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${(currentPage / totalPages) * 100}%`,
                  backgroundColor: "rgba(76, 79, 105, 0.81)",
                }}
              />
            </div>
          </div>
          <div className="flex justify-between px-1">
            <span
              className="text-xs"
              style={{ color: "rgba(76, 79, 105, 0.81)" }}
            >
              Page {currentPage}
            </span>
            <span
              className="text-xs"
              style={{ color: "rgba(76, 79, 105, 0.81)" }}
            >
              of {totalPages}
            </span>
          </div>
        </div>

        {/* Law Navigation Controls */}
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={prevPage}
            className="transition-colors"
            style={{ color: "rgba(76, 79, 105, 0.81)" }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={onOpenFullscreen}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" // Original size
            style={{
              backgroundColor: "rgba(76, 79, 105, 0.2)",
              color: "rgba(76, 79, 105, 0.81)",
            }}
          >
            <BookOpen size={20} />
          </button>

          <button
            onClick={nextPage}
            className="transition-colors"
            style={{ color: "rgba(76, 79, 105, 0.81)" }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Bookmarks Section from original baseline */}
        <div>
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: "rgba(76, 79, 105, 0.81)" }}
          >
            <Bookmark size={14} />
            <span className="text-sm flex-1 text-left">Bookmarks</span>
          </button>

          <div className="space-y-2 pt-2">
            {" "}
            {/* Original structure */}
            {bookmarks.length > 0 ? (
              bookmarks.map((page) => (
                <div
                  key={`bookmark-${page}`}
                  className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors relative" // Original classes
                  onClick={() => setCurrentPage(page)} // Original simple onClick
                >
                  <div className="w-8 h-8 rounded bg-black/30 flex items-center justify-center">
                    {" "}
                    {/* Original div */}
                    <Text // Original icon was Text
                      size={14}
                      style={{ color: "rgba(76, 79, 105, 0.81)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm truncate"
                      style={{ color: "rgba(76, 79, 105, 0.81)" }}
                    >
                      Law {page}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: "rgba(76, 79, 105, 0.5)" }}
                    >
                      Page {page}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="text-sm italic px-2" // Original style
                style={{ color: "rgba(76, 79, 105, 0.5)" }}
              >
                No bookmarks yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions from original baseline */}
        <div
          className="flex justify-around pt-2 border-t"
          style={{ borderColor: getColor("Brd") }}
        >
          <button
            className="p-2 rounded-full hover:bg-white/5"
            onClick={toggleBookmark}
            style={{
              color: bookmarks.includes(currentPage)
                ? "#FFD700" // Original color logic
                : "rgba(76, 79, 105, 0.81)",
            }}
          >
            <Bookmark size={18} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/5"
            onClick={() => setIsAnnotating(!isAnnotating)}
            style={{
              color: isAnnotating
                ? "#7B6CBD" // Original color logic
                : "rgba(76, 79, 105, 0.81)",
            }}
          >
            <Text size={18} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/5"
            style={{ color: "rgba(76, 79, 105, 0.81)" }}
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </DropdownMenuContent>
  );
};

// SystemIcon Component EXACTLY from the original baseline code ("OKAY NO THIS MENU BAR;")
const SystemIcon: React.FC<SystemIconProps> = ({
  src,
  children,
  onOpenChange,
}) => {
  const { getColor } = useStyles(); // Original had getColor here

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

// MenuBar Component Structure EXACTLY from the original baseline code ("OKAY NO THIS MENU BAR;")
export const MenuBar = () => {
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const { getColor } = useStyles();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { activeOSFlowId, setActiveOSFlowId, setOrionConfig } = useAppStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Music Context hook usage from original baseline - NO || {}
  const {
    songs,
    currentSongIndex,
    isPlaying,
    songProgress, // Original name
    togglePlay,
    playNext,
    playPrevious,
    currentTime,
    duration,
  } = useMusicContext();

  // current song info derivation EXACTLY from original baseline
  // Passes undefined or { title, artist } ONLY to MusicDropdown prop
  const currentSongData = songs?.[currentSongIndex];
  const currentSongForProp = currentSongData
    ? {
        title: currentSongData.title,
        artist: currentSongData.artist,
        // NO thumbnail passed here explicitly, matching original baseline
      }
    : undefined;

  // useEffect for date from original baseline
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // useEffect for mouse move visibility from original baseline
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

    // Added check for window safety
    if (typeof window !== "undefined") {
      document.addEventListener("mousemove", handleMouseMove);
      return () => document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [dropdownOpen]);

  // reset mutation from original baseline
  const resetAllData = useMutation({
    mutationFn: async () => {
      const [obsidianRes, loomRes] = await Promise.all([
        axios.post("/api/profile/reset-obsidian"),
        axios.post("/api/profile/reset-loom"),
      ]);
      return { obsidian: obsidianRes.data, loom: loomRes.data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-folders"] });
      queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      toast.success("Successfully reset all app data");
    },
    onError: () => {
      toast.error("Failed to reset app data");
    },
  });

  // Queries from original baseline
  const { data: orionConfig } = useQuery({
    queryKey: ["orion-config"],
    queryFn: async () => {
      const response = await axios.get("/api/apps/orion/config");
      return response.data;
    },
    staleTime: 0,
  });

  const { data: streamData } = useQuery<StreamWithFlows>({
    queryKey: ["orion-stream", orionConfig?.flow?.streamId],
    queryFn: async () => {
      // Added check from original
      if (!orionConfig?.flow?.streamId) return null;
      const response = await axios.get(
        `/api/streams/${orionConfig.flow.streamId}`
      );
      return response.data;
    },
    enabled: !!orionConfig?.flow?.streamId,
    staleTime: 0,
  });

  const flows = streamData?.flows || [];

  // flow selection handler from original baseline
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
            tokenId: cursor.tokenId || undefined,
            outlineTokenId: cursor.outlineTokenId || undefined,
          }
        : undefined,
      dockIcons,
    });
  };

  // date formatting from original baseline
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

  // Color variable defined as in original
  const latteColorWithOpacity = "rgba(76, 79, 105, 0.81)";

  return (
    <>
      <AnimatePresence>
        {isPDFOpen && (
          <ZenithPDFReader
            onClose={() => setIsPDFOpen(false)}
            initialPage={parseInt(
              // Added check for window safety
              (typeof window !== "undefined"
                ? localStorage.getItem("pdfReaderCurrentPage")
                : null) || "1"
            )}
          />
        )}
      </AnimatePresence>
      {/* Trigger area div from original baseline */}
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
            className="fixed top-0 left-0 right-0 h-8 z-[9999] backdrop-blur-[16px]"
            style={{
              pointerEvents: "auto",
              borderBottom: `1px solid rgba(255, 255, 255, 0.06)`, // Original border style
            }}
          >
            {/* Layers from original baseline */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
                opacity: 0.7,
                pointerEvents: "none",
              }}
            />
            <div
              className="absolute inset-0 w-full h-full mix-blend-overlay opacity-[0.03]"
              style={{
                backgroundImage: "url('/noise.png')",
                backgroundRepeat: "repeat",
                pointerEvents: "none",
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.07) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Content container from original baseline */}
            <div className="relative h-full flex items-center justify-between px-2">
              {/* Left Icons section from original baseline */}
              <div className="flex items-center gap-1">
                {" "}
                {/* Original gap 1 */}
                <IconButton src="/icns/system/_dopa.png" />
                <IconButton
                  src="/icns/system/_stellar.png"
                  onClick={() => {}} // Empty handler for now
                />
                {/* Original Orion Dropdown section */}
                <div>
                  {" "}
                  {/* Removed transform div */}
                  <DropdownMenu
                    onOpenChange={(open) => {
                      setDropdownOpen(open);
                      if (open) {
                        queryClient.invalidateQueries({
                          queryKey: ["orion-config"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: [
                            "orion-stream",
                            orionConfig?.flow?.streamId,
                          ],
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
                    {/* *** ENSURING ORION DROPDOWN STYLES MATCH BASELINE *** */}
                    <DropdownMenuContent
                      className="min-w-[200px] p-1 backdrop-blur-[18px] relative bg-[#00000090]" // Original min-w-[200px]
                      align="start"
                      alignOffset={-8} // Original offset -8
                      sideOffset={4}
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.06)",
                        border: "0.6px solid rgba(255, 255, 255, 0.06)",
                        position: "relative",
                        borderRadius: "6px", // Original radius 6px
                      }}
                    >
                      {/* Light gradient overlay */}
                      <div
                        className="absolute inset-0 w-full h-full rounded-md"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
                          opacity: 0.7,
                          pointerEvents: "none",
                        }}
                      />
                      {/* Content - needs z-index to appear above layers */}
                      <div className="relative z-10">
                        {/* Original flow mapping */}
                        {flows.map((flow) => (
                          <DropdownMenuItem
                            key={flow.id}
                            onClick={() => handleFlowSelect(flow)}
                            // Original flow item styles
                            className="flex items-center justify-between text-xs px-2 py-1.5 hover:bg-white/10 rounded cursor-pointer"
                            style={{ color: latteColorWithOpacity }} // Use variable
                          >
                            <span>{flow.name}</span>
                            {flow.id === activeOSFlowId && (
                              <Check className="w-3 h-3 ml-2" /> // Original size 3x3
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Right Icons section from original baseline */}
              <div className="flex items-center gap-1">
                {" "}
                {/* Original gap 1 */}
                <SystemIcon
                  src="/apps/48/48.png"
                  onOpenChange={setDropdownOpen}
                >
                  <PDFReaderDropdown
                    onOpenFullscreen={() => setIsPDFOpen(true)}
                  />
                </SystemIcon>
                {/* --- *** TARGET DUOLINGO ICON *** --- */}
                <SystemIcon
                  src="/icns/system/_duo.png"
                  onOpenChange={setDropdownOpen}
                >
                  {/* --- *** START REPLACEMENT *** --- */}
                  <DropdownMenuContent
                    // Styles from the working Duolingo example (first prompt, first code block)
                    className="p-0 overflow-hidden backdrop-blur-[18px] relative bg-[#000000cc]"
                    align="end"
                    alignOffset={-3}
                    sideOffset={4}
                    style={{
                      width: "178px",
                      height: "443px",
                      borderColor: "rgba(255, 255, 255, 0.06)",
                      border: "0.6px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "9px",
                    }}
                    onFocusOutside={(e) => e.preventDefault()}
                  >
                    <div className="relative z-10 w-full h-full">
                      <DuolingoProvider>
                        <DuolingoMainView />
                      </DuolingoProvider>
                    </div>
                  </DropdownMenuContent>
                  {/* --- *** END REPLACEMENT *** --- */}
                </SystemIcon>
                {/* --- *** END TARGET DUOLINGO ICON *** --- */}
                <SystemIcon
                  src="/icns/system/_play.png"
                  onOpenChange={setDropdownOpen}
                >
                  <MusicDropdown
                    // Pass the prop calculated exactly as in the baseline
                    currentSong={currentSongForProp}
                    isPlaying={isPlaying}
                    onPlayPause={togglePlay}
                    onNext={playNext}
                    onPrevious={playPrevious}
                    progress={songProgress} // Original name 'songProgress'
                    currentTime={currentTime}
                    duration={duration}
                  />
                </SystemIcon>
                <div
                  className="text-xs font-medium pl-1.5" // Original padding
                  style={{ color: latteColorWithOpacity }} // Use variable
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
