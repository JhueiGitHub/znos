// app/apps/studio/hooks/useTracks.ts
import { useState, useCallback } from "react";
import type { Track, TrackUpdate } from "../types/track";
import { v4 as uuidv4 } from "uuid";

export const useTracks = (initialTracks: Track[]) => {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const updateTrack = useCallback((trackId: string, update: TrackUpdate) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, ...update } : track
      )
    );
  }, []);

  const addTrack = useCallback(
    (trackData: Partial<Track> = {}) => {
      const newTrack: Track = {
        id: uuidv4(),
        name: `Track ${tracks.length + 1}`,
        steps: Array(16).fill(null), // Default 16 empty steps
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
          : track.isSolo
            ? { ...track, isSolo: false }
            : track
      )
    );
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setTracks((prev) => {
      const currentTrack = prev.find((t) => t.id === trackId);
      const isSoloActive = currentTrack?.isSolo || false;

      // If un-soloing, unmute all tracks
      if (isSoloActive) {
        return prev.map((track) => ({
          ...track,
          isSolo: false,
          isMuted: false,
        }));
      }

      // If soloing, mute all other tracks
      return prev.map((track) =>
        track.id === trackId
          ? { ...track, isSolo: true, isMuted: false }
          : { ...track, isSolo: false, isMuted: true }
      );
    });
  }, []);

  const addEffect = useCallback((trackId: string, effectType = "freeverb") => {
    setTracks((prev) => {
      const track = prev.find((t) => t.id === trackId);
      if (!track) return prev;

      return prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              effects: [
                ...t.effects,
                {
                  id: uuidv4(),
                  type: effectType,
                  settings: getDefaultEffectSettings(effectType),
                },
              ],
            }
          : t
      );
    });
  }, []);

  const removeEffect = useCallback((trackId: string, effectId: string) => {
    setTracks((prev) => {
      const track = prev.find((t) => t.id === trackId);
      if (!track) return prev;

      return prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              effects: t.effects.filter((e) => e.id !== effectId),
            }
          : t
      );
    });
  }, []);

  const getDefaultEffectSettings = (effectType: string) => {
    switch (effectType) {
      case "freeverb":
        return {
          roomSize: 0.7,
          dampening: 0.5,
          wet: 0.3,
          dry: 0.5,
        };
      case "feedbackDelay":
        return {
          delayTime: 0.25,
          feedback: 0.5,
          wet: 0.3,
        };
      case "chorus":
        return {
          frequency: 1.5,
          delayTime: 0.01,
          depth: 0.5,
          wet: 0.5,
        };
      case "distortion":
        return {
          distortion: 0.4,
          wet: 0.5,
        };
      case "autoFilter":
        return {
          frequency: 1,
          type: "sine",
          depth: 1,
          baseFrequency: 200,
          octaves: 2.6,
          wet: 0.5,
        };
      default:
        return {};
    }
  };

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
