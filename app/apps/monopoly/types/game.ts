// /root/app/apps/monopoly/types/game.ts
export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  isReady: boolean;
  figurineId: number;  // Added this field
  position?: number;
  money?: number;
  properties?: string[];
}