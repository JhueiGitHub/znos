import React, { useState, useCallback } from "react";
import { Song, Track, Instrument, Effect } from "reactronica";
import { StepSequencer } from "./components/StepSequencer";
import { TrackControls } from "./components/TrackControls";
import type { StepType, StepNoteType } from "reactronica"; // Added StepNoteType import
import { cn } from "@/lib/utils";
import { PianoRoll } from "./components/PianoRoll";

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

// Define proper types for tracks
interface TrackData {
  name: string;
  steps: StepType[]; // Changed from (string[] | null)[]
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  instrumentType: string;
  effects: Array<{ id: string; type: string }>;
}

const StudioApp = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(
    null
  );

  const handleNoteChange = useCallback(
    (
      trackIndex: number | null,
      stepIndex: number,
      noteIndex: number,
      value: string | null
    ) => {
      if (trackIndex === null) return;

      setTracks((prev) =>
        prev.map((track, i) =>
          i === trackIndex
            ? {
                ...track,
                steps: track.steps.map((step, j) =>
                  j === stepIndex
                    ? value
                      ? Array.isArray(step)
                        ? step.some((note) =>
                            typeof note === "string"
                              ? note === value
                              : note.name === value
                          )
                          ? (step.filter((note) =>
                              typeof note === "string"
                                ? note !== value
                                : note.name !== value
                            ) as StepType)
                          : ([...step, { name: value }] as StepType)
                        : ([{ name: value }] as StepType)
                      : step
                    : step
                ),
              }
            : track
        )
      );
    },
    []
  );

  // Properly typed tracks state
  const [tracks, setTracks] = useState<TrackData[]>([
    {
      name: "Synth",
      steps: [
        ["A3", "E3", "C3"],
        null,
        ["F3", "A3", "C3"],
        null,
        ["D3", "F3", "A3"],
        null,
        ["E3", "G3", "B3"],
        null,
      ],
      volume: -12,
      pan: 0,
      isMuted: false,
      isSolo: false,
      instrumentType: "amSynth",
      effects: [{ id: "effect-1", type: "freeverb" }],
    },
    {
      name: "Drums",
      steps: [["C2"], ["E2"], ["D2"], ["E2"], null, null, null, null],
      volume: -12,
      pan: 0,
      isMuted: false,
      isSolo: false,
      instrumentType: "sampler",
      effects: [],
    },
  ]);

  const handleVolumeChange = useCallback((index: number, value: number) => {
    setTracks((prev) =>
      prev.map((track, i) =>
        i === index ? { ...track, volume: value } : track
      )
    );
  }, []);

  const handlePanChange = useCallback((index: number, value: number) => {
    setTracks((prev) =>
      prev.map((track, i) => (i === index ? { ...track, pan: value } : track))
    );
  }, []);

  const handleMuteToggle = useCallback((index: number) => {
    setTracks((prev) =>
      prev.map((track, i) =>
        i === index
          ? { ...track, isMuted: !track.isMuted, isSolo: false }
          : track
      )
    );
  }, []);

  const handleSoloToggle = useCallback((index: number) => {
    setTracks((prev) =>
      prev.map((track, i) =>
        i === index
          ? { ...track, isSolo: !track.isSolo, isMuted: false }
          : { ...track, isMuted: true }
      )
    );
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-black/80">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold bg-gradient-to-r from-[#7B6CBD] to-[#003431] text-transparent bg-clip-text">
            REACTRONICA
          </span>
          <span className="text-sm text-[#626581]">DAW DEMO</span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-[#4C4F69]/10 flex items-center justify-center hover:bg-[#4C4F69]/20"
          >
            <div
              className={cn(
                "transition-all",
                isPlaying
                  ? "w-4 h-4 bg-white/80"
                  : "w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white/80 border-b-8 border-b-transparent"
              )}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#626581]">70 bpm</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[#626581] hover:text-white/80 transition-colors">
            DOCS
          </span>
          <span className="text-[#626581] hover:text-white/80 transition-colors">
            @UNKLEHQ
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Track Controls - Left Sidebar */}
        <div className="w-[240px] border-r border-[#4C4F69]/20 bg-[#010203]/30">
          {selectedTrackIndex !== null ? (
            <TrackControls
              trackId={selectedTrackIndex.toString()}
              name={tracks[selectedTrackIndex].name}
              instrumentType={tracks[selectedTrackIndex].instrumentType}
              volume={tracks[selectedTrackIndex].volume}
              pan={tracks[selectedTrackIndex].pan}
              effects={tracks[selectedTrackIndex].effects}
              onVolumeChange={(value) =>
                handleVolumeChange(selectedTrackIndex, value)
              }
              onPanChange={(value) =>
                handlePanChange(selectedTrackIndex, value)
              }
              onInstrumentChange={() => {}}
              onAddEffect={() => {}}
              onRemoveEffect={() => {}}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[#CCCCCC]/72">
              Select a track to view controls
            </div>
          )}
        </div>

        {/* Step Sequencer */}
        <div className="flex-1">
          <div className="w-full h-full flex flex-col bg-rose-500/0">
            <StepSequencer
              tracks={tracks}
              currentStepIndex={currentStepIndex}
              selectedTrackIndex={selectedTrackIndex}
              onTrackSelect={setSelectedTrackIndex}
            />
            {selectedTrackIndex !== null && (
              <PianoRoll
                steps={tracks[selectedTrackIndex].steps as StepType[][]}
                onNoteChange={(stepIndex, noteIndex, value) =>
                  handleNoteChange(
                    selectedTrackIndex,
                    stepIndex,
                    noteIndex,
                    value
                  )
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Reactronica Engine */}
      <Song isPlaying={isPlaying} bpm={70}>
        <Track
          steps={tracks[0].steps}
          volume={tracks[0].volume}
          pan={tracks[0].pan}
          mute={tracks[0].isMuted}
          solo={tracks[0].isSolo}
          onStepPlay={(_, index) => setCurrentStepIndex(index)}
        >
          <Instrument type="amSynth" />
          <Effect type="freeverb" />
        </Track>

        <Track
          steps={tracks[1].steps}
          volume={tracks[1].volume}
          pan={tracks[1].pan}
          mute={tracks[1].isMuted}
          solo={tracks[1].isSolo}
        >
          <Instrument
            type="sampler"
            samples={{
              C2: "/apps/studio/audio/kick.wav",
              D2: "/apps/studio/audio/snare.wav",
              E2: "/apps/studio/audio/hihat-loop.wav",
            }}
          />
        </Track>
      </Song>
    </div>
  );
};

export default StudioApp;
