"use client";

import React, { useState } from "react";
import { Song, Track, Instrument, Effect } from "reactronica";
import { useStyles } from "@/app/hooks/useStyles";
import type { StepType } from "reactronica";

// EVOLVED: Base DAW component with initial song setup
const StudioApp = () => {
  const { getColor, getFont } = useStyles();
  const [isPlaying, setIsPlaying] = useState(false);

  // EVOLVED: Using Reactronica's own StepType
  const [synthSteps, setSynthSteps] = useState<StepType[]>([
    ["A3", "E3", "C3"],
    null,
    ["F3", "A3", "C3"],
    null,
    ["D3", "F3", "A3"],
    null,
    ["E3", "G3", "B3"],
    null,
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{
        color: getColor("Text Primary (Hd)"),
        fontFamily: getFont("Text Primary"),
      }}
    >
      <div className="flex items-center p-4 border-b border-white/10">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-8 gap-1">
          {synthSteps.map((step, i) => (
            <div
              key={i}
              className={`h-32 rounded-md ${
                currentStepIndex === i ? "bg-white/20" : "bg-white/5"
              }`}
            >
              {Array.isArray(step) &&
                step.map((note, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="px-2 py-1 m-1 rounded bg-white/20"
                  >
                    {typeof note === "string" ? note : note.name}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      <Song isPlaying={isPlaying} bpm={70}>
        <Track
          steps={synthSteps}
          onStepPlay={(_, index) => {
            setCurrentStepIndex(index);
          }}
        >
          <Instrument type="amSynth" />
          <Effect type="freeverb" />
        </Track>

        <Track steps={[["C3", "E3", "F3"], "D3", "C3", "D3"]}>
          <Instrument
            type="sampler"
            samples={{
              C3: "/audio/kick.wav",
              D3: "/audio/snare.wav",
              E3: "/audio/hihat-loop.wav",
              F3: "/audio/sub.wav",
            }}
          />
        </Track>
      </Song>
    </div>
  );
};

export default StudioApp;
