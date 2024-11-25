// app/apps/flow/types/view.ts
export type ViewType = 
  | "streams"
  | "apps" 
  | "app"
  | "stream"
  | "editor"
  | "community"
  | "community-creator";

export interface ViewState {
  type: ViewType;
  id?: string;
  previousView?: ViewState | null;
  flowData?: {
    id: string;
    type: string;
    streamType: string;
  } | null;
}