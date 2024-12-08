"use client";

import React, { useState } from "react";
import { Song, Track, Instrument, Effect } from "reactronica";
import { useStyles } from "@/app/hooks/useStyles";
import type { StepType } from "reactronica";
import { StepSequencer } from "./components/StepSequencer"; // Added component import

const StudioApp = () => {
  const { getColor, getFont } = useStyles();
  const [isPlaying, setIsPlaying] = useState(false);

  // PRESERVED: All existing state
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

  // PRESERVED: Sample steps with duration
  const [sampleSteps, setSampleSteps] = useState<StepType[]>([
    [
      { name: "C3", duration: 2 },
      { name: "E3", duration: 4 },
      { name: "F3", duration: 2 },
    ],
    { name: "D3", duration: 1 },
    { name: "C3", duration: 2 },
    { name: "D3", duration: 1 },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const allNotes = [
    "C3",
    "C#3",
    "D3",
    "D#3",
    "E3",
    "F3",
    "F#3",
    "G3",
    "G#3",
    "A3",
    "A#3",
    "B3",
  ].reverse();

  // EVOLVED: Handle step toggling for both sequencer and piano roll
  const handleStepToggle = (trackIndex: number, stepIndex: number) => {
    if (trackIndex === 0) {
      const newSteps = [...synthSteps];
      if (Array.isArray(newSteps[stepIndex])) {
        newSteps[stepIndex] = null;
      } else {
        newSteps[stepIndex] = ["C3"];
      }
      setSynthSteps(newSteps);
    } else {
      const newSteps = [...sampleSteps];
      if (Array.isArray(newSteps[stepIndex])) {
        newSteps[stepIndex] = null;
      } else {
        newSteps[stepIndex] = [{ name: "C3", duration: 2 }];
      }
      setSampleSteps(newSteps);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-black/80">
      {/* PRESERVED: DAW Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            REACTRONICA
          </span>
          <span className="text-sm text-white/40">DAW DEMO</span>
        </div>

        {/* PRESERVED: Play control */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
          >
            <div
              className={
                isPlaying
                  ? "w-4 h-4 bg-white/80"
                  : "w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white/80 border-b-8 border-b-transparent"
              }
            />
          </button>
          <div className="flex items-center gap-2">
            <span>70 bpm</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="text-white/60 hover:text-white">
            DOCS
          </a>
          <a href="#" className="text-white/60 hover:text-white">
            @UNKLEHQ
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* PRESERVED: Track List */}
        <div className="w-60 border-r border-white/10">
          {/* Track list content preserved... */}
          <div className="h-12 border-b border-white/10 flex items-center px-4">
            <span className="text-sm">TRACK</span>
          </div>

          <div className="h-32 border-b border-white/10 px-4 py-2">
            <div className="text-sm mb-2">Synth</div>
            <div className="flex gap-2">
              <button className="w-8 h-8 bg-white/5 rounded hover:bg-white/10">
                M
              </button>
              <button className="w-8 h-8 bg-white/5 rounded hover:bg-white/10">
                S
              </button>
            </div>
          </div>
          <div className="h-32 border-b border-white/10 px-4 py-2">
            <div className="text-sm mb-2">Drums</div>
            <div className="flex gap-2">
              <button className="w-8 h-8 bg-white/5 rounded hover:bg-white/10">
                M
              </button>
              <button className="w-8 h-8 bg-white/5 rounded hover:bg-white/10">
                S
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Area */}
        <div className="flex-1 relative">
          {/* Timeline */}
          <div className="h-12 border-b border-white/10 flex">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-full flex items-center justify-center border-r border-white/10 text-white/40 text-sm"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* EVOLVED: Added Step Sequencer */}
          <StepSequencer
            tracks={[
              {
                name: "Synth",
                steps: synthSteps,
              },
              {
                name: "Drums",
                steps: sampleSteps,
              },
            ]}
            currentStepIndex={currentStepIndex}
            onStepClick={handleStepToggle}
          />

          {/* PRESERVED: Piano Roll */}
          <div className="flex-1 p-4">
            <div className="flex">
              <div className="w-16 flex flex-col border-r border-white/10">
                {allNotes.map((note) => (
                  <div
                    key={note}
                    className="h-8 flex items-center justify-center text-white/50 text-sm"
                  >
                    {note}
                  </div>
                ))}
              </div>

              <div className="flex-1 relative">
                {allNotes.map((_, i) => (
                  <div key={i} className="h-8 border-b border-white/10" />
                ))}

                <div className="absolute inset-0 grid grid-cols-8 gap-px">
                  {synthSteps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className={`relative ${
                        currentStepIndex === stepIndex
                          ? "bg-white/10"
                          : "bg-transparent"
                      }`}
                    >
                      {Array.isArray(step) &&
                        step.map((note, noteIndex) => {
                          const noteY =
                            allNotes.indexOf(
                              typeof note === "string" ? note : note.name
                            ) * 32;
                          return (
                            <div
                              key={`${stepIndex}-${noteIndex}`}
                              className="absolute h-7 left-0 right-0 bg-blue-500/50"
                              style={{ top: `${noteY}px` }}
                            />
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRESERVED: Track Controls */}
        <div className="w-60 border-l border-white/10">
          <div className="h-12 border-b border-white/10 flex items-center px-4">
            <span className="text-sm">CONTROLS</span>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-white/60">INSTRUMENT</label>
              <select className="w-full bg-white/5 p-2 rounded">
                <option>AM Synth</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">VOLUME</label>
              <div className="h-2 bg-white/10 rounded">
                <div className="h-full w-1/2 bg-blue-500 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRESERVED: Reactronica engine */}
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

        <Track steps={sampleSteps}>
          <Instrument
            type="sampler"
            samples={{
              C3: "/apps/studio/audio/kick.wav",
              D3: "/apps/studio/audio/snare.wav",
              E3: "/apps/studio/audio/hihat-loop.wav",
              F3: "/apps/studio/audio/sub.wav",
            }}
            onLoad={() => {
              console.log("Samples loaded");
            }}
          />
        </Track>
      </Song>
    </div>
  );
};

export default StudioApp;
