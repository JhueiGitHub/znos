import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, ChevronDown } from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";

interface MusicPlayerProps {
  isPlaying?: boolean;
  currentTrack?: {
    title: string;
    artist: string;
    albumArt: string;
    progress: number;
  };
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onPlaylistSelect?: (playlist: string) => void;
}

interface MusicPlayerProps {
  onOpenChange: (open: boolean) => void;
  isPlaying?: boolean;
  currentTrack?: {
    title: string;
    artist: string;
    albumArt: string;
    progress: number;
  };
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onPlaylistSelect?: (playlist: string) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  onOpenChange,
  isPlaying = false,
  currentTrack = {
    title: "After Hours",
    artist: "The Weeknd",
    albumArt: "/playlists/xp/after-hours.jpg",
    progress: 0.4,
  },
  onPlayPause = () => {},
  onNext = () => {},
  onPrevious = () => {},
  onPlaylistSelect = () => {},
}) => {
  const { getColor } = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="relative p-2 rounded-md flex items-center justify-center hover:bg-white/5"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.img
            src="/icns/system/_play.png"
            alt="Music"
            className="w-4 h-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[300px] p-3"
        align="start"
        alignOffset={-10}
        sideOffset={4}
        style={{
          backgroundColor: getColor("black-thick"),
          borderColor: getColor("Brd"),
        }}
      >
        <div className="flex flex-col gap-3">
          {/* Playlist Selector */}
          <div className="relative">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="w-full">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5"
                  style={{
                    backgroundColor: getColor("night-thin"),
                    borderColor: getColor("Brd"),
                  }}
                >
                  <span
                    className="text-xs flex items-center gap-1"
                    style={{ color: getColor("smoke-thin") }}
                  >
                    Playlist
                    <ChevronDown size={14} />
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={4}
                alignOffset={-10}
                className="min-w-[200px]"
                style={{
                  backgroundColor: getColor("black-thick"),
                  borderColor: getColor("Brd"),
                }}
              >
                <DropdownMenuItem
                  onClick={() => onPlaylistSelect("xp")}
                  className="px-2 py-1.5 hover:bg-white/5"
                >
                  <span
                    className="text-sm"
                    style={{ color: getColor("latte") }}
                  >
                    XP
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onPlaylistSelect("swans")}
                  className="px-2 py-1.5 hover:bg-white/5"
                >
                  <span
                    className="text-sm"
                    style={{ color: getColor("latte") }}
                  >
                    Swans
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Track Info Row */}
          <div className="flex items-center gap-3">
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className="w-12 h-12 rounded"
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium truncate"
                style={{ color: getColor("smoke") }}
              >
                {currentTrack.title}
              </div>
              <div
                className="text-xs truncate"
                style={{ color: getColor("smoke-thin") }}
              >
                {currentTrack.artist}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: getColor("night-med") }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${currentTrack.progress * 100}%`,
                backgroundColor: getColor("latte"),
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onPrevious}
              className="p-1 rounded-full hover:bg-white/5"
              style={{ color: getColor("latte") }}
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={onPlayPause}
              className="p-2 rounded-full hover:bg-white/5"
              style={{ color: getColor("latte") }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={onNext}
              className="p-1 rounded-full hover:bg-white/5"
              style={{ color: getColor("latte") }}
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MusicPlayer;
