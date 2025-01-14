// Explicit component type with all required fields
// orion-flow-types.ts
// orion-flow-types.ts
export interface OrionFlowComponent {
  id: string;
  name: string;
  type: "WALLPAPER" | "DOCK_ICON";
  mode: "color" | "media";
  value: string | null;
  order: number;
  tokenId?: string;
  mediaId?: string;
  mediaUrl?: string;
  tokenValue?: string;
  outlineMode?: "color" | "media"; // NEW
  outlineValue?: string | null; // NEW
  outlineTokenId?: string; // NEW
}

// Type for component updates
export type ComponentUpdate = Partial<
  Pick<
    OrionFlowComponent,
    | "mode"
    | "value"
    | "mediaId"
    | "tokenId"
    | "outlineMode"
    | "outlineValue"
    | "outlineTokenId"
  >
>;

// Full sidebar props interface
// orion-flow-types.ts
export interface OrionSidebarProps {
  selectedComponent: OrionFlowComponent | null;
  designSystem: {
    colorTokens: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  } | null;
  onUpdateComponent: (id: string, updates: Partial<OrionFlowComponent>) => void;
  onMediaSelect: (type?: "fill" | "outline") => void; // Updated to accept optional type parameter
  onMacOSIconSelect?: () => void;
}
