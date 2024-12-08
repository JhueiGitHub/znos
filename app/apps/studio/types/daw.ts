import { StepType } from "reactronica";

// types/daw.ts
export interface TrackConfig {
  id: string;
  name: string;
  instrument: {
    type: string;
    oscillatorType?: string;
    polyphony?: number;
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

export interface DAWState {
  bpm: number;
  isPlaying: boolean;
  tracks: TrackConfig[];
  activeTrackId: string | null;
  currentStep: number;
}
