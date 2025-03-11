// app/apps/orion/components/StarField.tsx
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { StarfieldState } from "../lib/types";

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  speed: number;
  depth: number;
  twinkleSpeed: number;
  twinkleDirection: number;
}

interface StarFieldProps {
  className?: string;
  options: Omit<StarfieldState, "canvasWidth" | "canvasHeight">;
}

export function StarField({ className, options }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Generate stars when dimensions or options change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const generateStars = () => {
      const totalStars = Math.floor(
        ((dimensions.width * dimensions.height) / 20000) * options.density
      );
      const stars: Star[] = [];

      for (let i = 0; i < totalStars; i++) {
        // Create stars across a larger area than just the viewport
        // This allows for smooth panning
        const renderWidth = dimensions.width * 3;
        const renderHeight = dimensions.height * 3;
        const x = Math.random() * renderWidth - renderWidth / 2;
        const y = Math.random() * renderHeight - renderHeight / 2;
        const depth = Math.random() * options.depth;

        stars.push({
          x,
          y,
          size:
            options.size[0] +
            Math.random() * (options.size[1] - options.size[0]),
          color:
            options.colors[Math.floor(Math.random() * options.colors.length)],
          alpha: 0.5 + Math.random() * 0.5,
          speed:
            options.speed[0] +
            Math.random() * (options.speed[1] - options.speed[0]),
          depth,
          twinkleSpeed: 0.001 + Math.random() * 0.01,
          twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        });
      }

      starsRef.current = stars;
    };

    generateStars();
  }, [
    dimensions.width,
    dimensions.height,
    options.density,
    options.size,
    options.colors,
    options.depth,
    options.speed,
  ]);

  // Set up canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
    });

    observer.observe(canvas);

    let lastTime = performance.now();
    const animate = (time: number) => {
      if (!ctx) return;

      // Calculate delta time for smooth animation
      const deltaTime = (time - lastTime) / 16.67; // 60 FPS as baseline
      lastTime = time;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { zoom, pan } = options.viewportTransform;

      // Calculate visible canvas boundaries in world space
      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;

      // Draw stars
      for (const star of starsRef.current) {
        // Apply parallax effect based on star depth
        const parallaxFactor =
          1 - (star.depth / options.depth) * options.parallaxFactor;

        // Calculate star position in screen space
        const screenX = star.x * parallaxFactor * zoom + pan.x + halfWidth;
        const screenY = star.y * parallaxFactor * zoom + pan.y + halfHeight;

        // Skip stars outside the visible canvas (with padding)
        if (
          screenX < -100 ||
          screenX > canvas.width + 100 ||
          screenY < -100 ||
          screenY > canvas.height + 100
        ) {
          continue;
        }

        // Animate twinkle effect
        star.alpha += star.twinkleSpeed * star.twinkleDirection * deltaTime;
        if (star.alpha > 0.95) {
          star.alpha = 0.95;
          star.twinkleDirection = -1;
        } else if (star.alpha < 0.3) {
          star.alpha = 0.3;
          star.twinkleDirection = 1;
        }

        // Draw the star
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = star.color;

        // Different drawing methods based on star size
        if (star.size < 1.5) {
          ctx.fillRect(screenX, screenY, star.size * zoom, star.size * zoom);
        } else {
          ctx.beginPath();
          ctx.arc(screenX, screenY, (star.size / 2) * zoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add glow effect for larger stars
        if (star.size > 2) {
          const glow = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            star.size * 2 * zoom
          );
          glow.addColorStop(0, `${star.color}40`); // 25% opacity
          glow.addColorStop(1, "transparent");

          ctx.globalAlpha = star.alpha * 0.5;
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(screenX, screenY, star.size * 3 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Reset global alpha
      ctx.globalAlpha = 1;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      observer.disconnect();
    };
  }, [options.viewportTransform, options.parallaxFactor, options.depth]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full absolute top-0 left-0 bg-black ${className || ""}`}
      style={{ pointerEvents: "none" }}
    />
  );
}
