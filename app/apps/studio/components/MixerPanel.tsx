import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Volume2,
  Disc,
  VolumeX,
  Headphones,
  BarChart3,
  Music,
  Settings,
  Save,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Track } from "../types/track";

interface MixerPanelProps {
  tracks: Track[];
  onVolumeChange: (trackId: string, volume: number) => void;
  onPanChange: (trackId: string, pan: number) => void;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect: (trackId: string | null) => void;
  activeTrackId: string | null;
  masterVolume: number;
  onMasterVolumeChange: (volume: number) => void;
}

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
  if (type.includes("piano") || type.includes("key")) return TRACK_COLORS.keys;
  if (type.includes("synth")) return TRACK_COLORS.synth;
  if (type.includes("vocal") || type.includes("voice"))
    return TRACK_COLORS.vocals;
  if (type.includes("effect") || type.includes("fx")) return TRACK_COLORS.fx;

  return TRACK_COLORS.default;
};

// Generate realistic VU meter values (for visual demo)
const generateVUMeterValues = (volume: number, isActive: boolean): number[] => {
  if (!isActive) return [0, 0];

  // Convert from dB to normalized value (0-1)
  const normalizedVolume = Math.min(1, Math.max(0, (volume + 60) / 60));

  // Generate slightly randomized values based on volume
  const baseValue = normalizedVolume * 0.9; // Leave some headroom
  const fluctuation = Math.random() * 0.2; // Random fluctuation

  const leftChannel = Math.min(
    1,
    baseValue + (Math.random() > 0.5 ? fluctuation : -fluctuation) * 0.5
  );
  const rightChannel = Math.min(
    1,
    baseValue + (Math.random() > 0.5 ? fluctuation : -fluctuation) * 0.5
  );

  return [leftChannel, rightChannel];
};

export const MixerPanel: React.FC<MixerPanelProps> = ({
  tracks,
  onVolumeChange,
  onPanChange,
  onTrackMute,
  onTrackSolo,
  onTrackSelect,
  activeTrackId,
  masterVolume,
  onMasterVolumeChange,
}) => {
  const [showAutomation, setShowAutomation] = useState(false);
  const [showEffects, setShowEffects] = useState(true);
  const [metering, setMetering] = useState(true); // For animated VU meters

  // Function to get normalized volume position (0-100)
  const getNormalizedVolume = (volume: number) => {
    // dB scale typically goes from -60 to 0
    return ((volume + 60) / 60) * 100;
  };

  // Function to normalize pan position (0-100)
  const getNormalizedPan = (pan: number) => {
    // Pan goes from -1 to 1
    return ((pan + 1) / 2) * 100;
  };

  // Calculate bounded bottom position for fader
  const calculateFaderPosition = (volume: number) => {
    const normalizedPos = getNormalizedVolume(volume);
    // Going from bottom to top
    return `${100 - normalizedPos}%`;
  };

  // Generate dB scale markers
  const dbMarkers = [0, -3, -6, -12, -18, -24, -36, -48];

  return (
    <div className="h-full flex flex-col">
      {/* Mixer toolbar */}
      <div className="h-11 border-b border-[#333] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[#EEEEEE] text-sm font-medium">Mixer</h2>

          <div className="h-6 w-px bg-[#444] mx-1" />

          <button
            className={cn(
              "px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors",
              showAutomation
                ? "bg-[#64B5F6] text-black"
                : "bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#3A3A3A]"
            )}
            onClick={() => setShowAutomation(!showAutomation)}
          >
            <BarChart3 size={14} />
            <span>Automation</span>
          </button>

          <button
            className={cn(
              "px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors",
              showEffects
                ? "bg-[#64B5F6] text-black"
                : "bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#3A3A3A]"
            )}
            onClick={() => setShowEffects(!showEffects)}
          >
            <Settings size={14} />
            <span>Show Effects</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded flex items-center justify-center bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#3A3A3A] transition-colors">
            <Save size={16} />
          </button>
          <button className="w-8 h-8 rounded flex items-center justify-center bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#3A3A3A] transition-colors">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main mixer area */}
      <div className="flex-1 flex overflow-x-auto">
        <div className="flex-1 flex items-end p-3 gap-1 relative">
          {/* dB scale on the left */}
          <div className="absolute left-2 top-0 bottom-0 w-6 flex flex-col justify-between items-end pr-1 pointer-events-none">
            {dbMarkers.map((db) => (
              <div
                key={`db-${db}`}
                className="flex items-center gap-1"
                style={{
                  position: "absolute",
                  top: `${calculateFaderPosition(-db)}`,
                  right: "12px",
                }}
              >
                <div className="text-[9px] text-[#999999]">
                  {db === 0 ? "0" : db}
                </div>
                <div className="w-2 h-px bg-[#444]" />
              </div>
            ))}
          </div>

          {/* Track channels */}
          {tracks.map((track) => {
            const trackColor = getTrackColor(track);
            const isSelected = activeTrackId === track.id;
            const [leftMeter, rightMeter] = generateVUMeterValues(
              track.volume,
              !track.isMuted
            );

            return (
              <div
                key={track.id}
                className={cn(
                  "w-[100px] h-full flex flex-col rounded overflow-hidden cursor-pointer group transition-all duration-100",
                  isSelected
                    ? "bg-[#1E1E1E] scale-102 shadow-lg z-10 border border-[#333]"
                    : "bg-[#1A1A1A] hover:bg-[#1D1D1D]",
                  track.isMuted && "opacity-70"
                )}
                onClick={() => onTrackSelect(track.id)}
              >
                {/* Track name header */}
                <div
                  className="h-10 px-2 flex items-center justify-center border-b border-[#333]"
                  style={{
                    borderTop: `2px solid ${trackColor}`,
                  }}
                >
                  <span
                    className="text-xs font-medium text-center truncate"
                    style={{ color: track.isMuted ? "#999" : "#EEE" }}
                  >
                    {track.name}
                  </span>
                </div>

                {/* Effects section (collapsible) */}
                {showEffects && (
                  <div className="h-20 bg-[#1D1D1D] border-b border-[#333] p-1.5 flex flex-col">
                    <div className="text-[9px] text-[#999] mb-1 text-center">
                      {track.instrument.type}
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      {/* Effect slots - simplified visualization */}
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-6 rounded bg-[#2A2A2A] border border-[#333] flex items-center justify-center"
                        >
                          <span className="text-[9px] text-[#999]">
                            {i === 0 ? "EQ" : "Comp"}
                          </span>
                        </div>
                      ))}

                      {/* Add effect button */}
                      <div className="flex justify-center">
                        <button className="w-5 h-5 rounded flex items-center justify-center text-[#999] hover:text-[#CCC] hover:bg-[#333] transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pan control */}
                <div className="h-9 flex items-center justify-center p-2 border-b border-[#333]">
                  <div className="w-full h-3 bg-[#242424] rounded-full relative">
                    <div
                      className="absolute top-0 w-2.5 h-3 bg-[#AAA] rounded-full transform -translate-x-1/2"
                      style={{
                        left: `${getNormalizedPan(track.pan)}%`,
                      }}
                    />
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={track.pan}
                      onChange={(e) =>
                        onPanChange(track.id, Number(e.target.value))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Volume fader and VU meter */}
                <div className="flex-1 flex gap-1 p-2 relative">
                  {/* VU meter */}
                  <div className="w-3 h-full flex flex-col gap-0.5">
                    <div className="flex-1 bg-[#222] rounded-sm overflow-hidden relative">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#64B5F6] to-[#F44336]"
                        style={{
                          height: `${leftMeter * 100}%`,
                          transition: metering
                            ? "height 100ms ease-out"
                            : "none",
                        }}
                      />
                    </div>
                    <div className="flex-1 bg-[#222] rounded-sm overflow-hidden relative">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#64B5F6] to-[#F44336]"
                        style={{
                          height: `${rightMeter * 100}%`,
                          transition: metering
                            ? "height 100ms ease-out"
                            : "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Fader */}
                  <div className="flex-1 bg-[#242424] rounded relative">
                    {/* Fader track with level visualization */}
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: `${getNormalizedVolume(track.volume)}%`,
                        background: `linear-gradient(to top, ${trackColor}80, ${trackColor}40)`,
                      }}
                    />

                    {/* Fader handle */}
                    <div
                      className="absolute left-0 right-0 h-3 bg-[#DDD] rounded-sm border border-[#333] shadow-md"
                      style={{
                        bottom: calculateFaderPosition(track.volume),
                        transform: "translateY(50%)",
                      }}
                    />

                    {/* Interactive slider input */}
                    <input
                      type="range"
                      min="-60"
                      max="0"
                      value={track.volume}
                      onChange={(e) =>
                        onVolumeChange(track.id, Number(e.target.value))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </div>
                </div>

                {/* Volume display */}
                <div className="h-6 flex items-center justify-center border-t border-[#333]">
                  <span className="text-[10px] text-[#CCC] font-mono">
                    {track.volume.toFixed(1)} dB
                  </span>
                </div>

                {/* Mute/Solo buttons */}
                <div className="h-10 flex items-center justify-center gap-1 border-t border-[#333] bg-[#1D1D1D]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackMute(track.id);
                    }}
                    className={cn(
                      "w-8 h-7 rounded text-[10px] font-medium transition-colors",
                      track.isMuted
                        ? "bg-[#F44336] text-white"
                        : "bg-[#333] text-[#CCC] hover:bg-[#444]"
                    )}
                  >
                    M
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackSolo(track.id);
                    }}
                    className={cn(
                      "w-8 h-7 rounded text-[10px] font-medium transition-colors",
                      track.isSolo
                        ? "bg-[#FFB74D] text-black"
                        : "bg-[#333] text-[#CCC] hover:bg-[#444]"
                    )}
                  >
                    S
                  </button>
                </div>
              </div>
            );
          })}

          {/* Master Channel */}
          <div className="w-[120px] h-full flex flex-col bg-[#212121] border border-[#444] rounded overflow-hidden">
            {/* Channel header */}
            <div className="h-10 px-2 flex items-center justify-center border-b border-[#444]">
              <span className="text-xs font-semibold text-[#FFF]">MASTER</span>
            </div>

            {/* Effects section (simplified) */}
            {showEffects && (
              <div className="h-20 bg-[#1D1D1D] border-b border-[#444] p-1.5 flex flex-col">
                <div className="text-[9px] text-[#BBB] mb-1 text-center">
                  Output
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-6 rounded bg-[#2A2A2A] border border-[#444] flex items-center justify-center">
                    <span className="text-[9px] text-[#BBB]">Limiter</span>
                  </div>
                  <div className="h-6 rounded bg-[#2A2A2A] border border-[#444] flex items-center justify-center">
                    <span className="text-[9px] text-[#BBB]">Master EQ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stereo balance control */}
            <div className="h-9 flex items-center justify-center p-2 border-b border-[#444]">
              <div className="w-full h-3 bg-[#242424] rounded-full relative">
                <div className="absolute top-0 w-2.5 h-3 bg-[#CCC] rounded-full transform -translate-x-1/2 left-1/2" />
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  defaultValue={0}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Volume fader and VU meter */}
            <div className="flex-1 flex gap-1.5 p-2 relative">
              {/* VU meter - stereo */}
              <div className="w-4 h-full flex flex-col gap-0.5">
                <div className="flex-1 bg-[#222] rounded-sm overflow-hidden relative">
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-[#64B5F6] via-[#FFB74D] to-[#F44336]"
                    style={{
                      height: `${getNormalizedVolume(masterVolume) * 0.9}%`,
                      transition: metering ? "height 150ms ease-out" : "none",
                    }}
                  />
                </div>
                <div className="flex-1 bg-[#222] rounded-sm overflow-hidden relative">
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-[#64B5F6] via-[#FFB74D] to-[#F44336]"
                    style={{
                      height: `${getNormalizedVolume(masterVolume) * 0.85}%`,
                      transition: metering ? "height 150ms ease-out" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Fader */}
              <div className="flex-1 bg-[#333] rounded relative">
                {/* Fader track with level visualization */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${getNormalizedVolume(masterVolume)}%`,
                    background: "linear-gradient(to top, #64B5F680, #64B5F640)",
                  }}
                />

                {/* Fader handle */}
                <div
                  className="absolute left-0 right-0 h-4 bg-[#EEE] rounded-sm border border-[#333] shadow-md"
                  style={{
                    bottom: calculateFaderPosition(masterVolume),
                    transform: "translateY(50%)",
                  }}
                />

                {/* Interactive slider input */}
                <input
                  type="range"
                  min="-60"
                  max="0"
                  value={masterVolume}
                  onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ transform: "rotate(180deg)" }}
                />
              </div>
            </div>

            {/* Volume display */}
            <div className="h-6 flex items-center justify-center border-t border-[#444]">
              <span className="text-[10px] text-white font-mono">
                {masterVolume.toFixed(1)} dB
              </span>
            </div>

            {/* Output controls */}
            <div className="h-10 flex items-center justify-center gap-1 border-t border-[#444] bg-[#1D1D1D]">
              <button className="w-8 h-7 rounded flex items-center justify-center bg-[#444] text-[#EEE] hover:bg-[#555] transition-colors">
                <Headphones size={14} />
              </button>
              <button className="w-8 h-7 rounded flex items-center justify-center bg-[#444] text-[#EEE] hover:bg-[#555] transition-colors">
                <Volume2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default MixerPanel;
