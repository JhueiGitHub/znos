// types/prisma.ts
import { MediaType } from "@prisma/client";

export interface FlowComponentWithMedia {
  id: string;
  name: string;
  type: string;
  mode?: string;
  value?: string;
  opacity?: number;
  strokeWidth?: number;
  order: number;
  mediaUrl?: string;
  mediaId?: string;
  mediaItem?: {
    id: string;
    name: string;
    type: MediaType;
    url: string;
    profileId: string;
  } | null;
}
