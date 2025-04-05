// /root/app/apps/streetfighter/game/classes/Fighter.ts
"use client";

import { Sprite } from "./Sprite";

interface FighterProps {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  color?: string;
  imageSrc: string;
  scale?: number;
  framesMax?: number;
  offset?: { x: number; y: number };
  sprites: {
    idle: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
    run: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
    jump: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
    fall: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
    attack1: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
    takeHit: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
    death: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
    [key: string]: {
      imageSrc: string;
      framesMax: number;
      image?: HTMLImageElement;
    };
  };
  attackBox: {
    offset: { x: number; y: number };
    width: number;
    height: number;
  };
}

export class Fighter extends Sprite {
  velocity: { x: number; y: number };
  height: number;
  width: number;
  attackBox: {
    position: { x: number; y: number };
    offset: { x: number; y: number };
    width: number;
    height: number;
  };
  health: number;
  lastKey: string | null;
  isAttacking: boolean;
  sprites: any;
  dead: boolean;

  constructor({
    position,
    velocity,
    color = "red",
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: { x: 0, y: 0 }, width: 100, height: 50 },
  }: FighterProps) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset,
    });

    this.velocity = velocity;
    this.height = 150;
    this.width = 50;
    this.lastKey = null;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };
    this.color = color;
    this.isAttacking = false;
    this.health = 100;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.sprites = sprites;
    this.dead = false;

    // Load all sprites
    for (const sprite in this.sprites) {
      if (Object.prototype.hasOwnProperty.call(this.sprites, sprite)) {
        this.sprites[sprite].image = new Image();
        this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;
      }
    }
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    if (!this.dead) this.animateFrames();

    // Update attack box position
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    // Draw attack box (for debugging)
    // ctx.fillRect(
    //   this.attackBox.position.x,
    //   this.attackBox.position.y,
    //   this.attackBox.width,
    //   this.attackBox.height
    // );

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Apply gravity if not at bottom of canvas
    if (
      this.position.y + this.height + this.velocity.y >=
      ctx.canvas.height - 96
    ) {
      this.velocity.y = 0;
      this.position.y = 330;
    } else {
      this.velocity.y += 0.7;
    }
  }

  attack() {
    this.switchSprite("attack1");
    this.isAttacking = true;
  }

  takeHit() {
    this.health -= 20;

    if (this.health <= 0) {
      this.switchSprite("death");
    } else {
      this.switchSprite("takeHit");
    }
  }

  switchSprite(sprite: string) {
    // In our case, we're using the same sprite sheet for all states
    // so we don't need to change the image source

    // We just need to update the animation frame based on the action
    switch (sprite) {
      case "idle":
        this.framesCurrent = 0; // Starting idle frame
        break;
      case "run":
        this.framesCurrent = 1; // Starting run frame
        break;
      case "jump":
        this.framesCurrent = 2; // Starting jump frame
        break;
      case "fall":
        this.framesCurrent = 3; // Starting fall frame
        break;
      case "attack1":
        this.framesCurrent = 4; // Starting attack frame
        break;
      case "takeHit":
        this.framesCurrent = 5; // Starting hit frame
        break;
      case "death":
        this.framesCurrent = 6; // Starting death frame
        break;
    }
  }
}
