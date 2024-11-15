// /types/flow.ts
import {
  Stream,
  Flow,
  FlowComponent as PrismaFlowComponent,
} from "@prisma/client";

export interface FlowComponent extends PrismaFlowComponent {
  id: string;
  name: string;
  type: string;
  value: string | null;
  opacity: number | null;
  fontFamily: string | null;
  strokeWidth: number | null;
  mappedTokenId: string | null;
  mediaUrl: string | null;
  tokenId: string | null;
  tokenValue: string | null;
  order: number;
  flowId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowWithComponents extends Flow {
  components: FlowComponent[];
}

export interface StreamWithFlows extends Stream {
  flows: FlowWithComponents[];
}

// Type guard for component types
export const isMediaComponent = (component: FlowComponent): boolean => {
  return component.type === "WALLPAPER" || component.type === "DOCK_ICON";
};
