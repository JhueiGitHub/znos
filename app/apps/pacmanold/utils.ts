// app/apps/pacman/utils.ts
import * as THREE from "three";

/**
 * Instead of using FontLoader and TextGeometry directly (which require separate imports),
 * we'll use simpler text rendering approaches compatible with core Three.js
 */

/**
 * Creates a simple text sprite using a canvas texture
 */
export const createTextSprite = (
  text: string,
  color: string = "white",
  size: number = 1
): THREE.Sprite => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get canvas context");

  canvas.width = 256;
  canvas.height = 128;

  // Background - transparent
  context.fillStyle = "rgba(0,0,0,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Text
  context.font = "24px Arial";
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // Canvas texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size / 2, 1);

  return sprite;
};

/**
 * Limits a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

/**
 * Converts degrees to radians
 */
export const degToRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Converts radians to degrees
 */
export const radToDeg = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random float between min (inclusive) and max (exclusive)
 */
export const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Key state interface that allows both boolean values and a cleanup method
 */
export interface KeyState {
  [key: string]: boolean | (() => void);
  cleanup: () => void;
}

/**
 * Creates a key state tracker for managing keyboard inputs
 */
export const createKeyState = (): KeyState => {
  // Create object with proper type that allows both boolean values and functions
  const keyState: KeyState = {
    cleanup: () => {}, // Initialize with empty function
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    keyState[event.code] = true;
    keyState[String.fromCharCode(event.keyCode)] = true;
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keyState[event.code] = false;
    keyState[String.fromCharCode(event.keyCode)] = false;
  };

  const handleBlur = () => {
    // Reset all keys when browser loses focus
    for (const key in keyState) {
      if (keyState.hasOwnProperty(key) && typeof keyState[key] === "boolean") {
        keyState[key] = false;
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);

  // Define the cleanup method
  keyState.cleanup = () => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", handleBlur);
  };

  return keyState;
};
