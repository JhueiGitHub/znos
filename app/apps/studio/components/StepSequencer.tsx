"use client";

import React from "react";
import { useStyles } from "@/app/hooks/useStyles";
import type { StepType } from "reactronica";

interface StepSequencerProps {
  tracks: Array<{
    name: string;
    steps: StepType[];
  }>;
  currentStepIndex: number;
  onStepClick?: (trackIndex: number, stepIndex: number) => void;
}

export const StepSequencer = ({
  tracks,
  currentStepIndex,
  onStepClick,
}: StepSequencerProps) => {
  const { getColor } = useStyles();

  return (
    <div
      className="w-full border-b border-white/10"
      style={{ backgroundColor: getColor("Black") }}
    >
      {tracks.map((track, trackIndex) => (
        <div key={track.name} className="relative">
          {/* Track Header */}
          <div className="flex items-center h-8 px-4 bg-black/20">
            <span className="text-sm text-white/60">{track.name}</span>
            {/* Track Controls */}
            <div className="ml-auto flex gap-2">
              <button className="w-6 h-6 bg-white/5 rounded text-xs">M</button>
              <button className="w-6 h-6 bg-white/5 rounded text-xs">S</button>
            </div>
          </div>

          {/* Step Grid */}
          <div className="flex h-12 border-t border-white/10">
            {Array.from({ length: 32 }).map((_, stepIndex) => {
              const hasNote = Array.isArray(track.steps[stepIndex])
                ? track.steps[stepIndex].length > 0
                : track.steps[stepIndex] !== null;

              return (
                <div
                  key={stepIndex}
                  className={`
                    flex-1 border-r border-white/10 relative
                    ${currentStepIndex === stepIndex ? "bg-white/10" : ""}
                  `}
                  onClick={() => onStepClick?.(trackIndex, stepIndex)}
                >
                  {hasNote && (
                    <div
                      className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-2 rounded"
                      style={{ backgroundColor: getColor("Lilac Accent") }}
                    />
                  )}
                  {/* Bar marker every 4 steps */}
                  {stepIndex % 4 === 0 && (
                    <div className="absolute top-0 left-0 w-px h-full bg-white/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
