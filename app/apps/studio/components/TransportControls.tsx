import React from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Repeat,
  Timer,
  Mic,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid,
  Clock,
} from "lucide-react";

interface TransportControlsProps {
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  currentStep: number;
  totalSteps: number;
  isRecording: boolean;
  onRecordingToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  quantizeValue: string;
  onQuantizeChange: (value: string) => void;
  snapToGrid: boolean;
  onSnapToGridChange: (value: boolean) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  onPlayPauseToggle,
  bpm,
  onBpmChange,
  currentStep,
  totalSteps,
  isRecording,
  onRecordingToggle,
  onUndo,
  onRedo,
  quantizeValue,
  onQuantizeChange,
  snapToGrid,
  onSnapToGridChange,
  onZoomIn,
  onZoomOut,
}) => {
  // Calculate position indicators
  const currentBar = Math.floor(currentStep / 4) + 1;
  const currentBeat = (currentStep % 4) + 1;
  const currentSubdivision = 1; // Simplified, could be more granular

  return (
    <div className="h-14 flex items-center justify-between px-3  border-b border-[#333333]">
      <div className="flex items-center gap-2">
        {/* History controls */}
        <div className="flex gap-px mr-2">
          <button
            onClick={onUndo}
            className="w-8 h-8 flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-l-md transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            className="w-8 h-8 flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-r-md transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-[#333333] mx-1" />

        {/* Playback controls */}
        <div className="flex items-center">
          <button
            className="w-8 h-8 flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-md transition-colors"
            title="Go to Start"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={onPlayPauseToggle}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors mx-1",
              isPlaying
                ? "bg-[#64B5F6] text-[#111]"
                : "bg-[#333] text-[#CCCCCC] hover:bg-[#444] hover:text-white"
            )}
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-md transition-colors"
            title="Stop"
          >
            <Square size={16} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-md transition-colors"
            title="Go to End"
          >
            <SkipForward size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-[#333333] mx-1" />

        {/* Record button */}
        <button
          onClick={onRecordingToggle}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
            isRecording
              ? "bg-[#F44336] text-white"
              : "text-[#F44336] hover:bg-[#2A2A2A]"
          )}
          title="Record (R)"
        >
          <Mic size={16} />
        </button>

        <div className="w-px h-8 bg-[#333333] mx-1" />

        {/* Loop button */}
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
          title="Loop On/Off"
        >
          <Repeat size={16} />
        </button>

        <div className="w-px h-8 bg-[#333333] mx-1" />

        {/* Metronome */}
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
          title="Metronome"
        >
          <Clock size={16} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="w-8 h-8 flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={onZoomIn}
            className="w-8 h-8 flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* BPM control */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded px-2 py-1 bg-[#2A2A2A]">
            <Timer size={14} className="text-[#64B5F6] mr-1.5" />
            <span className="text-[#CCCCCC] text-xs font-medium">BPM</span>
          </div>
          <div className="flex h-8">
            <button
              onClick={() => onBpmChange(Math.max(40, bpm - 1))}
              className="w-6 h-full bg-[#2A2A2A] text-[#CCCCCC] flex items-center justify-center rounded-l-md hover:bg-[#3A3A3A] transition-colors"
            >
              -
            </button>
            <div className="px-3 h-full bg-[#333] flex items-center justify-center text-xs text-[#FFFFFF] font-medium">
              {bpm}
            </div>
            <button
              onClick={() => onBpmChange(Math.min(300, bpm + 1))}
              className="w-6 h-full bg-[#2A2A2A] text-[#CCCCCC] flex items-center justify-center rounded-r-md hover:bg-[#3A3A3A] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Quantize control */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded px-2 py-1 bg-[#2A2A2A]">
            <Grid size={14} className="text-[#64B5F6] mr-1.5" />
            <span className="text-[#CCCCCC] text-xs font-medium">Quantize</span>
          </div>
          <select
            value={quantizeValue}
            onChange={(e) => onQuantizeChange(e.target.value)}
            className="bg-[#333] text-[#CCCCCC] rounded h-8 text-xs font-medium px-2 border border-[#444] focus:outline-none focus:border-[#64B5F6]"
          >
            <option value="4n">1/4</option>
            <option value="8n">1/8</option>
            <option value="16n">1/16</option>
            <option value="32n">1/32</option>
          </select>
        </div>

        {/* Snap to grid toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[#CCCCCC] text-xs">Snap</span>
          <button
            className={cn(
              "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
              snapToGrid ? "bg-[#64B5F6]" : "bg-[#333]"
            )}
            onClick={() => onSnapToGridChange(!snapToGrid)}
          >
            <div
              className={cn(
                "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                snapToGrid ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* Position indicator */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <div className="text-sm font-mono text-[#FFFFFF] font-medium">
            {currentBar}.{currentBeat}.{currentSubdivision}
          </div>
          <div className="text-[10px] text-[#999999]">
            {currentStep + 1}/{totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportControls;
