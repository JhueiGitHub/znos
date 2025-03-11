import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StepType, StepNoteType } from "reactronica";
import { cn } from "@/lib/utils";
import { useStyles } from "@/app/hooks/useStyles";
import {
  ChevronDown,
  ChevronRight,
  Volume2,
  VolumeX,
  PanelRight,
  Music,
} from "lucide-react";

interface StepSequencerProps {
  tracks: Array<{
    id: string;
    name: string;
    steps: StepType[];
    isMuted?: boolean;
    isSolo?: boolean;
    instrument: {
      type: string;
    };
    volume: number;
    mediaUrl?: string; // For visual waveform
    color?: string; // For custom track colors
  }>;
  currentStepIndex: number;
  selectedTrackIndex: string | null;
  onTrackSelect: (index: string) => void;
  onTrackAdd?: () => void;
  onTrackRemove?: (trackId: string) => void;
  onTrackMute?: (trackId: string) => void;
  onTrackSolo?: (trackId: string) => void;
  onStepChange?: (
    trackId: string,
    stepIndex: number,
    newStep: StepType
  ) => void;
  zoomLevel?: number;
}

const STEP_COUNT = 16;
const BEAT_COUNT = 4;
const STEPS_PER_BEAT = STEP_COUNT / BEAT_COUNT;

// Track color palette similar to Ableton's
const TRACK_COLORS = {
  default: "#5D5D5D",
  drums: "#D95D5D",
  bass: "#5D8CD9",
  keys: "#D9A15D",
  synth: "#5DD99B",
  vocals: "#D95DB4",
  fx: "#9C5DD9",
};

// Generate realistic waveform path (for visual only)
const generateWaveformPath = (complexity = 1, density = 16) => {
  let path = "M 0,50";
  const width = 100;
  const step = width / density;

  for (let i = 1; i <= density; i++) {
    const x = i * step;
    const randomHeight = 50 + (Math.random() * 30 - 15) * complexity;
    path += ` L ${x},${randomHeight}`;
  }

  return path;
};

export const StepSequencer: React.FC<StepSequencerProps> = ({
  tracks,
  currentStepIndex,
  selectedTrackIndex,
  onTrackSelect,
  onTrackAdd,
  onTrackRemove,
  onTrackMute,
  onTrackSolo,
  onStepChange,
  zoomLevel = 1,
}) => {
  const { getColor } = useStyles();
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>(
    {}
  );
  const [waveformPaths, setWaveformPaths] = useState<Record<string, string>>(
    {}
  );

  // Initialize expanded state and generate waveforms
  useEffect(() => {
    const expanded: Record<string, boolean> = {};
    const waveforms: Record<string, string> = {};

    tracks.forEach((track) => {
      expanded[track.id] = true;
      waveforms[track.id] = generateWaveformPath(
        track.instrument.type === "sampler" ? 1.5 : 0.8,
        track.instrument.type === "sampler" ? 32 : 24
      );
    });

    setExpandedTracks(expanded);
    setWaveformPaths(waveforms);
  }, [tracks.length]);

  const toggleTrackExpanded = (trackId: string) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  // Get appropriate color for track based on instrument
  const getTrackColor = (track: {
    instrument: { type: string };
    color?: string;
  }) => {
    if (track.color) return track.color;

    const type = track.instrument.type;
    if (type.includes("sampler") || type.includes("drum"))
      return TRACK_COLORS.drums;
    if (type.includes("bass")) return TRACK_COLORS.bass;
    if (type.includes("piano") || type.includes("key"))
      return TRACK_COLORS.keys;
    if (type.includes("synth")) return TRACK_COLORS.synth;
    if (type.includes("vocal") || type.includes("voice"))
      return TRACK_COLORS.vocals;
    if (type.includes("effect") || type.includes("fx")) return TRACK_COLORS.fx;

    return TRACK_COLORS.default;
  };

  // Check if a step has notes
  const hasNotes = (step: StepType): boolean => {
    if (!step) return false;
    if (Array.isArray(step)) return step.length > 0;
    return true;
  };

  // Convert steps to a display-friendly format
  const getStepDisplayInfo = (step: StepType) => {
    if (!step) return { active: false, count: 0 };

    if (Array.isArray(step)) {
      return {
        active: step.length > 0,
        count: step.length,
      };
    }

    return { active: true, count: 1 };
  };

  // Toggle a step on/off
  const toggleStep = (trackId: string, stepIndex: number) => {
    if (!onStepChange) return;

    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    const currentStep = track.steps[stepIndex];

    // Create a proper StepNoteType object instead of just a string
    const newStep = currentStep ? null : [{ name: "C4" } as StepNoteType];

    onStepChange(trackId, stepIndex, newStep);
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{
        color: getColor("Text Primary (Hd)"),
      }}
    >
      {/* Tracks container */}
      <div className="flex-1 overflow-auto relative">
        {/* Vertical lines for beats */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: BEAT_COUNT }).map((_, beatIndex) => (
            <div
              key={`beat-${beatIndex}`}
              className="absolute top-0 bottom-0 border-l border-[#333333]"
              style={{
                left: `${beatIndex * STEPS_PER_BEAT * (100 / STEP_COUNT)}%`,
                borderLeftWidth: beatIndex === 0 ? 0 : "1px",
              }}
            />
          ))}
        </div>

        {/* Current step indicator */}
        <div
          className="absolute top-0 bottom-0 w-px  z-10 transition-all duration-75"
          style={{
            left: `calc(${currentStepIndex * (100 / STEP_COUNT)}% + 0px)`,
            opacity: 0.7,
          }}
        />

        {tracks.map((track, trackIdx) => {
          const trackColor = getTrackColor(track);
          const isSelected = selectedTrackIndex === track.id;

          return (
            <div
              key={track.id}
              className={cn("border-b border-[#222]", isSelected && "")}
            >
              {/* Track row */}
              <div
                className={cn(
                  "flex h-16 relative",
                  track.isMuted && "opacity-50"
                )}
              >
                {/* Track info */}
                <div
                  className="w-[240px] shrink-0 px-3 flex items-center gap-2 border-r border-[#282828] h-full cursor-pointer hover:bg-[#4C4F69]/30 transition-colors"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftStyle: "solid",
                    borderLeftColor: trackColor,
                  }}
                  onClick={() => onTrackSelect(track.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackExpanded(track.id);
                    }}
                    className="opacity-60 hover:opacity-100 text-[#B4B4B4]"
                  >
                    {expandedTracks[track.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate text-[#E0E0E0]">
                        {track.name}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded opacity-70 text-[#A0A0A0]"
                        style={{ backgroundColor: `${trackColor}20` }}
                      >
                        {track.instrument.type}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-center text-[#B4B4B4]",
                      track.isMuted ? "text-[#FFB74D]" : ""
                    )}
                  >
                    {track.isMuted ? (
                      <VolumeX size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </div>
                </div>

                {/* Steps grid */}
                <div className="flex-1 flex h-full relative group">
                  {/* Track color indicator */}
                  <div
                    className="absolute left-0 top-0 h-0.5 w-full opacity-60 z-10"
                    style={{ backgroundColor: trackColor }}
                  />

                  {/* Waveform visualization (if expanded) */}
                  {expandedTracks[track.id] && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg
                        width="100%"
                        height="60%"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="opacity-20"
                      >
                        <path
                          d={waveformPaths[track.id] || ""}
                          stroke={trackColor}
                          strokeWidth="1"
                          fill="none"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Step blocks */}
                  {Array.from({ length: STEP_COUNT }).map((_, stepIndex) => {
                    const { active, count } = getStepDisplayInfo(
                      track.steps[stepIndex] || null
                    );
                    const isCurrentStep = currentStepIndex === stepIndex;
                    const isBeatStart = stepIndex % STEPS_PER_BEAT === 0;

                    return (
                      <div
                        key={stepIndex}
                        className={cn(
                          "flex-1 h-full flex items-center justify-center cursor-pointer relative",
                          isBeatStart && "border-l border-[#333]",
                          isCurrentStep
                            ? "bg-[#4C4F69]/30"
                            : stepIndex % 2 === 0
                              ? "bg-[#4C4F69]/30"
                              : "",
                          "hover:bg-[#4C4F69]/10 transition-colors"
                        )}
                        onClick={() => toggleStep(track.id, stepIndex)}
                      >
                        {active && (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={cn(
                              "w-5/6 h-2/3 rounded m-1 flex items-center justify-center relative overflow-hidden",
                              isCurrentStep ? "shadow-glow" : ""
                            )}
                            style={{
                              backgroundColor: `${trackColor}${isCurrentStep ? "FF" : "CC"}`,
                            }}
                          >
                            {count > 1 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-medium text-white z-10">
                                  {count}
                                </span>
                              </div>
                            )}

                            {/* Mini waveform visualization inside the block */}
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                              className="absolute inset-0 opacity-30"
                            >
                              <path
                                d={generateWaveformPath(0.5, 8)}
                                stroke="white"
                                strokeWidth="1.5"
                                fill="none"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}

                  {/* Track controls that appear on hover */}
                  <div className="absolute top-0 right-0 h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-2">
                    {onTrackMute && (
                      <button
                        className={cn(
                          "w-8 h-8 rounded flex items-center justify-center transition-colors mx-1",
                          track.isMuted
                            ? "bg-[#FFB74D50] text-[#FFB74D]"
                            : "bg-[#33333350] text-[#E0E0E0] hover:bg-[#444]"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrackMute(track.id);
                        }}
                      >
                        M
                      </button>
                    )}

                    {onTrackSolo && (
                      <button
                        className={cn(
                          "w-8 h-8 rounded flex items-center justify-center transition-colors mx-1",
                          track.isSolo
                            ? "bg-[#64B5F650] text-[#64B5F6]"
                            : "bg-[#33333350] text-[#E0E0E0] hover:bg-[#444]"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrackSolo(track.id);
                        }}
                      >
                        S
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded track view */}
              <AnimatePresence>
                {expandedTracks[track.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 80, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex w-full border-t border-[#222] h-[80px]">
                      {/* Track visualization area */}
                      <div className="w-[240px] shrink-0 border-r border-[#282828] p-3 flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#A0A0A0]">Volume</span>
                          <span className="text-xs text-[#E0E0E0]">
                            {track.volume} dB
                          </span>
                        </div>

                        <div className="w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${((track.volume + 60) / 60) * 100}%`,
                              backgroundColor: trackColor,
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                          <button className="w-8 h-8 rounded-full flex items-center justify-center  text-[#E0E0E0] hover:bg-[#3A3A3A] transition-colors">
                            <Music size={14} />
                          </button>

                          <button className="w-8 h-8 rounded-full flex items-center justify-center  text-[#E0E0E0] hover:bg-[#3A3A3A] transition-colors">
                            <PanelRight size={14} />
                          </button>

                          <div className="flex-1 text-right">
                            <button
                              className="px-2 py-1 rounded text-xs bg-[#4C4F69]/30 text-[#E0E0E0] hover:bg-[#3A3A3A] transition-colors"
                              style={{ borderLeft: `2px solid ${trackColor}` }}
                            >
                              Edit...
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Pattern visualization */}
                      <div className="flex-1 relative">
                        <div className="absolute inset-0 flex">
                          {Array.from({ length: STEP_COUNT }).map(
                            (_, stepIndex) => {
                              const { active } = getStepDisplayInfo(
                                track.steps[stepIndex] || null
                              );
                              const isCurrentStep =
                                currentStepIndex === stepIndex;
                              const isBeatStart =
                                stepIndex % STEPS_PER_BEAT === 0;

                              return (
                                <div
                                  key={stepIndex}
                                  className={cn(
                                    "flex-1 flex flex-col justify-end",
                                    isBeatStart && "border-l border-[#333]",
                                    isCurrentStep
                                      ? "bg-[#4C4F69]/30"
                                      : stepIndex % 2 === 0
                                        ? "bg-[#4C4F69]/30"
                                        : ""
                                  )}
                                >
                                  {active && (
                                    <div
                                      className="w-full bg-gradient-to-t from-transparent"
                                      style={{
                                        height: "60%",
                                        backgroundColor: `${trackColor}20`,
                                        borderTop: `1px solid ${trackColor}50`,
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add track button */}
      {onTrackAdd && (
        <div className="h-12 flex items-center justify-center border-t border-[#282828] ">
          <button
            onClick={onTrackAdd}
            className="px-4 py-1.5 rounded bg-[#4C4F69]/30 text-sm text-[#E0E0E0] hover:bg-[#444] transition-colors"
          >
            Add Track
          </button>
        </div>
      )}

      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default StepSequencer;
