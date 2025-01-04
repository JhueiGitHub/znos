"use client";

import React from "react";
import { useStyles } from "@/app/hooks/useStyles";

interface TrackControlsProps {
  name: string;
  volume: number;
  pan: number;
  onVolumeChange: (value: number) => void;
  onPanChange: (value: number) => void;
  instrumentType: string;
  onInstrumentChange: (type: string) => void;
}

export const TrackControls = ({
  name,
  volume,
  pan,
  onVolumeChange,
  onPanChange,
  instrumentType,
  onInstrumentChange,
}: TrackControlsProps) => {
  const { getColor } = useStyles();

  return (
    <div
      className="w-64 p-4 flex flex-col gap-4"
      style={{
        borderRight: `1px solid ${getColor("Brd")}`,
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/60">INSTRUMENT</label>
        <select
          value={instrumentType}
          onChange={(e) => onInstrumentChange(e.target.value)}
          className="bg-black/40 text-white p-2 rounded"
        >
          <option value="amSynth">AM Synth</option>
          <option value="fmSynth">FM Synth</option>
          <option value="monoSynth">Mono Synth</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/60">VOLUME</label>
        <input
          type="range"
          min="-60"
          max="0"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/60">PAN</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={pan}
          onChange={(e) => onPanChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};
