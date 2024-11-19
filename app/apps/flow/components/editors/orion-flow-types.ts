// types/orion-flow-types.ts
export interface OrionFlowComponent {
  id: string;
  name: string;
  type: "WALLPAPER" | "DOCK_ICON";
  mode: "color" | "media";
  value: string | null;
  tokenId: string | null;
  mediaId?: string;
  order: number;
}

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
  onMediaSelect: () => void;
}
