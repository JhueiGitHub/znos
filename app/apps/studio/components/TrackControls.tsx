import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Music,
  Settings,
  ChevronDown,
  ChevronUp,
  Mic,
  AudioWaveform,
  Sliders,
  Plus,
  Trash2,
  LayoutGrid,
  Save,
} from "lucide-react";

interface TrackControlsProps {
  trackId: string;
  name: string;
  instrumentType: string;
  volume: number;
  pan: number;
  effects: Array<{
    id: string;
    type: string;
    settings?: Record<string, any>;
  }>;
  onInstrumentChange: (type: string) => void;
  onVolumeChange: (value: number) => void;
  onPanChange: (value: number) => void;
  onAddEffect: () => void;
  onRemoveEffect: (id: string) => void;
  onSavePreset?: () => void;
}

// Get a color based on instrument type
const getInstrumentColor = (type: string): string => {
  if (type.includes("am")) return "#D95D5D";
  if (type.includes("fm")) return "#5D8CD9";
  if (type.includes("mono")) return "#5DD99B";
  if (type.includes("sampler")) return "#9C5DD9";
  return "#64B5F6";
};

export const TrackControls: React.FC<TrackControlsProps> = ({
  trackId,
  name,
  instrumentType,
  volume,
  pan,
  effects,
  onInstrumentChange,
  onVolumeChange,
  onPanChange,
  onAddEffect,
  onRemoveEffect,
  onSavePreset,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    instrument: true,
    volume: true,
    effects: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="h-full flex flex-col text-[#EEEEEE] overflow-y-auto">
      {/* Header with track name */}
      <div className="py-3 px-4 flex justify-between items-center border-b border-[#333]">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#EEEEEE]">{name}</span>
          <span className="text-xs text-[#999999]">Track controls</span>
        </div>

        {onSavePreset && (
          <button
            onClick={onSavePreset}
            className="w-8 h-8 rounded flex items-center justify-center bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#3A3A3A] transition-colors"
            title="Save track preset"
          >
            <Save size={16} />
          </button>
        )}
      </div>

      {/* Instrument section */}
      <div className="border-b border-[#333]">
        <div
          className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-[#222]"
          onClick={() => toggleSection("instrument")}
        >
          <div className="flex items-center gap-2">
            <Music size={16} className="text-[#64B5F6]" />
            <span className="text-sm font-medium">Instrument</span>
          </div>
          <button>
            {expandedSections.instrument ? (
              <ChevronUp size={16} className="text-[#999999]" />
            ) : (
              <ChevronDown size={16} className="text-[#999999]" />
            )}
          </button>
        </div>

        {expandedSections.instrument && (
          <div className="px-4 pb-4 space-y-3">
            {/* Instrument type selection */}
            <div className="space-y-2">
              <label className="block text-xs text-[#999999] uppercase">
                Type
              </label>
              <div className="relative">
                <select
                  value={instrumentType}
                  onChange={(e) => onInstrumentChange(e.target.value)}
                  className="w-full bg-[#2A2A2A] text-[#EEEEEE] p-2 rounded border border-[#444] outline-none focus:border-[#64B5F6] appearance-none"
                >
                  <option value="amSynth">AM Synth</option>
                  <option value="fmSynth">FM Synth</option>
                  <option value="monoSynth">Mono Synth</option>
                  <option value="sampler">Sampler</option>
                </select>
                <div className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-[#999999]" />
                </div>
              </div>
            </div>

            {/* Oscillator Type (for synths) */}
            {instrumentType.includes("Synth") && (
              <div className="space-y-2">
                <label className="block text-xs text-[#999999] uppercase">
                  Oscillator Type
                </label>
                <div className="relative">
                  <select className="w-full bg-[#2A2A2A] text-[#EEEEEE] p-2 rounded border border-[#444] outline-none focus:border-[#64B5F6] appearance-none">
                    <option value="triangle">Triangle</option>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                  </select>
                  <div className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-[#999999]" />
                  </div>
                </div>
              </div>
            )}

            {/* Instrument visualization */}
            <div
              className="w-full h-16 rounded overflow-hidden border border-[#444]"
              style={{
                borderLeftWidth: "3px",
                borderLeftColor: getInstrumentColor(instrumentType),
              }}
            >
              {instrumentType.includes("Synth") ? (
                <div className="w-full h-full flex items-center justify-center bg-[#2A2A2A]">
                  <svg width="90%" height="60%" viewBox="0 0 100 40">
                    <path
                      d={
                        instrumentType.includes("am")
                          ? "M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20"
                          : instrumentType.includes("fm")
                            ? "M0,20 Q25,5 50,35 Q75,5 100,20"
                            : "M0,35 L25,5 L50,35 L75,5 L100,35"
                      }
                      stroke={getInstrumentColor(instrumentType)}
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#2A2A2A]">
                  <AudioWaveform
                    size={40}
                    className="text-[#9C5DD9] opacity-50"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Volume and Pan section */}
      <div className="border-b border-[#333]">
        <div
          className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-[#222]"
          onClick={() => toggleSection("volume")}
        >
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#FFB74D]" />
            <span className="text-sm font-medium">Volume & Pan</span>
          </div>
          <button>
            {expandedSections.volume ? (
              <ChevronUp size={16} className="text-[#999999]" />
            ) : (
              <ChevronDown size={16} className="text-[#999999]" />
            )}
          </button>
        </div>

        {expandedSections.volume && (
          <div className="px-4 pb-4 space-y-4">
            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#999999] uppercase">
                  Volume
                </label>
                <span className="text-xs text-[#EEEEEE] font-mono">
                  {volume.toFixed(1)} dB
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 h-4 bg-[#2A2A2A] rounded overflow-hidden">
                  <div
                    className="absolute h-full rounded transition-all"
                    style={{
                      width: `${((volume + 60) / 60) * 100}%`,
                      background:
                        "linear-gradient(to right, #64B5F660, #64B5F6)",
                    }}
                  />
                  <input
                    type="range"
                    min="-60"
                    max="0"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Pan Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#999999] uppercase">Pan</label>
                <span className="text-xs text-[#EEEEEE] font-mono">
                  {pan === 0
                    ? "C"
                    : pan < 0
                      ? `L ${Math.abs(pan * 100).toFixed(0)}`
                      : `R ${(pan * 100).toFixed(0)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 h-4 bg-[#2A2A2A] rounded overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 w-px bg-white"
                    style={{
                      left: "50%",
                      opacity: 0.3,
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white rounded-full transition-all"
                    style={{
                      left: `calc(${((pan + 1) / 2) * 100}% - 2px)`,
                    }}
                  />
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={pan}
                    onChange={(e) => onPanChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Effects Section */}
      <div className="border-b border-[#333]">
        <div
          className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-[#222]"
          onClick={() => toggleSection("effects")}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-[#9C5DD9]" />
            <span className="text-sm font-medium">Effects</span>
            <span className="text-xs bg-[#2A2A2A] text-[#999] px-1.5 py-0.5 rounded">
              {effects.length}
            </span>
          </div>
          <button>
            {expandedSections.effects ? (
              <ChevronUp size={16} className="text-[#999999]" />
            ) : (
              <ChevronDown size={16} className="text-[#999999]" />
            )}
          </button>
        </div>

        {expandedSections.effects && (
          <div className="px-4 pb-4 space-y-3">
            {effects.length === 0 ? (
              <div className="text-center py-4 text-sm text-[#999]">
                No effects added yet
              </div>
            ) : (
              <div className="space-y-3">
                {effects.map((effect) => (
                  <div
                    key={effect.id}
                    className="bg-[#252525] rounded overflow-hidden border border-[#444]"
                  >
                    <div className="flex items-center justify-between py-2 px-3 bg-[#2A2A2A]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">
                          {effect.type.charAt(0).toUpperCase() +
                            effect.type.slice(1)}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveEffect(effect.id)}
                        className="p-1 rounded hover:bg-[#444] text-[#999] hover:text-[#EEE] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Effect specific controls - simplified here */}
                    <div className="p-3">
                      {effect.type === "freeverb" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-[#999]">
                                Room Size
                              </label>
                              <span className="text-[10px] text-[#CCC]">
                                {(effect.settings?.roomSize || 0.8).toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#9C5DD9]"
                                style={{
                                  width: `${(effect.settings?.roomSize || 0.8) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-[#999]">
                                Wet
                              </label>
                              <span className="text-[10px] text-[#CCC]">
                                {(effect.settings?.wet || 0.3).toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#9C5DD9]"
                                style={{
                                  width: `${(effect.settings?.wet || 0.3) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {effect.type === "feedbackDelay" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-[#999]">
                                Delay Time
                              </label>
                              <span className="text-[10px] text-[#CCC]">
                                {(
                                  (effect.settings?.delayTime || 0.25) * 1000
                                ).toFixed(0)}
                                ms
                              </span>
                            </div>
                            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#D95DB4]"
                                style={{
                                  width: `${(effect.settings?.delayTime || 0.25) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-[#999]">
                                Feedback
                              </label>
                              <span className="text-[10px] text-[#CCC]">
                                {(effect.settings?.feedback || 0.5).toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#D95DB4]"
                                style={{
                                  width: `${(effect.settings?.feedback || 0.5) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {effect.type === "chorus" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-[#999]">
                                Frequency
                              </label>
                              <span className="text-[10px] text-[#CCC]">
                                {(effect.settings?.frequency || 1.5).toFixed(1)}
                                Hz
                              </span>
                            </div>
                            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5D8CD9]"
                                style={{
                                  width: `${Math.min((effect.settings?.frequency || 1.5) * 10, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-[#999]">
                                Depth
                              </label>
                              <span className="text-[10px] text-[#CCC]">
                                {(effect.settings?.depth || 0.5).toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5D8CD9]"
                                style={{
                                  width: `${(effect.settings?.depth || 0.5) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onAddEffect}
              className="w-full py-2 text-sm bg-[#2A2A2A] text-[#EEEEEE] rounded hover:bg-[#3A3A3A] transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Effect</span>
            </button>
          </div>
        )}
      </div>

      {/* Additional actions */}
      <div className="mt-auto p-4 border-t border-[#333]">
        <div className="flex flex-wrap gap-2">
          <button className="flex-1 py-2 text-sm bg-[#2A2A2A] text-[#EEEEEE] rounded hover:bg-[#3A3A3A] transition-colors flex items-center justify-center gap-1.5">
            <LayoutGrid size={14} />
            <span>Presets</span>
          </button>
          <button className="flex-1 py-2 text-sm bg-[#2A2A2A] text-[#EEEEEE] rounded hover:bg-[#3A3A3A] transition-colors flex items-center justify-center gap-1.5">
            <Mic size={14} />
            <span>Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackControls;
