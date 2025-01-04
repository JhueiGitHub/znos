import React from "react";
import type { StepType } from "reactronica";
import { cn } from "@/lib/utils";

interface StepSequencerProps {
  tracks: Array<{
    name: string;
    steps: StepType[];
    isMuted?: boolean;
    isSolo?: boolean;
  }>;
  currentStepIndex: number;
  selectedTrackIndex: number | null;
  onTrackSelect: (index: number) => void;
}

const NOTES = [
  "B3",
  "A#3",
  "A3",
  "G#3",
  "G3",
  "F#3",
  "F3",
  "E3",
  "D#3",
  "D3",
  "C#3",
  "C3",
];

const STEP_COUNT = 16;
const BEAT_COUNT = 4;
const STEPS_PER_BEAT = STEP_COUNT / BEAT_COUNT;

export const StepSequencer: React.FC<StepSequencerProps> = ({
  tracks,
  currentStepIndex,
  selectedTrackIndex,
  onTrackSelect,
}) => {
  const renderHeader = () => (
    <div className="flex h-12 border-b border-[#4C4F69]/20">
      {/* Track Info Header */}
      <div className="w-[240px] flex items-center px-4 text-[#CCCCCC]/72 border-r border-[#4C4F69]/20">
        TRACK
      </div>

      {/* Step Numbers */}
      <div className="flex-1 flex">
        {Array.from({ length: BEAT_COUNT }).map((_, beatIndex) => (
          <div key={beatIndex} className="flex-1 flex">
            {Array.from({ length: STEPS_PER_BEAT }).map((_, subIndex) => {
              const stepNumber = beatIndex * STEPS_PER_BEAT + subIndex + 1;
              return (
                <div
                  key={stepNumber}
                  className={cn(
                    "flex-1 flex items-center justify-center text-xs text-[#CCCCCC]/50",
                    stepNumber % 4 === 1 && "text-[#CCCCCC]/72"
                  )}
                >
                  {stepNumber}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrack = (track: (typeof tracks)[0], trackIndex: number) => (
    <div
      key={trackIndex}
      className={cn(
        "flex border-b border-[#4C4F69]/20",
        selectedTrackIndex === trackIndex && "bg-[#4C4F69]/10"
      )}
    >
      {/* Track Info */}
      <div
        className="w-[240px] p-4 border-r border-[#4C4F69]/20 hover:bg-[#4C4F69]/5 cursor-pointer"
        onClick={() => onTrackSelect(trackIndex)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#CCCCCC]/72">{track.name}</span>
        </div>
        <div className="flex gap-2">
          <button
            className={cn(
              "w-8 h-8 rounded bg-[#4C4F69]/10 text-[#CCCCCC]/72 hover:bg-[#4C4F69]/20",
              track.isMuted && "bg-[#4C4F69]/30 text-[#CCCCCC]"
            )}
          >
            M
          </button>
          <button
            className={cn(
              "w-8 h-8 rounded bg-[#4C4F69]/10 text-[#CCCCCC]/72 hover:bg-[#4C4F69]/20",
              track.isSolo && "bg-[#4C4F69]/30 text-[#CCCCCC]"
            )}
          >
            S
          </button>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="flex-1 grid grid-rows-12 relative">
        {/* Vertical Beat Lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: BEAT_COUNT }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-[#4C4F69]/20" />
          ))}
        </div>

        {/* Current Step Indicator */}
        {currentStepIndex !== null && (
          <div
            className="absolute top-0 bottom-0 bg-[#4C4F69]/10 transition-all duration-100"
            style={{
              left: `${(currentStepIndex / STEP_COUNT) * 100}%`,
              width: `${(1 / STEP_COUNT) * 100}%`,
            }}
          />
        )}

        {/* Note Grid */}
        {NOTES.map((note, rowIndex) => (
          <div key={note} className="flex">
            {Array.from({ length: STEP_COUNT }).map((_, stepIndex) => {
              const step = track.steps[stepIndex];
              const isNoteActive = Array.isArray(step) && step.includes(note);

              return (
                <div
                  key={stepIndex}
                  className={cn(
                    "flex-1 border-r border-b border-[#4C4F69]/20",
                    isNoteActive && "bg-[#7B6CBD]/30"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#010203]/30">
      {renderHeader()}
      <div className="flex-1 overflow-auto">
        {tracks.map((track, i) => renderTrack(track, i))}
      </div>
    </div>
  );
};
