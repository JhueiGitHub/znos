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
// Add imports
import { useMusicContext } from "../apps/music/context/MusicContext";
import DuolingoImageDropdown from "./DuolingoImageDropdown";
import PDFReader from "./PDFReader";
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFReaderDropdownProps {
  onOpenFullscreen: () => void;
}

interface ZenithPDFReaderProps {
  onClose: () => void;
  initialPage?: number;
}

interface Annotation {
  id: string;
  page: number;
  content: string;
  x: number;
  y: number;
  color: string;
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
  onOpenChange?: (open: boolean) => void; // Add this prop
}

const formatTime = (seconds: number): string => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// First, let's create a simpler IconButton component for the non-dropdown icons
// First, let's create a simpler IconButton component for the non-dropdown icons
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

// This is the complete MusicDropdown component to replace the existing one
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
    // New shuffle-related properties from context
    shuffleModeEnabled,
    toggleShuffleMode,
    resetShuffleForPlaylist,
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

  // Handle toggling shuffle mode or resetting shuffle
  const handleShuffleToggle = (playlistId: string) => {
    if (shuffleModeEnabled[playlistId]) {
      // If shuffle is already enabled, reset it
      resetShuffleForPlaylist(playlistId);
      toggleShuffleMode(playlistId); // Disable shuffle mode
    } else {
      // Enable shuffle mode
      toggleShuffleMode(playlistId);
    }
  };

  return (
    <DropdownMenuContent
      className="w-[300px] p-3 space-y-3"
      align="end"
      alignOffset={-3}
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
          style={exemplarPro.style}
        />
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-medium truncate text-white"
            style={exemplarPro.style}
          >
            {currentSong.title}
          </div>
          <div
            className="text-xs text-white/60 truncate"
            style={exemplarPro.style}
          >
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
        <div className="flex justify-between px-1">
          <span className="text-xs text-[rgba(76,79,105,0.81)]">
            {formatTime(currentTime)}
          </span>

          <div className="flex flex-col items-start">
            <span className="text-xs text-[rgba(76,79,105,0.81)]">
              {formatTime(duration)}
            </span>
            {/* Shuffle Button - Position under the left timestamp */}
            {currentPlaylist && (
              <button
                onClick={() => handleShuffleToggle(currentPlaylist.id)}
                className="mt-[5.7px] ml-[2.1px] opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: "rgba(76, 79, 105, 0.81)" }}
                title={
                  shuffleModeEnabled[currentPlaylist.id]
                    ? "Reset shuffle"
                    : "Shuffle playlist"
                }
              >
                {shuffleModeEnabled[currentPlaylist.id] ? (
                  <Repeat size={18} />
                ) : (
                  <Shuffle size={18} />
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
                          ...exemplarPro.style,
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
                      <div className="text-xs text-white/40 truncate flex items-center justify-between">
                        <span>{playlist.songCount} songs</span>
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

// Inside MenuBar.tsx - add this right next to your MusicDropdown component
// No separate files needed - just like your music dropdown implementation

// Just replace the PDFReaderDropdown and ZenithPDFReader components with these fixed versions:

// Just replace the PDFReaderDropdown and ZenithPDFReader components with these fixed versions:

// Then update the component to receive the prop
const PDFReaderDropdown: React.FC<PDFReaderDropdownProps> = ({
  onOpenFullscreen,
}) => {
  const { getColor } = useStyles();
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("pdfReaderCurrentPage") || "1");
  });
  const [totalPages] = useState(48);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Now we use the prop instead of local state
  const handleFullscreen = () => {
    onOpenFullscreen(); // This will trigger the fullscreen view
  };

  // Simple navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      localStorage.setItem("pdfReaderCurrentPage", newPage.toString());
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      localStorage.setItem("pdfReaderCurrentPage", newPage.toString());
    }
  };

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
      className="w-[350px] p-3 space-y-3"
      align="end"
      alignOffset={-3}
      sideOffset={4}
      style={{
        backgroundColor: getColor("black-thick"),
        borderColor: getColor("Brd"),
        borderRadius: "9px",
        fontFamily: exemplarPro.style.fontFamily,
      }}
    >
      {/* PDF Preview - like your current song info box */}
      <div className="flex items-center gap-3">
        <img
          src="/apps/48/thumb.png"
          alt={`Law ${currentPage}`}
          className="w-14 h-14 rounded object-contain"
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

      {/* Page Navigation - Similar to music progress bar */}
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

      {/* Law Navigation Controls - Like your play/pause/skip controls */}
      <div className="flex justify-center items-center gap-6">
        <button
          onClick={prevPage}
          className="transition-colors"
          style={{ color: "rgba(76, 79, 105, 0.81)" }}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleFullscreen}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
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

      {/* Bookmarks Section - Like your playlists section */}
      <div>
        <button
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
          style={{ color: "rgba(76, 79, 105, 0.81)" }}
        >
          <Bookmark size={14} />
          <span className="text-sm flex-1 text-left">Bookmarks</span>
        </button>

        <div className="space-y-2 pt-2">
          {bookmarks.length > 0 ? (
            bookmarks.map((page) => (
              <div
                key={`bookmark-${page}`}
                className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors relative"
                onClick={() => setCurrentPage(page)}
              >
                <div className="w-8 h-8 rounded bg-black/30 flex items-center justify-center">
                  <Text
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
              className="text-sm italic px-2"
              style={{ color: "rgba(76, 79, 105, 0.5)" }}
            >
              No bookmarks yet
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="flex justify-around pt-2 border-t"
        style={{ borderColor: getColor("Brd") }}
      >
        <button
          className="p-2 rounded-full hover:bg-white/5"
          onClick={toggleBookmark}
          style={{
            color: bookmarks.includes(currentPage)
              ? "#FFD700"
              : "rgba(76, 79, 105, 0.81)",
          }}
        >
          <Bookmark size={18} />
        </button>
        <button
          className="p-2 rounded-full hover:bg-white/5"
          onClick={() => setIsAnnotating(!isAnnotating)}
          style={{
            color: isAnnotating ? "#7B6CBD" : "rgba(76, 79, 105, 0.81)",
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
    </DropdownMenuContent>
  );
};

{
  /* Add this right after your MusicDropdown component */
}
// Fixed ZenithPDFReader
// Import PDF.js at the top of your file

// Add this right before the ZenithPDFReader component definition

const ZenithPDFReader: React.FC<ZenithPDFReaderProps> = ({
  onClose,
  initialPage = 1,
}) => {
  const { getColor } = useStyles();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);

  // Load PDF document once on mount
  useEffect(() => {
    const loadPDF = async () => {
      try {
        console.log("Loading PDF document...");
        setIsLoading(true);

        const loadingTask = pdfjs.getDocument("/apps/48/48.pdf");
        const pdf = await loadingTask.promise;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);

        console.log(`PDF loaded successfully with ${pdf.numPages} pages`);

        // Immediately render the initial page
        renderPage(currentPage);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setIsLoading(false);
      }
    };

    loadPDF();
  }, []); // Empty dependency array - only run once

  // Simple renderPage function that's easy to debug
  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) {
      console.log("Cannot render: PDF or canvas not ready");
      return;
    }

    try {
      console.log(`Rendering page ${pageNum}...`);
      setIsLoading(true);

      // Get the page
      const page = await pdfRef.current.getPage(pageNum);

      // Get the canvas and prepare it
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set up viewport with scale 1.5
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      console.log(`Page ${pageNum} rendered successfully`);
      setIsLoading(false);
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      setIsLoading(false);
    }
  };

  // Re-render when page changes
  useEffect(() => {
    console.log(`Current page changed to ${currentPage}`);
    renderPage(currentPage);
    // Save to localStorage
    localStorage.setItem("pdfReaderCurrentPage", currentPage.toString());
  }, [currentPage]);

  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextPage();
      else if (e.key === "ArrowLeft") prevPage();
      else if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const toggleBookmark = () => {
    setBookmarks((prev: number[]) =>
      prev.includes(currentPage)
        ? prev.filter((p) => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/80 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div
        className="h-14 border-b flex items-center justify-between px-6"
        style={{
          borderColor: getColor("Brd"),
          backgroundColor: getColor("Glass"),
          fontFamily: exemplarPro.style.fontFamily,
        }}
      >
        <div className="flex items-center gap-4">
          <BookOpen size={20} color={getColor("Text Primary (Hd)")} />
          <h1
            className="text-xl font-medium"
            style={{ color: getColor("Text Primary (Hd)") }}
          >
            48 Laws of Power
          </h1>
          {bookmarks.includes(currentPage) && (
            <Bookmark size={16} className="text-yellow-300/90" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ color: getColor("Text Primary (Hd)") }}
          >
            <Menu size={18} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={onClose}
            style={{ color: getColor("Text Primary (Hd)") }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full border-r overflow-y-auto"
              style={{
                backgroundColor: getColor("Black"),
                borderColor: getColor("Brd"),
              }}
            >
              <div className="p-4">
                <h3
                  className="font-medium mb-4"
                  style={{ color: getColor("Text Primary (Hd)") }}
                >
                  Contents
                </h3>

                <div className="space-y-3">
                  {/* Laws list */}
                  {Array.from({ length: 48 }, (_, i) => i + 1).map(
                    (lawNumber) => (
                      <div
                        key={lawNumber}
                        className="py-1 cursor-pointer hover:opacity-80"
                        onClick={() => setCurrentPage(lawNumber)}
                        style={{
                          color:
                            currentPage === lawNumber
                              ? "#4C4F69"
                              : getColor("Text Primary (Hd)"),
                          fontWeight:
                            currentPage === lawNumber ? "bold" : "normal",
                        }}
                      >
                        <div className="flex justify-between">
                          <span>Law {lawNumber}</span>
                          <span>{lawNumber}</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF View */}
        <div className="flex-1 flex items-center justify-center relative bg-black/50">
          <div className="relative">
            <canvas ref={canvasRef} className="rounded-md shadow-xl" />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-10 h-10 border-4 border-t-white border-opacity-50 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Annotation markers */}
            {annotations
              .filter((a) => a.page === currentPage)
              .map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute w-6 h-6 rounded-full bg-opacity-80 flex items-center justify-center cursor-pointer"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    backgroundColor: "#4C4F69",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Text size={14} color="#fff" />
                </div>
              ))}
          </div>

          {/* Navigation buttons */}
          <button
            className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full"
            style={{
              backgroundColor: getColor("Glass"),
              color: getColor("Text Primary (Hd)"),
              opacity: currentPage > 1 ? 1 : 0.5,
            }}
            onClick={prevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full"
            style={{
              backgroundColor: getColor("Glass"),
              color: getColor("Text Primary (Hd)"),
              opacity: currentPage < totalPages ? 1 : 0.5,
            }}
            onClick={nextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        className="h-14 border-t flex items-center justify-between px-6"
        style={{
          borderColor: getColor("Brd"),
          backgroundColor: getColor("Glass"),
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ color: getColor("Text Primary (Hd)") }}
        >
          <span>
            Page {currentPage} of {totalPages || 48}
          </span>

          <span
            className="ml-4 font-medium"
            style={{
              color: "#4C4F69",
              fontFamily: exemplarPro.style.fontFamily,
            }}
          >
            Law {currentPage}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={toggleBookmark}
            style={{
              color: bookmarks.includes(currentPage)
                ? "#FFD700"
                : getColor("Text Primary (Hd)"),
            }}
          >
            <Bookmark size={18} />
          </button>

          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setIsAddingNote(!isAddingNote)}
            style={{
              color: isAddingNote ? "#4C4F69" : getColor("Text Primary (Hd)"),
            }}
          >
            <Text size={18} />
          </button>
        </div>
      </div>
    </motion.div>
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
  // Local state for PDF Reader
  const [isPDFOpen, setIsPDFOpen] = useState(false);
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
      {/* PDF Reader */}
      // Replace your existing PDF Reader section:
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
              <IconButton src="/icns/system/_dopa.png" />
              <IconButton
                src="/icns/system/_stellar.png"
                onClick={() => {}} // Empty handler for now
              />

              <div className="transform -translate-x-[4.5px]">
                <DropdownMenu
                  onOpenChange={(open) => {
                    setDropdownOpen(open);
                    if (open) {
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
                    alignOffset={-3}
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
                  src="/apps/48/48.png"
                  onOpenChange={setDropdownOpen}
                >
                  <PDFReaderDropdown
                    onOpenFullscreen={() => setIsPDFOpen(true)}
                  />
                </SystemIcon>

                <SystemIcon
                  src="/icns/system/_duo.png"
                  onOpenChange={setDropdownOpen}
                >
                  <DuolingoImageDropdown
                    onLessonSelect={(lessonId) => {
                      console.log(`Selected item: ${lessonId}`);
                      // Handle the selection based on the area clicked

                      // For example:
                      if (lessonId.startsWith("lesson")) {
                        // Handle lesson selection
                        const lessonNumber = lessonId.replace("lesson", "");
                        console.log(`Opening lesson ${lessonNumber}`);
                      } else if (lessonId === "dailyGoals") {
                        // Open daily goals view
                        console.log("Opening daily goals");
                      } else if (lessonId === "schedule") {
                        // Open practice schedule
                        console.log("Opening practice schedule");
                      }
                    }}
                  />
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
                  className="text-xs font-medium pl-[6px]"
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
