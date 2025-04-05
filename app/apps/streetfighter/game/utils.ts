// /root/app/apps/streetfighter/game/utils.ts
"use client";

interface Rectangle {
  position: { x: number; y: number };
  attackBox?: {
    position: { x: number; y: number };
    width: number;
    height: number;
  };
  width?: number;
  height?: number;
}

export function rectangularCollision({
  rectangle1,
  rectangle2,
}: {
  rectangle1: Rectangle;
  rectangle2: Rectangle;
}): boolean {
  return (
    rectangle1.attackBox!.position.x + rectangle1.attackBox!.width >=
      rectangle2.position.x &&
    rectangle1.attackBox!.position.x <=
      rectangle2.position.x + rectangle2.width! &&
    rectangle1.attackBox!.position.y + rectangle1.attackBox!.height >=
      rectangle2.position.y &&
    rectangle1.attackBox!.position.y <=
      rectangle2.position.y + rectangle2.height!
  );
}
