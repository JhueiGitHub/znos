"use client";

import React from "react";
import { useStyles } from "@/app/hooks/useStyles";
import type { StepType } from "reactronica";

// EVOLVED: Proper note type definitions matching Reactronica
type NoteType = {
  name: string;
  duration?: number;
  velocity?: number;
};

interface DAWGridProps {
  steps: StepType[];
  currentStep: number;
  onStepToggle: (stepIndex: number, note: NoteType) => void;
  notes: string[];
}

export const DAWGrid = ({
  steps,
  currentStep,
  onStepToggle,
  notes,
}: DAWGridProps) => {
  const { getColor } = useStyles();

  // EVOLVED: Helper to check if a note is active in a step
  const isNoteActiveInStep = (step: StepType, noteName: string): boolean => {
    if (!step || !Array.isArray(step)) return false;

    return step.some((note) => {
      if (typeof note === "string") return note === noteName;
      return note.name === noteName;
    });
  };

  // EVOLVED: Helper to create proper note object
  const createNote = (noteName: string): NoteType => ({
    name: noteName,
    duration: 1,
    velocity: 1,
  });

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${steps.length}, 40px)`,
        }}
      >
        {notes.map((note, rowIndex) => (
          <React.Fragment key={note}>
            {steps.map((step, stepIndex) => {
              const isActive = isNoteActiveInStep(step, note);

              return (
                <div
                  key={`${rowIndex}-${stepIndex}`}
                  onClick={() => onStepToggle(stepIndex, createNote(note))}
                  className={`
                    h-8 border border-white/10 cursor-pointer 
                    ${isActive ? "bg-blue-500/50" : "bg-transparent"}
                    ${currentStep === stepIndex ? "border-l-2 border-l-blue-500" : ""}
                  `}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
