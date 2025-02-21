import { ColorToken, TypographyToken } from "@prisma/client";

export interface CoreFlowComponent {
  id: string;
  name: string;
  type: string;
  value: string | null;
  opacity: number | null;
  tokenId: string | null;
  order: number;
}

export interface CoreFlow {
  id: string;
  name: string;
  components: CoreFlowComponent[];
  designSystem: {
    id: string;
    name: string;
    colorTokens: ColorToken[];
    typographyTokens: TypographyToken[];
  };
}

export interface TokenUpdate {
  id: string;
  value: string;
  opacity?: number;
}

export interface ColorPickerState {
  isOpen: boolean;
  color: string;
  position: { x: number; y: number };
  tokenId: string | null;
}

export interface CanvasViewState {
  zoom: number;
  viewportTransform: number[] | null;
}