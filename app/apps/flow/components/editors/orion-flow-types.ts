// types/orion-flow-types.ts
export interface OrionFlowComponent {
  id: string;
  type: "WALLPAPER" | "DOCK_ICON";
  mode: "color" | "media";
  value: string | null;
  mediaId?: string;
  tokenId?: string;
}

export type ComponentUpdate = Partial<
  Pick<OrionFlowComponent, "mode" | "value" | "mediaId" | "tokenId">
>;

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
