// types/stellar.ts
export interface Position {
  x: number;
  y: number;
}

export interface BaseItem {
  id: string;
  name: string;
  position: Position;
}

export interface StellarFile extends BaseItem {
  itemType: "file";
  url: string;
  size: number;
  mimeType: string;
}

export interface StellarFolder extends BaseItem {
  itemType: "folder";
  children: StellarFolder[];
  files: StellarFile[];
}

export type CanvasItem = {
  id: string;
  itemType: "folder" | "file";
  position: Position;
  name: string;
};
