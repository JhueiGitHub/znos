// /root/app/apps/streetfighter/components/StreetFighter.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Fighter } from "../game/classes/Fighter";
import { Sprite } from "../game/classes/Sprite";
import { rectangularCollision } from "../game/utils";

interface StreetFighterProps {
  updateGameState: (state: any) => void;
}

export default function StreetFighter({ updateGameState }: StreetFighterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGameInitialized, setIsGameInitialized] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust canvas size to fit the original game dimensions
    canvas.width = 1024;
    canvas.height = 576;

    // Use the exact game code and classes from the original repo
    // Create background
    const background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: "/apps/streetfighter/assets/kenstage.png",
    });

    // Create shop animation (decorative element in the background)
    const logo = new Sprite({
      position: { x: canvas.width / 2 - 100, y: 20 },
      imageSrc: "/apps/streetfighter/assets/logo.png",
      scale: 1,
      framesMax: 1,
    });

    // Create player (Ryu)
    const player = new Fighter({
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      imageSrc: "/apps/streetfighter/assets/Ryu.png",
      framesMax: 8,
      scale: 2.5,
      offset: { x: 215, y: 157 },
      sprites: {
        idle: {
          imageSrc: "/apps/streetfighter/assets/Ryu.png",
          framesMax: 8,
        },
        run: {
          imageSrc: "/apps/streetfighter/assets/Ryu.png",
          framesMax: 8,
        },
        jump: {
          imageSrc: "/apps/streetfighter/assets/Ryu.png",
          framesMax: 8,
        },
        fall: {
          imageSrc: "/apps/streetfighter/assets/Ryu.png",
          framesMax: 8,
        },
        attack1: {
          imageSrc: "/apps/streetfighter/assets/Ryu.png",
          framesMax: 8,
        },
        takeHit: {
          imageSrc: "/apps/streetfighter/assets/Ryu.png",
          framesMax: 8,
        },
        death: {
          imageSrc: "/apps/streetfighter/assets/Ryu.png",
          framesMax: 8,
        },
      },
      attackBox: {
        offset: { x: 100, y: 50 },
        width: 160,
        height: 50,
      },
    });

    // Create enemy (Ken)
    const enemy = new Fighter({
      position: { x: 400, y: 100 },
      velocity: { x: 0, y: 0 },
      color: "blue",
      imageSrc: "/apps/streetfighter/assets/Ken.png",
      framesMax: 8,
      scale: 2.5,
      offset: { x: 215, y: 167 },
      sprites: {
        idle: {
          imageSrc: "/apps/streetfighter/assets/Ken.png",
          framesMax: 8,
        },
        run: {
          imageSrc: "/apps/streetfighter/assets/Ken.png",
          framesMax: 8,
        },
        jump: {
          imageSrc: "/apps/streetfighter/assets/Ken.png",
          framesMax: 8,
        },
        fall: {
          imageSrc: "/apps/streetfighter/assets/Ken.png",
          framesMax: 8,
        },
        attack1: {
          imageSrc: "/apps/streetfighter/assets/Ken.png",
          framesMax: 8,
        },
        takeHit: {
          imageSrc: "/apps/streetfighter/assets/Ken.png",
          framesMax: 8,
        },
        death: {
          imageSrc: "/apps/streetfighter/assets/Ken.png",
          framesMax: 8,
        },
      },
      attackBox: {
        offset: { x: -170, y: 50 },
        width: 170,
        height: 50,
      },
    });

    console.log("Fighters created");

    // Initialize game variables
    let timer = 60;
    let timerId: NodeJS.Timeout | null = null;
    let isGameOver = false;

    // Keep track of pressed keys
    const keys = {
      a: { pressed: false },
      d: { pressed: false },
      w: { pressed: false },
      ArrowLeft: { pressed: false },
      ArrowRight: { pressed: false },
      ArrowUp: { pressed: false },
    };

    // Decrease the timer
    const decreaseTimer = () => {
      if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;

        // Update game state in React
        updateGameState({
          player1Health: player.health,
          player2Health: enemy.health,
          timer,
          isGameOver,
          winner: null,
        });
      }

      if (timer === 0) {
        determineWinner({ player, enemy, timerId });
      }
    };

    // Start the timer
    decreaseTimer();

    // Determine the winner
    const determineWinner = ({
      player,
      enemy,
      timerId,
    }: {
      player: Fighter;
      enemy: Fighter;
      timerId: NodeJS.Timeout | null;
    }) => {
      if (timerId) clearTimeout(timerId);
      isGameOver = true;

      let winner = null;
      if (player.health === enemy.health) {
        winner = "tie";
      } else if (player.health > enemy.health) {
        winner = "player1";
      } else if (enemy.health > player.health) {
        winner = "player2";
      }

      // Update game state in React
      updateGameState({
        player1Health: player.health,
        player2Health: enemy.health,
        timer,
        isGameOver: true,
        winner,
      });
    };

    // Animation loop
    let lastTime = 0;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      animationFrameId = window.requestAnimationFrame(animate);

      // Clear canvas and draw background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      background.update(ctx);
      logo.update(ctx);

      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      player.update(ctx);
      enemy.update(ctx);

      // Player movement
      player.velocity.x = 0;

      if (keys.a.pressed && player.lastKey === "a") {
        player.velocity.x = -5;
        player.switchSprite("run");
      } else if (keys.d.pressed && player.lastKey === "d") {
        player.velocity.x = 5;
        player.switchSprite("run");
      } else {
        player.switchSprite("idle");
      }

      // Player jumping
      if (player.velocity.y < 0) {
        player.switchSprite("jump");
      } else if (player.velocity.y > 0) {
        player.switchSprite("fall");
      }

      // Enemy movement
      enemy.velocity.x = 0;

      if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
        enemy.velocity.x = -5;
        enemy.switchSprite("run");
      } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
        enemy.velocity.x = 5;
        enemy.switchSprite("run");
      } else {
        enemy.switchSprite("idle");
      }

      // Enemy jumping
      if (enemy.velocity.y < 0) {
        enemy.switchSprite("jump");
      } else if (enemy.velocity.y > 0) {
        enemy.switchSprite("fall");
      }

      // Detect collision & enemy gets hit
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: enemy,
        }) &&
        player.isAttacking &&
        player.framesCurrent === 4
      ) {
        enemy.takeHit();
        player.isAttacking = false;

        // Update game state in React
        updateGameState({
          player1Health: player.health,
          player2Health: enemy.health,
          timer,
          isGameOver,
          winner: null,
        });
      }

      // If player misses
      if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
      }

      // Player gets hit
      if (
        rectangularCollision({
          rectangle1: enemy,
          rectangle2: player,
        }) &&
        enemy.isAttacking &&
        enemy.framesCurrent === 2
      ) {
        player.takeHit();
        enemy.isAttacking = false;

        // Update game state in React
        updateGameState({
          player1Health: player.health,
          player2Health: enemy.health,
          timer,
          isGameOver,
          winner: null,
        });
      }

      // If enemy misses
      if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false;
      }

      // End game based on health
      if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId });
      }
    };

    // Start animation
    animationFrameId = window.requestAnimationFrame(animate);

    // Event listeners for keyboard input
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGameOver) {
        switch (event.key) {
          // Player keys
          case "d":
            keys.d.pressed = true;
            player.lastKey = "d";
            break;
          case "a":
            keys.a.pressed = true;
            player.lastKey = "a";
            break;
          case "w":
            player.velocity.y = -20;
            break;
          case " ":
            player.attack();
            break;

          // Enemy keys
          case "ArrowRight":
            keys.ArrowRight.pressed = true;
            enemy.lastKey = "ArrowRight";
            break;
          case "ArrowLeft":
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = "ArrowLeft";
            break;
          case "ArrowUp":
            enemy.velocity.y = -20;
            break;
          case "ArrowDown":
            enemy.attack();
            break;
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Player keys
      switch (event.key) {
        case "d":
          keys.d.pressed = false;
          break;
        case "a":
          keys.a.pressed = false;
          break;
      }

      // Enemy keys
      switch (event.key) {
        case "ArrowRight":
          keys.ArrowRight.pressed = false;
          break;
        case "ArrowLeft":
          keys.ArrowLeft.pressed = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    setIsGameInitialized(true);

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.cancelAnimationFrame(animationFrameId);
      if (timerId) clearTimeout(timerId);
    };
  }, [updateGameState]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}
