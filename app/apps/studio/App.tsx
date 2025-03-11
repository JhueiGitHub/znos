// app/apps/studio/App.tsx - Fixed version of the main component
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Song, Track, Instrument, Effect } from "reactronica";
import type {
  StepType,
  StepNoteType,
  InstrumentType,
  EffectType,
} from "reactronica";
import { cn } from "@/lib/utils";
import { useTracks } from "./hooks/useTracks";
import { DAWHeader } from "./components/DAWHeader";
import { StepSequencer } from "./components/StepSequencer";
import { TrackControls } from "./components/TrackControls";
import { PianoRoll } from "./components/PianoRoll";
import { TransportControls } from "./components/TransportControls";
import { MixerPanel } from "./components/MixerPanel";
import { PatternBank } from "./components/PatternBank";
import { TimelineDisplay } from "./components/TimelineDisplay";
import { AudioEffectsRack } from "./components/AudioEffectsRack";
import { Toaster } from "sonner";
import { useWindowSize } from "./hooks/useWindowSize";
import { useStyles } from "@/app/hooks/useStyles";
import { useAudioStore } from "./hooks/useAudioStore";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useMidiInput } from "./hooks/useMidiInput";
import { DEFAULT_TRACKS } from "./constants/defaultTracks";
import { AUDIO_SAMPLES } from "./constants/audioSamples";
import { Track as TrackType } from "./types/track";
import { ViewMode, PanelLayout } from "./types/daw";
import type { MidiNote } from "reactronica";

const StudioApp = () => {
  // Hooks
  const { width } = useWindowSize();
  const { getColor } = useStyles();
  const { isDragging, dragRef } = useDragAndDrop();
  const { midiNotes, midiDevices } = useMidiInput();

  // State management with custom hooks
  const {
    tracks,
    activeTrackId,
    setActiveTrackId,
    updateTrack,
    addTrack,
    removeTrack,
    toggleTrackMute,
    toggleTrackSolo,
    addEffect,
    removeEffect,
  } = useTracks(DEFAULT_TRACKS);

  const {
    isPlaying,
    togglePlayback,
    setBpm,
    bpm,
    setCurrentStepIndex,
    currentStepIndex,
    volume,
    setVolume,
    audioContext,
    recorder,
    isRecording,
    toggleRecording,
    exportAudio,
  } = useAudioStore();

  // Local state for UI
  const [viewMode, setViewMode] = useState<ViewMode>("sequencer");
  const [panelLayout, setPanelLayout] = useState<PanelLayout>("standard");
  const [showMixer, setShowMixer] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [quantizeValue, setQuantizeValue] = useState<string>("8n");
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [historySteps, setHistorySteps] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Active track data
  const activeTrack = useMemo(() => {
    return tracks.find((track) => track.id === activeTrackId) || null;
  }, [tracks, activeTrackId]);

  // Handle MIDI input
  useEffect(() => {
    if (midiNotes.length > 0 && activeTrackId) {
      // Update track with incoming MIDI notes
      // This would be more complex in a real implementation
      console.log("MIDI notes received:", midiNotes);
    }
  }, [midiNotes, activeTrackId]);

  // Fixed type-safe step change handler
  const handleStepChange = useCallback(
    (trackId: string, stepIndex: number, newStep: StepType) => {
      // Add to history for undo/redo
      const newHistoryStep = {
        trackId,
        stepIndex,
        oldStep: tracks.find((t) => t.id === trackId)?.steps[stepIndex] || null,
        newStep,
      };

      setHistorySteps((prev) => [
        ...prev.slice(0, historyIndex + 1),
        newHistoryStep,
      ]);
      setHistoryIndex((prev) => prev + 1);

      // Update track
      const track = tracks.find((t) => t.id === trackId);
      if (track) {
        const updatedSteps = [...track.steps];
        updatedSteps[stepIndex] = newStep;

        updateTrack(trackId, {
          steps: updatedSteps,
        });
      }
    },
    [tracks, updateTrack, historyIndex]
  );

  // Fixed piano roll note change handler
  // Fix for the handlePianoRollChange function in App.tsx
  const handlePianoRollChange = useCallback(
    (stepIndex: number, noteIndex: number, value: string | null) => {
      if (!activeTrackId) return;

      const track = tracks.find((t) => t.id === activeTrackId);
      if (!track) return;

      const currentStep = track.steps[stepIndex];
      let newStep: StepType;

      if (value === null) {
        // Remove note
        if (Array.isArray(currentStep)) {
          // Find note at this position and remove it
          const filteredNotes = currentStep.filter(
            (note, idx) => idx !== noteIndex
          );
          newStep = filteredNotes.length > 0 ? filteredNotes : null;
        } else {
          // Single note or null
          newStep = null;
        }
      } else {
        // Ensure value is a valid MidiNote before adding
        // Create a proper StepNoteType object instead of just using the string
        const noteObject: StepNoteType = {
          name: value as MidiNote, // Cast to MidiNote since we know it's coming from our valid note list
        };

        // Add note
        if (!currentStep) {
          // No notes yet
          newStep = [noteObject];
        } else if (Array.isArray(currentStep)) {
          // Already has notes - ensure all elements are StepNoteType objects
          const typedCurrentStep = currentStep.map((note) =>
            typeof note === "string" ? { name: note as MidiNote } : note
          );
          newStep = [...typedCurrentStep, noteObject];
        } else {
          // Has a single note - convert to StepNoteType if it's a string
          const typedCurrentNote =
            typeof currentStep === "string"
              ? { name: currentStep as MidiNote }
              : currentStep;
          newStep = [typedCurrentNote, noteObject];
        }
      }

      handleStepChange(activeTrackId, stepIndex, newStep);
    },
    [activeTrackId, tracks, handleStepChange]
  );

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const step = historySteps[historyIndex];
      updateTrack(step.trackId, {
        steps:
          tracks
            .find((t) => t.id === step.trackId)
            ?.steps.map((s, i) => (i === step.stepIndex ? step.oldStep : s)) ||
          [],
      });
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, historySteps, tracks, updateTrack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historySteps.length - 1) {
      const step = historySteps[historyIndex + 1];
      updateTrack(step.trackId, {
        steps:
          tracks
            .find((t) => t.id === step.trackId)
            ?.steps.map((s, i) => (i === step.stepIndex ? step.newStep : s)) ||
          [],
      });
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, historySteps, tracks, updateTrack]);

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Playback
      if (e.key === " ") {
        e.preventDefault();
        togglePlayback();
      }

      // Undo/Redo
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      // Recording
      if (e.key === "r" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleRecording();
      }

      // Changing view modes
      if (e.key === "1") setViewMode("sequencer");
      if (e.key === "2") setViewMode("pianoRoll");
      if (e.key === "3") setViewMode("mixer");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayback, handleUndo, handleRedo, toggleRecording]);

  return (
    <div className="h-full w-full flex flex-col bg-black/80 text-white">
      <DAWHeader
        title="REACTRONICA"
        subtitle="DAW DEMO"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        isRecording={isRecording}
        onRecordingToggle={toggleRecording}
        onExport={exportAudio}
      />

      <div className="flex-1 flex">
        {/* Main content area with conditional rendering based on viewMode */}
        <div className="flex-1 flex flex-col">
          <TransportControls
            isPlaying={isPlaying}
            onPlayPauseToggle={togglePlayback}
            bpm={bpm}
            onBpmChange={setBpm}
            currentStep={currentStepIndex}
            totalSteps={16}
            isRecording={isRecording}
            onRecordingToggle={toggleRecording}
            onUndo={handleUndo}
            onRedo={handleRedo}
            quantizeValue={quantizeValue}
            onQuantizeChange={setQuantizeValue}
            snapToGrid={snapToGrid}
            onSnapToGridChange={setSnapToGrid}
          />

          <TimelineDisplay
            currentStep={currentStepIndex}
            totalSteps={16}
            bpm={bpm}
            zoomLevel={zoomLevel}
          />

          {viewMode === "sequencer" && (
            <StepSequencer
              tracks={tracks}
              currentStepIndex={currentStepIndex}
              selectedTrackIndex={activeTrackId}
              onTrackSelect={setActiveTrackId}
              onTrackAdd={addTrack}
              onTrackRemove={removeTrack}
              onTrackMute={toggleTrackMute}
              onTrackSolo={toggleTrackSolo}
              onStepChange={handleStepChange}
              zoomLevel={zoomLevel}
            />
          )}

          {viewMode === "pianoRoll" && activeTrack && (
            <PianoRoll
              steps={activeTrack.steps}
              trackId={activeTrack.id}
              onStepChange={handlePianoRollChange}
              zoomLevel={zoomLevel}
              quantizeValue={quantizeValue}
              snapToGrid={snapToGrid}
            />
          )}

          {viewMode === "mixer" && (
            <MixerPanel
              tracks={tracks}
              onVolumeChange={(trackId, volume) =>
                updateTrack(trackId, { volume })
              }
              onPanChange={(trackId, pan) => updateTrack(trackId, { pan })}
              onTrackMute={toggleTrackMute}
              onTrackSolo={toggleTrackSolo}
              onTrackSelect={setActiveTrackId}
              activeTrackId={activeTrackId}
              masterVolume={volume}
              onMasterVolumeChange={setVolume}
            />
          )}
        </div>

        {/* Right sidebar - Patterns or Track Controls depending on mode */}
        <div className="w-[300px] border-l border-[#4C4F69]/20 bg-[#010203]/30 flex flex-col">
          {viewMode === "sequencer" && !activeTrackId && (
            <PatternBank
              patterns={
                [
                  /* Pattern data here */
                ]
              }
              selectedPattern={selectedPattern}
              onPatternSelect={setSelectedPattern}
            />
          )}

          {activeTrackId && activeTrack && (
            <div className="flex-1 flex flex-col">
              <TrackControls
                trackId={activeTrackId}
                name={activeTrack.name}
                instrumentType={activeTrack.instrument.type}
                volume={activeTrack.volume}
                pan={activeTrack.pan}
                effects={activeTrack.effects}
                onInstrumentChange={(type) =>
                  updateTrack(activeTrackId, {
                    instrument: {
                      ...activeTrack.instrument,
                      type: type as any,
                    },
                  })
                }
                onVolumeChange={(value) =>
                  updateTrack(activeTrackId, { volume: value })
                }
                onPanChange={(value) =>
                  updateTrack(activeTrackId, { pan: value })
                }
                onAddEffect={() => activeTrackId && addEffect(activeTrackId)}
                onRemoveEffect={(id) =>
                  activeTrackId && removeEffect(activeTrackId, id)
                }
              />

              {activeTrack.effects.length > 0 && (
                <AudioEffectsRack
                  effects={activeTrack.effects}
                  onEffectChange={(id, type, settings) => {
                    if (!activeTrackId) return;

                    const updatedEffects = activeTrack.effects.map((effect) =>
                      effect.id === id
                        ? {
                            ...effect,
                            type,
                            settings: { ...effect.settings, ...settings },
                          }
                        : effect
                    );
                    updateTrack(activeTrackId, { effects: updatedEffects });
                  }}
                  onEffectRemove={(id) =>
                    activeTrackId && removeEffect(activeTrackId, id)
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reactronica Engine - Fixed type issues */}
      <Song isPlaying={isPlaying} bpm={bpm}>
        {tracks.map((track) => (
          <Track
            key={track.id}
            steps={track.steps}
            volume={track.volume}
            pan={track.pan}
            mute={track.isMuted}
            solo={track.isSolo}
            onStepPlay={(_, index) => setCurrentStepIndex(index)}
          >
            <Instrument
              type={track.instrument.type as InstrumentType}
              options={track.instrument.settings || {}}
              // Handle sampler instruments
              {...(track.instrument.type === "sampler"
                ? {
                    samples:
                      track.instrument.settings?.samples || AUDIO_SAMPLES,
                  }
                : {})}
            />

            {/* Map effects with proper typing */}
            {track.effects.map((effect) => (
              <Effect
                key={effect.id}
                type={effect.type as EffectType}
                {...(effect.settings || {})}
              />
            ))}
          </Track>
        ))}
      </Song>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: getColor("Glass"),
            border: `1px solid ${getColor("Brd")}`,
            color: getColor("Text Primary (Hd)"),
          },
        }}
      />
    </div>
  );
};

export default StudioApp;
