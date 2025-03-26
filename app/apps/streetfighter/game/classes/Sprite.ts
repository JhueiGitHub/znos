// /root/app/apps/streetfighter/game/classes/Sprite.ts
"use client";

interface SpriteProps {
  position: { x: number; y: number };
  imageSrc: string;
  scale?: number;
  framesMax?: number;
  offset?: { x: number; y: number };
}

export class Sprite {
  position: { x: number; y: number };
  height: number;
  width: number;
  image: HTMLImageElement;
  scale: number;
  framesMax: number;
  framesCurrent: number;
  framesElapsed: number;
  framesHold: number;
  offset: { x: number; y: number };
  color?: string;
  lastFrame?: number;
  frameWidth?: number;
  frameHeight?: number;

  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
  }: SpriteProps) {
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.offset = offset;

    // For sprite sheets
    this.lastFrame = 0;
    this.frameWidth = 0;
    this.frameHeight = 0;

    // Get dimensions once image is loaded
    this.image.onload = () => {
      this.frameWidth = this.image.width / this.framesMax;
      this.frameHeight = this.image.height;
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    // If the sprite is a sprite sheet (like the characters)
    if (this.framesMax > 1 && this.frameWidth && this.frameHeight) {
      ctx.drawImage(
        this.image,
        this.framesCurrent * this.frameWidth,
        0,
        this.frameWidth,
        this.frameHeight,
        this.position.x - this.offset.x,
        this.position.y - this.offset.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale
      );
    } else {
      // For regular images (like the background)
      ctx.drawImage(
        this.image,
        this.position.x - this.offset.x,
        this.position.y - this.offset.y,
        this.image.width * this.scale,
        this.image.height * this.scale
      );
    }
  }

  animateFrames() {
    this.framesElapsed++;

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    this.animateFrames();
  }
}
