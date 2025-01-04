// hooks/useTracks.ts
import { useState, useCallback } from "react";
import type { Track, TrackUpdate } from "../types/track";
import { v4 as uuidv4 } from "uuid";

export const useTracks = (initialTracks: Track[]) => {
  const [tracks, setTracks] = useState(initialTracks);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const updateTrack = useCallback((trackId: string, update: TrackUpdate) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, ...update } : track
      )
    );
  }, []);

  const addTrack = useCallback(
    (trackData: Partial<Track>) => {
      const newTrack: Track = {
        id: uuidv4(),
        name: `Track ${tracks.length + 1}`,
        steps: [],
        instrument: {
          type: "amSynth",
          oscillatorType: "triangle",
        },
        volume: -12,
        pan: 0,
        effects: [],
        isMuted: false,
        isSolo: false,
        ...trackData,
      };

      setTracks((prev) => [...prev, newTrack]);
      return newTrack.id;
    },
    [tracks]
  );

  const removeTrack = useCallback(
    (trackId: string) => {
      setTracks((prev) => prev.filter((track) => track.id !== trackId));
      if (activeTrackId === trackId) {
        setActiveTrackId(null);
      }
    },
    [activeTrackId]
  );

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? { ...track, isMuted: !track.isMuted, isSolo: false }
          : track
      )
    );
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? { ...track, isSolo: !track.isSolo, isMuted: false }
          : { ...track, isMuted: true }
      )
    );
  }, []);

  const addEffect = useCallback(
    (trackId: string, effectType = "freeverb") => {
      updateTrack(trackId, {
        effects: [
          ...(tracks.find((t) => t.id === trackId)?.effects || []),
          { id: uuidv4(), type: effectType },
        ],
      });
    },
    [tracks, updateTrack]
  );

  const removeEffect = useCallback(
    (trackId: string, effectId: string) => {
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      updateTrack(trackId, {
        effects: track.effects.filter((e) => e.id !== effectId),
      });
    },
    [tracks, updateTrack]
  );

  return {
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
  };
};
