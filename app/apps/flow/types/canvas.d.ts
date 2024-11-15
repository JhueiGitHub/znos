// /root/app/apps/flow/types/canvas.d.ts
import { Canvas } from 'fabric/fabric-impl';

declare module 'fabric/fabric-impl' {
  interface Canvas {
    isDragging?: boolean;
    lastPosX?: number;
    lastPosY?: number;
  }
}
