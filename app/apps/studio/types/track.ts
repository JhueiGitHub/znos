// app/apps/studio/types/track.ts
import type { StepType } from "reactronica";

export interface TrackEffect {
  id: string;
  type: string;
  settings?: Record<string, any>;
}

export interface TrackInstrument {
  type: string;
  oscillatorType?: "triangle" | "sine" | "square" | "sawtooth";
  polyphony?: number;
  settings?: Record<string, any>;
}

export interface Track {
  id: string;
  name: string;
  steps: StepType[];
  instrument: TrackInstrument;
  volume: number;
  pan: number;
  effects: TrackEffect[];
  isMuted: boolean;
  isSolo: boolean;
}

export type TrackUpdate = Partial<Track>;

export interface TrackState {
  tracks: Track[];
  activeTrackId: string | null;
  currentStepIndex: number;
}
