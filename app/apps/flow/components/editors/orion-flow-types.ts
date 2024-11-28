// Explicit component type with all required fields
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
}

// Type for component updates 
export type ComponentUpdate = Partial<
  Pick<OrionFlowComponent, "mode" | "value" | "mediaId" | "tokenId">
>;

// Full sidebar props interface
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
  onMacOSIconSelect?: () => void;
}