export interface OrionConfig {
  wallpaper: {
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
  };
  dockIcons: Array<{
    id: string;
    mode: "color" | "media";
    value: string | null;
    tokenId?: string;
    order: number;
  }>;
}
