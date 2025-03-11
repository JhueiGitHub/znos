import React from "react";
import { cn } from "@/lib/utils";
import { ViewMode } from "../types/daw";
import {
  Music,
  Layers,
  Sliders,
  Download,
  Mic,
  ZoomIn,
  ZoomOut,
  Settings,
  FileAudio,
  Edit,
  HelpCircle,
  Menu,
  Save,
  Share2,
} from "lucide-react";

interface DAWHeaderProps {
  title: string;
  subtitle: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  isRecording: boolean;
  onRecordingToggle: () => void;
  onExport: () => void;
  projectName?: string;
  isModified?: boolean;
}

export const DAWHeader: React.FC<DAWHeaderProps> = ({
  title,
  subtitle,
  viewMode,
  onViewModeChange,
  zoomLevel,
  onZoomChange,
  isRecording,
  onRecordingToggle,
  onExport,
  projectName = "Untitled Project",
  isModified = false,
}) => {
  return (
    <div className="h-16 border-b border-[#333] px-4 flex items-center justify-between">
      {/* Left section with branding and project info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Logo/App icon */}
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#7B6CBD] to-[#003431] flex items-center justify-center">
            <FileAudio size={22} className="text-white" />
          </div>

          {/* App name and project info */}
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-[#7B6CBD] to-[#64B5F6] text-transparent bg-clip-text">
              {title}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#888]">{subtitle}</span>
              <span className="text-xs text-[#888]">•</span>
              <span className="text-xs text-[#CCC] flex items-center gap-1">
                {projectName}
                {isModified && (
                  <span className="text-[#FFB74D] text-xs">*</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Project actions */}
        <div className="flex items-center gap-1 ml-3">
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
            title="Save Project (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
            title="Share Project"
          >
            <Share2 size={16} />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
            title="Project Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Center section with view modes */}
      <div className="flex items-center">
        <div className="flex overflow-hidden rounded-md border border-[#333] ">
          <button
            onClick={() => onViewModeChange("sequencer")}
            className={cn(
              "px-4 py-2 flex items-center gap-1.5 transition-colors",
              viewMode === "sequencer"
                ? " text-white"
                : "text-[#999] hover:text-white hover:bg-[#222]"
            )}
            title="Sequencer View (1)"
          >
            <Layers size={16} />
            <span className="text-sm">Arranger</span>
          </button>
          <button
            onClick={() => onViewModeChange("pianoRoll")}
            className={cn(
              "px-4 py-2 flex items-center gap-1.5 transition-colors",
              viewMode === "pianoRoll"
                ? " text-white"
                : "text-[#999] hover:text-white hover:bg-[#222]"
            )}
            title="Piano Roll View (2)"
          >
            <Music size={16} />
            <span className="text-sm">Piano Roll</span>
          </button>
          <button
            onClick={() => onViewModeChange("mixer")}
            className={cn(
              "px-4 py-2 flex items-center gap-1.5 transition-colors",
              viewMode === "mixer"
                ? " text-white"
                : "text-[#999] hover:text-white hover:bg-[#222]"
            )}
            title="Mixer View (3)"
          >
            <Sliders size={16} />
            <span className="text-sm">Mixer</span>
          </button>
        </div>
      </div>

      {/* Right section with tools and functions */}
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <div className="px-2 py-1 rounded text-xs text-[#CCC] bg-[#4C4F69]/30">
            {Math.round(zoomLevel * 100)}%
          </div>
          <button
            onClick={() => onZoomChange(Math.min(2, zoomLevel + 0.1))}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-[#4C4F69]/30 mx-1" />

        {/* Record button */}
        <button
          onClick={onRecordingToggle}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isRecording
              ? "bg-[#F44336]/60 text-white"
              : "text-[#F44336]/70 hover:bg-[#2A2A2A]"
          )}
          title="Record (R)"
        >
          <Mic size={20} />
        </button>

        {/* Export button */}
        <button
          onClick={onExport}
          className="px-3 py-1.5 bg-[#4C4F69]/60 text-black rounded flex items-center gap-1.5 hover:bg-[#81D4FA] transition-colors text-sm"
          title="Export Project"
        >
          <Download size={16} />
          <span>Export</span>
        </button>

        {/* Help button */}
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors ml-1"
          title="Help"
        >
          <HelpCircle size={16} />
        </button>

        {/* Menu button */}
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
          title="Menu"
        >
          <Menu size={16} />
        </button>
      </div>
    </div>
  );
};

export default DAWHeader;
