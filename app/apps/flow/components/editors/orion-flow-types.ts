// orion-flow-types.ts
export interface OrionFlowComponent {
  id: string;
  name: string;
  type: "WALLPAPER" | "DOCK_ICON" | "CURSOR";
  mode: "color" | "media";
  value: string | null;
  order: number;
  tokenId?: string;
  mediaId?: string;
  mediaUrl?: string;
  tokenValue?: string;
  outlineMode?: "color" | "media";
  outlineValue?: string | null;
  outlineTokenId?: string;
}

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

export interface OrionSidebarProps {
  selectedComponents: OrionFlowComponent[];
  designSystem: {
    colorTokens: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  } | null;
  onUpdateComponent: (ids: string[], updates: ComponentUpdate) => void;
  onMediaSelect: (type?: "fill" | "outline") => void;
  onMacOSIconSelect?: () => void;
}

export interface OrionLeftSidebarProps {
  flowName: string;
  isVisible: boolean;
  components: OrionFlowComponent[];
  onComponentSelect: (
    componentId: string,
    modifiers: { shift?: boolean; meta?: boolean }
  ) => void;
  selectedComponentIds: string[]; // Changed to support multiple selections
}
