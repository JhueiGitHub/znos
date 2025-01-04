import React from "react";
import { cn } from "@/lib/utils";

interface TrackControlsProps {
  trackId: string;
  name: string;
  instrumentType: string;
  volume: number;
  pan: number;
  effects: Array<{
    id: string;
    type: string;
  }>;
  onInstrumentChange: (type: string) => void;
  onVolumeChange: (value: number) => void;
  onPanChange: (value: number) => void;
  onAddEffect: () => void;
  onRemoveEffect: (id: string) => void;
}

export const TrackControls: React.FC<TrackControlsProps> = ({
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
}) => {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Track Name */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#CCCCCC]/72">TRACK</span>
        <span className="text-sm text-[#CCCCCC]/72">{name}</span>
      </div>

      {/* Instrument Selection */}
      <div className="space-y-2">
        <label className="block text-xs text-[#CCCCCC]/72">INSTRUMENT</label>
        <select
          value={instrumentType}
          onChange={(e) => onInstrumentChange(e.target.value)}
          className="w-full bg-[#4C4F69]/10 text-[#CCCCCC]/72 p-2 rounded border border-[#4C4F69]/20 outline-none focus:border-[#7B6CBD]/50"
        >
          <option value="amSynth">AM Synth</option>
          <option value="fmSynth">FM Synth</option>
          <option value="monoSynth">Mono Synth</option>
          <option value="sampler">Sampler</option>
        </select>
      </div>

      {/* Oscillator Type (for synths) */}
      {instrumentType.includes("Synth") && (
        <div className="space-y-2">
          <label className="block text-xs text-[#CCCCCC]/72">
            OSCILLATOR TYPE
          </label>
          <select className="w-full bg-[#4C4F69]/10 text-[#CCCCCC]/72 p-2 rounded border border-[#4C4F69]/20 outline-none focus:border-[#7B6CBD]/50">
            <option value="triangle">Triangle</option>
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
          </select>
        </div>
      )}

      {/* Volume Control */}
      <div className="space-y-2">
        <label className="block text-xs text-[#CCCCCC]/72">VOLUME</label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 h-[3px] bg-white/10 rounded-full">
            <div
              className="absolute h-full rounded-full bg-[#4C4F69] transition-all"
              style={{
                width: `${((volume + 60) / 60) * 100}%`,
                opacity: 0.81,
              }}
            />
            <input
              type="range"
              min="-60"
              max="0"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-[#CCCCCC]/72 w-12 text-right">
            {volume}dB
          </span>
        </div>
      </div>

      {/* Pan Control */}
      <div className="space-y-2">
        <label className="block text-xs text-[#CCCCCC]/72">PAN</label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 h-[3px] bg-white/10 rounded-full">
            <div
              className="absolute h-full rounded-full bg-[#4C4F69] transition-all"
              style={{
                width: `${((pan + 1) / 2) * 100}%`,
                opacity: 0.81,
              }}
            />
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={pan}
              onChange={(e) => onPanChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-[#CCCCCC]/72 w-12 text-right">
            {pan.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Effects Section */}
      <div className="space-y-2">
        <label className="block text-xs text-[#CCCCCC]/72">EFFECTS</label>
        <div className="space-y-2">
          {effects.map((effect) => (
            <div key={effect.id} className="flex items-center gap-2">
              <select
                value={effect.type}
                className="flex-1 bg-[#4C4F69]/10 text-[#CCCCCC]/72 p-2 rounded border border-[#4C4F69]/20 outline-none focus:border-[#7B6CBD]/50"
              >
                <option value="autoFilter">Auto Filter</option>
                <option value="chorus">Chorus</option>
                <option value="freeverb">Freeverb</option>
                <option value="feedbackDelay">Feedback Delay</option>
              </select>
              <button
                onClick={() => onRemoveEffect(effect.id)}
                className="p-2 text-[#CCCCCC]/72 hover:text-[#CCCCCC]/90 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={onAddEffect}
            className="w-full p-2 text-sm text-[#CCCCCC]/72 bg-[#4C4F69]/10 rounded hover:bg-[#4C4F69]/20 transition-colors"
          >
            + Add Effect
          </button>
        </div>
      </div>
    </div>
  );
};
