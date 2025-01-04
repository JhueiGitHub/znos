// /root/app/apps/studio/components/PianoRoll.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { StepType } from "reactronica";

interface PianoRollProps {
  notes: string[];
  steps: StepType[][];
  onNoteChange: (
    stepIndex: number,
    noteIndex: number,
    value: string | null
  ) => void;
}

export const PianoRoll: React.FC<PianoRollProps> = ({
  notes,
  steps,
  onNoteChange,
}) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const renderKey = (note: string) => {
    // Use the updated renderKey function here
    const isBlackKey = note.includes("#");
    const octave = parseInt(note.slice(-1));
    const noteName = note.slice(0, -1);

    return (
      <div
        key={note}
        className={cn(
          "flex items-end justify-center text-xs select-none",
          isBlackKey
            ? "w-6 h-16 bg-[#1E1E1E] text-[#CCCCCC]/50 z-10 relative mx-[-0.5rem]"
            : "flex-1 h-24 bg-white text-[#1E1E1E] border border-[#1E1E1E]/10"
        )}
        style={{
          marginTop: isBlackKey ? "-3rem" : 0,
        }}
      >
        <div className="pb-1">{noteName}</div>
        <div className="text-xs mt-1 text-[#CCCCCC]/80">{octave}</div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-auto">
      {/* Keyboard */}
      <div className="w-[135px] flex flex-col bg-[#010203]/30 border-r border-[#4C4F69]/20">
        <div className="flex flex-col h-full">
          {notes.map((note) => (
            <React.Fragment key={note}>{renderKey(note)}</React.Fragment>
          ))}
        </div>
      </div>

      {/* Piano Roll Grid */}
      <div
        className="flex-1 grid"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
      >
        {notes.map((note, noteIndex) => (
          <React.Fragment key={note}>
            {steps.map((step, stepIndex) => {
              const isActive = step?.includes(note as StepType) || false;
              return (
                <div
                  key={`${stepIndex}-${noteIndex}`}
                  className={cn(
                    "border border-[#4C4F69]/20 cursor-pointer hover:bg-[#7B6CBD]/10",
                    isActive && "bg-[#7B6CBD]/30",
                    selectedStep === stepIndex && "ring-2 ring-[#ABC4C3]/50"
                  )}
                  onMouseDown={() => {
                    setSelectedStep(stepIndex);
                    onNoteChange(stepIndex, noteIndex, isActive ? null : note);
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
