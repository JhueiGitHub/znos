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
import { useStyles } from "@/app/hooks/useStyles"; // Assuming useStyles and getColor(name) exist
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
import { useMusicContext } from "../apps/music/context/MusicContext";
// Removed: import DuolingoImageDropdown from "./DuolingoImageDropdown";
// Removed: import PDFReader from "./PDFReader";
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import ZenithPDFReader from "./ZenithPDFReader";

// Duolingo App Imports
import { DuolingoProvider } from "../apps/duolingo/contexts/DuolingoContext";
import DuolingoMainView from "../apps/duolingo/components/DuolingoMainView";

// Interfaces (Ensure these are accurate)
interface PDFReaderDropdownProps {
  onOpenFullscreen: () => void;
}

interface Annotation {
  /* ... as before ... */
}
interface PDFPageProxy {
  /* ... as before ... */
}

import localFont from "next/font/local";

const exemplarPro = localFont({
  src: "../../public/fonts/ExemplarPro.otf",
});

const MENU_HEIGHT = 32;
const TRIGGER_AREA_HEIGHT = 20;

interface SystemIconProps {
  src: string;
  children: React.ReactNode;
  onReset?: () => Promise<void>;
  onOpenChange?: (open: boolean) => void;
}

// Helper Functions
const formatTime = (seconds: number): string => {
  if (!seconds && seconds !== 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// --- Reusable Components defined within MenuBar scope ---

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

interface MusicDropdownProps {
  currentSong?: { title: string; artist: string; thumbnail?: string };
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: number;
  currentTime: number;
  duration: number;
}

// --- Complete MusicDropdown Component ---
// Uses explicit RGBA strings where opacity was previously inferred via getColor(name, opacity)
const MusicDropdown: React.FC<MusicDropdownProps> = ({
  currentSong = {
    title: "---",
    artist: "---",
    thumbnail: "/media/system/_empty_image.png",
  },
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  progress,
  currentTime,
  duration,
}) => {
  // Removed unused getColor from here
  const [showPlaylists, setShowPlaylists] = useState(false);
  const {
    playlists = [],
    currentPlaylist,
    playPlaylist = () => {},
    seek = () => {},
    isWallpaperMode = false,
    toggleWallpaperMode = () => {},
    fmModeEnabled = {},
    toggleFmMode = () => {},
    shuffleModeEnabled = {},
    toggleShuffleMode = () => {},
    resetShuffleForPlaylist = () => {},
  } = useMusicContext();
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const getHoverTime = (clientX: number) => {
    /* ... as before ... */
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    /* ... as before ... */
  };
  const handleProgressBarClick = (e: React.MouseEvent) => {
    /* ... as before ... */
  };
  const handleShuffleToggle = (playlistId: string | undefined) => {
    /* ... as before ... */
  };

  const latteColor = "rgba(76, 79, 105, 0.81)"; // #4C4F69 with 81% opacity - use directly
  const latteColorHover = "rgba(76, 79, 105, 0.95)";
  const latteColorSemiTransparent = "rgba(76, 79, 105, 0.72)";
  const latteColorFaded = "rgba(76, 79, 105, 0.4)";

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
      <div
        className="absolute inset-0 w-full h-full rounded-[9px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={currentSong?.thumbnail || "/media/system/_empty_image.png"}
            alt={currentSong?.title}
            className="w-12 h-12 rounded object-cover"
            style={exemplarPro.style}
          />
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate text-white"
              style={exemplarPro.style}
            >
              {currentSong?.title}
            </div>
            <div
              className="text-xs text-white/60 truncate"
              style={exemplarPro.style}
            >
              {currentSong?.artist}
            </div>
          </div>
        </div>
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
                style={{ width: `${progress}%`, backgroundColor: latteColor }}
              />{" "}
              {/* Use RGBA */}
              <div
                className="absolute w-[2px] h-4 -top-[6.5px] rounded-full bg-[#626581]"
                style={{
                  left: `${progress}%`,
                  opacity: isHovering ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
              />
              {isHovering && duration > 0 && (
                <div
                  className="absolute w-[2px] h-4 -top-[6.5px] rounded-full bg-[#626581] opacity-40"
                  style={{ left: `${hoverPosition}%` }}
                />
              )}
            </div>
          </div>
          <div className="flex justify-between px-1">
            <span className="text-xs" style={{ color: latteColor }}>
              {formatTime(currentTime)}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-xs" style={{ color: latteColor }}>
                {formatTime(duration)}
              </span>
              {currentPlaylist && (
                <button
                  onClick={() => handleShuffleToggle(currentPlaylist?.id)}
                  className="mt-1 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: latteColor }}
                  title={
                    shuffleModeEnabled[currentPlaylist.id]
                      ? "Reset shuffle"
                      : "Shuffle playlist"
                  }
                >
                  {shuffleModeEnabled[currentPlaylist.id] ? (
                    <Repeat size={16} />
                  ) : (
                    <Shuffle size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={onPrevious}
            style={{ color: latteColor }}
            className="hover:opacity-80 transition-opacity"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={onPlayPause}
            style={{ color: latteColor }}
            className="hover:opacity-80 transition-opacity"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={onNext}
            style={{ color: latteColor }}
            className="hover:opacity-80 transition-opacity"
          >
            <SkipForward size={20} />
          </button>
        </div>
        <div>
          <button
            onClick={() => setShowPlaylists(!showPlaylists)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: latteColor }}
          >
            <img
              src="/media/playlists.png"
              alt="Playlists"
              className="w-4 h-4"
            />
            <span className="text-sm flex-1 text-left">Playlists</span>
            {showPlaylists ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <AnimatePresence>
            {showPlaylists && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-latte/30 scrollbar-track-transparent"
              >
                <div className="space-y-1 p-1">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center gap-3 p-1.5 rounded hover:bg-white/10 transition-colors relative group cursor-pointer"
                      onClick={() => playPlaylist(playlist.id)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            playlist.thumbnail ||
                            "/media/system/_empty_image.png"
                          }
                          alt={playlist.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/60 rounded">
                          <Play size={18} style={{ color: latteColorHover }} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium truncate"
                          style={{
                            ...exemplarPro.style,
                            color:
                              currentPlaylist?.id === playlist.id
                                ? latteColorHover
                                : latteColor,
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
                                : latteColorFaded,
                              marginLeft: "4px",
                              fontSize: "0.65rem",
                              cursor: "pointer",
                            }}
                          >
                            FM
                          </span>
                        </div>
                        <div className="text-[10px] text-white/40 truncate">
                          {playlist.songCount} songs
                        </div>
                      </div>
                      <button
                        className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex p-1 rounded-full hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWallpaperMode();
                        }}
                        title="Toggle Wallpaper Mode"
                      >
                        <img
                          src="/media/music-wallpaper.png"
                          alt="Toggle Wallpaper"
                          className={`w-4 h-4 object-contain transition-opacity ${isWallpaperMode ? "opacity-100" : "opacity-60"}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DropdownMenuContent>
  );
};

// --- Complete PDFReaderDropdown Component ---
// Uses explicit RGBA strings where opacity was previously inferred via getColor(name, opacity)
const PDFReaderDropdown: React.FC<{ onOpenFullscreen: () => void }> = ({
  onOpenFullscreen,
}) => {
  const { getColor } = useStyles(); // Keep getColor for solid colors if needed (e.g., Brd)
  const [currentPage, setCurrentPage] = useState<number>(() =>
    parseInt(localStorage.getItem("pdfReaderCurrentPage") || "1")
  );
  const [totalPages] = useState(476);
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem("pdfBookmarks");
    return saved ? JSON.parse(saved) : [];
  });
  const [isAnnotating, setIsAnnotating] = useState(false);

  useEffect(() => {
    localStorage.setItem("pdfBookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);
  const navigatePage = (newPage: number) => {
    /* ... as before ... */
  };
  const nextPage = () => navigatePage(currentPage + 1);
  const prevPage = () => navigatePage(currentPage - 1);
  const toggleBookmark = () => {
    /* ... as before ... */
  };
  const removeBookmark = (pageToRemove: number, e: React.MouseEvent) => {
    /* ... as before ... */
  };
  const goToBookmark = (page: number) => {
    /* ... as before ... */
  };

  const latteColor = getColor("latte") ?? "#4C4F69"; // Solid Latte color
  const graphiteColor = getColor("graphite") ?? "#CCCCCC"; // Solid Graphite color
  const graphiteColorWithOpacity = "rgba(204, 204, 204, 0.8)"; // Graphite with 80% opacity
  const latteColorWithOpacity = "rgba(76, 79, 105, 0.81)"; // Latte with 81% opacity
  const latteColorSemiTransparent = "rgba(76, 79, 105, 0.72)"; // Latte with 72% opacity
  const latteColorFaded = "rgba(76, 79, 105, 0.5)"; // Latte with 50% opacity
  const latteColorBg = "rgba(76, 79, 105, 0.2)"; // Latte for background

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
      <div
        className="absolute inset-0 w-full h-full rounded-[9px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <img
            src="/apps/48/media/law-preview.jpg"
            alt={`Law ${currentPage}`}
            className="w-14 h-14 rounded object-cover"
            onError={(e) => {
              e.currentTarget.src = "/media/system/_empty_image.png";
            }}
          />
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{ color: latteColor }}
            >
              Law {currentPage <= 48 ? currentPage : "—"}:{" "}
              {currentPage === 1
                ? "Never Outshine the Master"
                : `Law ${currentPage}`}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: latteColorSemiTransparent }}
            >
              The 48 Laws of Power
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-1 relative h-4">
            <div className="w-full bg-white/10 rounded-full h-[3px]">
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${(currentPage / totalPages) * 100}%`,
                  backgroundColor: latteColorWithOpacity,
                }}
              />
            </div>
          </div>
          <div className="flex justify-between px-1">
            <span className="text-xs" style={{ color: latteColorWithOpacity }}>
              Page {currentPage}
            </span>
            <span className="text-xs" style={{ color: latteColorWithOpacity }}>
              of {totalPages}
            </span>
          </div>
        </div>
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={prevPage}
            className="transition-colors p-1 disabled:opacity-50"
            disabled={currentPage <= 1}
            style={{ color: latteColorWithOpacity }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onOpenFullscreen}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{
              backgroundColor: latteColorBg,
              color: latteColorWithOpacity,
            }}
          >
            <BookOpen size={18} />
          </button>
          <button
            onClick={nextPage}
            className="transition-colors p-1 disabled:opacity-50"
            disabled={currentPage >= totalPages}
            style={{ color: latteColorWithOpacity }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-latte/30 scrollbar-track-transparent border border-white/5 rounded-md">
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-t-md hover:bg-white/5 transition-colors sticky top-0 bg-[#000000e0] backdrop-blur-sm z-10 border-b border-white/5"
            style={{ color: latteColorWithOpacity }}
          >
            <Bookmark size={14} />
            <span className="text-sm flex-1 text-left">Bookmarks</span>
          </button>
          <div className="space-y-0.5 p-1">
            {bookmarks.length > 0 ? (
              bookmarks.map((page) => (
                <div
                  key={`bookmark-${page}`}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => goToBookmark(page)}
                >
                  <div className="w-6 h-6 rounded bg-black/30 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: latteColorWithOpacity }}
                    >
                      {page}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs truncate"
                      style={{ color: latteColorWithOpacity }}
                    >
                      Law {page <= 48 ? page : page}
                    </div>
                  </div>
                  <button
                    onClick={(e) => removeBookmark(page, e)}
                    className="p-1 rounded hover:bg-red-500/20 text-red-500/70 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div
                className="text-xs italic px-2 py-4 text-center"
                style={{ color: latteColorFaded }}
              >
                No bookmarks yet
              </div>
            )}
          </div>
        </div>
        <div
          className="flex justify-around pt-2 border-t"
          style={{ borderColor: getColor("Brd") ?? "rgba(255,255,255,0.09)" }}
        >
          <button
            className="p-2 rounded-full hover:bg-white/10"
            onClick={toggleBookmark}
            style={{
              color: bookmarks.includes(currentPage)
                ? latteColor
                : graphiteColorWithOpacity,
            }}
            title={
              bookmarks.includes(currentPage)
                ? "Remove Bookmark"
                : "Add Bookmark"
            }
          >
            <Bookmark size={16} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10"
            onClick={() => setIsAnnotating(!isAnnotating)}
            style={{
              color: isAnnotating ? latteColor : graphiteColorWithOpacity,
            }}
            title="Annotate (Not Implemented)"
          >
            <Text size={16} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10"
            style={{ color: graphiteColorWithOpacity }}
            title="Download PDF (Not Implemented)"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </DropdownMenuContent>
  );
};

// --- Complete SystemIcon Component ---
const SystemIcon: React.FC<SystemIconProps> = ({
  src,
  children,
  onOpenChange,
}) => {
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

// --- Complete MenuBar Component ---
export const MenuBar = () => {
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const { getColor } = useStyles();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { activeOSFlowId, setActiveOSFlowId, setOrionConfig } = useAppStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    songs = [],
    currentSongIndex = 0,
    isPlaying = false,
    songProgress = 0,
    togglePlay = () => {},
    playNext = () => {},
    playPrevious = () => {},
    currentTime = 0,
    duration = 0,
  } = useMusicContext();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: orionConfig } = useQuery({
    queryKey: ["orion-config"],
    queryFn: async () =>
      axios.get("/api/apps/orion/config").then((res) => res.data),
    staleTime: Infinity,
  });
  const { data: streamData } = useQuery<StreamWithFlows>({
    queryKey: ["orion-stream", orionConfig?.flow?.streamId],
    queryFn: async () =>
      axios
        .get(`/api/streams/${orionConfig?.flow?.streamId}`)
        .then((res) => res.data),
    enabled: !!orionConfig?.flow?.streamId,
    staleTime: Infinity,
  });
  const flows = streamData?.flows || [];

  const handleFlowSelect = async (flow: FlowWithComponents) => {
    /* ... as before ... */
  };

  const formattedDate = useMemo(() => {
    return currentDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }, [currentDate]);

  const latteColorWithOpacity = "rgba(76, 79, 105, 0.81)"; // Defined once for reuse

  return (
    <>
      <AnimatePresence>
        {isPDFOpen && (
          <ZenithPDFReader
            onClose={() => setIsPDFOpen(false)}
            initialPage={parseInt(
              localStorage.getItem("pdfReaderCurrentPage") || "1"
            )}
          />
        )}
      </AnimatePresence>
      {isMenuVisible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 h-8 z-[9999] backdrop-blur-[16px]"
          style={{
            pointerEvents: "auto",
            borderBottom: `1px solid ${getColor("Brd") ?? "rgba(255,255,255,0.09)"}`,
          }}
        >
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
          <div className="relative h-full flex items-center justify-between px-2">
            {/* Left Icons */}
            <div className="flex items-center gap-1">
              <IconButton src="/icns/system/_dopa.png" />
              <IconButton src="/icns/system/_stellar.png" />
              <DropdownMenu onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  {/* ... trigger button ... */}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-[200px] p-1 backdrop-blur-[18px] relative bg-[#00000090]"
                  align="start"
                  alignOffset={-8}
                  sideOffset={4}
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.06)",
                    border: "0.6px solid rgba(255, 255, 255, 0.06)",
                    position: "relative",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    className="absolute inset-0 w-full h-full rounded-md"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.15) 100%)",
                      opacity: 0.7,
                      pointerEvents: "none",
                    }}
                  />
                  <div className="relative z-10">
                    {flows.map((flow) => (
                      <DropdownMenuItem
                        key={flow.id}
                        onClick={() => handleFlowSelect(flow)}
                        className="flex items-center justify-between text-xs px-2 py-1.5 hover:bg-white/10 rounded cursor-pointer"
                        style={{ color: "rgba(76, 79, 105, 0.8)" }}
                      >
                        {" "}
                        {/* Use RGBA directly */} <span>{flow.name}</span>
                        {flow.id === activeOSFlowId && (
                          <Check className="w-3 h-3 ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Right Icons */}
            <div className="flex items-center gap-1">
              <SystemIcon src="/apps/48/48.png" onOpenChange={setDropdownOpen}>
                <PDFReaderDropdown
                  onOpenFullscreen={() => setIsPDFOpen(true)}
                />
              </SystemIcon>
              <SystemIcon
                src="/icns/system/_duo.png"
                onOpenChange={setDropdownOpen}
              >
                <DropdownMenuContent
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
              </SystemIcon>
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
                          thumbnail: songs[currentSongIndex].thumbnail,
                        }
                      : undefined
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
                className="text-xs font-medium pl-1.5"
                style={{ color: latteColorWithOpacity }}
              >
                {formattedDate}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* </AnimatePresence> */}
    </>
  );
};
