// /app/types/flow.ts
import { Stream, Flow, Profile } from "@prisma/client";

// Matching our actual Prisma schema
export type ComponentType = "COLOR" | "TYPOGRAPHY" | "WALLPAPER" | "DOCK_ICON";

export interface FlowComponentInput {
  name: string;
  type: string; // Matches Prisma schema where type is String, not enum
  value: string | null;
  order: number;
}

export interface FlowCreateInput {
  name: string;
  description: string | null;
  type: "CONFIG";
  profileId: string;
  streamId: string | null;
  designSystemId: string;
  components: {
    create: FlowComponentInput[];
  };
}

export interface StreamCreateInput {
  name: string;
  description: string | null;
  type: "CORE";
  appId: string;
  profileId: string;
}

// Extended types for frontend use with proper typing
export interface FlowComponent {
  id: string;
  name: string;
  type: string; // Matches Prisma schema
  value: string | null;
  order: number;
  flowId: string;
  opacity: number | null;
  fontFamily: string | null;
  strokeWidth: number | null;
  mappedTokenId: string | null;
  mediaUrl: string | null;
  tokenId: string | null;
  tokenValue: string | null;
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
