import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { StepType } from "reactronica";

// Full note range from C0 to C8 - ordered from low to high (bottom to top)
const NOTES = (() => {
  const notes: string[] = [];
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  for (let octave = 0; octave <= 7; octave++) {
    noteNames.forEach((note) => {
      notes.push(`${note}${octave}`);
    });
  }
  return notes.reverse(); // Reverse to display high notes at top
})();

interface PianoRollProps {
  steps: StepType[][];
  onNoteChange: (
    stepIndex: number,
    noteIndex: number,
    value: string | null
  ) => void;
}

export const PianoRoll: React.FC<PianoRollProps> = ({
  steps,
  onNoteChange,
}) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const CELL_HEIGHT = 24; // Height matches Reactronica's grid

  return (
    <div className="flex h-[50vh] bg-[#010203]/30">
      {/* Main scrollable container that wraps both keyboard and grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Keyboard column */}
        <div className="w-24 flex-shrink-0 bg-[#292929] border-r border-[#4C4F69]/20">
          {NOTES.map((note) => {
            const isBlackKey = note.includes("#");
            const noteName = note.slice(0, -1);
            const octave = note.slice(-1);

            return (
              <div
                key={note}
                className={cn(
                  "flex items-center justify-between px-2 select-none",
                  "border-b border-[#4C4F69]/20",
                  isBlackKey
                    ? "bg-[#292929] text-white/50"
                    : "bg-white text-black/70" // Pure white background for white keys
                )}
                style={{ height: CELL_HEIGHT }}
              >
                <span className="text-xs font-medium">{noteName}</span>
                <span className="text-xs opacity-50">{octave}</span>
              </div>
            );
          })}
        </div>

        {/* Grid section */}
        <div className="flex-1 relative">
          <div
            className="grid relative"
            style={{
              gridTemplateColumns: `repeat(${steps.length}, minmax(${CELL_HEIGHT}px, 1fr))`,
              gridTemplateRows: `repeat(${NOTES.length}, ${CELL_HEIGHT}px)`,
            }}
          >
            {/* Background pattern for white/black keys */}
            <div className="absolute inset-0 grid grid-rows-12 pointer-events-none">
              {NOTES.map((note) => (
                <div
                  key={`bg-${note}`}
                  className={cn(
                    "w-full",
                    note.includes("#") ? "bg-[#292929]/10" : "bg-transparent"
                  )}
                />
              ))}
            </div>

            {/* Vertical measure lines */}
            {steps.map((_, stepIndex) => (
              <div
                key={`measure-${stepIndex}`}
                className={cn(
                  "absolute h-full border-r border-[#4C4F69]/20",
                  stepIndex % 4 === 0 && "border-r-[#4C4F69]/40"
                )}
                style={{ left: `${(stepIndex / steps.length) * 100}%` }}
              />
            ))}

            {/* Note cells */}
            {NOTES.map((note, noteIndex) => (
              <React.Fragment key={`row-${note}`}>
                {steps.map((step, stepIndex) => {
                  const isActive = step?.includes(note as StepType);
                  return (
                    <div
                      key={`cell-${stepIndex}-${noteIndex}`}
                      className={cn(
                        "border border-[#4C4F69]/10 cursor-pointer",
                        "hover:bg-[#7B6CBD]/10 transition-colors duration-75",
                        isActive && "bg-[#7B6CBD]/30",
                        selectedStep === stepIndex && "ring-1 ring-[#ABC4C3]/30"
                      )}
                      onMouseDown={() => {
                        setSelectedStep(stepIndex);
                        onNoteChange(
                          stepIndex,
                          noteIndex,
                          isActive ? null : note
                        );
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoRoll;

