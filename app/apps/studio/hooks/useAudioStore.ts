// app/apps/studio/hooks/useAudioStore.ts
import { useState, useCallback, useRef, useEffect } from "react";
import * as Tone from "tone";

export const useAudioStore = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [volume, setVolume] = useState(-6);
  const [isRecording, setIsRecording] = useState(false);

  // Audio context and recorder references
  // Use BaseAudioContext instead of AudioContext to handle both standard and offline contexts
  const audioContextRef = useRef<BaseAudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = Tone.getContext().rawContext;

      // Set default master volume
      Tone.Destination.volume.value = volume;
    }

    return () => {
      // Clean up on unmount
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
    };
  }, []);

  // Update Tone.js master volume when volume changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      Tone.Destination.volume.value = volume;
    }
  }, [volume]);

  // Update Tone.js BPM when BPM changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      Tone.Transport.bpm.value = bpm;
    }
  }, [bpm]);

  // Handle transport state changes
  const togglePlayback = useCallback(() => {
    if (typeof window === "undefined") return;

    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      // Ensure audio context is running
      if (Tone.context.state !== "running") {
        Tone.context.resume();
      }

      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, []);

  // Setup and handle recording
  const toggleRecording = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      if (!isRecording) {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          console.log("Recording stopped");
        };

        recorderRef.current = recorder;
        recordedChunksRef.current = [];
        recorder.start();
        setIsRecording(true);

        // Also start playback if not already playing
        if (!isPlaying) {
          togglePlayback();
        }
      } else {
        // Stop recording
        if (recorderRef.current && recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
        setIsRecording(false);
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  }, [isRecording, isPlaying, togglePlayback]);

  // Export the recorded audio
  const exportAudio = useCallback(() => {
    if (recordedChunksRef.current.length === 0) {
      console.warn("No recorded audio to export");
      return;
    }

    const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;
    a.download = `recording-${new Date().toISOString()}.webm`;
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    recordedChunksRef.current = [];
  }, []);

  return {
    isPlaying,
    togglePlayback,
    setBpm,
    bpm,
    setCurrentStepIndex,
    currentStepIndex,
    volume,
    setVolume,
    audioContext: audioContextRef.current,
    recorder: recorderRef.current,
    isRecording,
    toggleRecording,
    exportAudio,
  };
};
