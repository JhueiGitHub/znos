export interface DAWComponent {
  id: string;
  type: 
    | "piano-roll"
    | "track-lane"
    | "mixer-channel"
    | "timeline"
    | "transport"
    | "waveform"
    | "effects-rack"
    | "instrument"
    | "sequencer"
    | "automation";
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  locked?: boolean;
}

export interface CanvasState {
  position: { x: number; y: number };
  scale: number;
}

export interface ToolkitItem {
  type: DAWComponent["type"];
  name: string;
  icon: string;
  description: string;
  category: "composition" | "mixing" | "effects" | "timing";
}
