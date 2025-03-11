// app/apps/studio/types/daw.ts
import { StepType } from "reactronica";

// UI View modes
export type ViewMode = "sequencer" | "pianoRoll" | "mixer";

// Layout options
export type PanelLayout = "standard" | "wide" | "compact" | "full";

// Export format options
export type ExportFormat = "wav" | "mp3" | "midi" | "json";

export interface TrackConfig {
  id: string;
  name: string;
  instrument: {
    type: string;
    oscillatorType?: string;
    polyphony?: number;
    settings?: Record<string, any>;
  };
  volume: number;
  pan: number;
  effects: Array<{
    type: string;
    settings?: Record<string, any>;
  }>;
  steps: StepType[];
  isMuted?: boolean;
  isSolo?: boolean;
}

export interface Pattern {
  id: string;
  name: string;
  tracks: TrackConfig[];
  barCount: number;
  timeSignature: [number, number]; // [beats per bar, beat unit]
}

export interface DAWState {
  bpm: number;
  isPlaying: boolean;
  isRecording: boolean;
  tracks: TrackConfig[];
  patterns: Pattern[];
  activeTrackId: string | null;
  activePatternId: string | null;
  currentStep: number;
  loopStart: number;
  loopEnd: number;
  loopEnabled: boolean;
  masterVolume: number;
  viewMode: ViewMode;
}

export interface DAWHistoryState {
  past: DAWState[];
  present: DAWState;
  future: DAWState[];
}
