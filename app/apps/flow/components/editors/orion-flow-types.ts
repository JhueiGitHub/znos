import { ColorToken } from "@prisma/client";

export interface OrionFlowComponent {
  id: string;
  name: string;
  type: "WALLPAPER" | "DOCK_ICON";
  mode: "color" | "media" | null;
  tokenId: string | null;
  value: string | null;
  order: number;
}

export interface OrionSidebarProps {
  selectedComponent: OrionFlowComponent | null;
  designSystem: {
    id: string;
    name: string;
    colorTokens: ColorToken[];
  } | null;
  onUpdateComponent: (
    componentId: string,
    updates: Partial<OrionFlowComponent>
  ) => void;
}
