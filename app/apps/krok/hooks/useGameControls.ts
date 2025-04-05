// app/apps/drifting/hooks/useGameControls.ts
import { useState, useEffect, useCallback } from "react";
import { ControlsState } from "../types/game";

/**
 * Custom hook to manage keyboard input for game controls
 */
export const useGameControls = (isPlaying: boolean = false) => {
  const [controls, setControls] = useState<ControlsState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
  });

  // Helper to convert keyboard events to control states
  const updateControlState = useCallback(
    (e: KeyboardEvent, isPressed: boolean) => {
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          setControls((prev) => ({ ...prev, forward: isPressed }));
          break;
        case "ArrowDown":
        case "KeyS":
          setControls((prev) => ({ ...prev, backward: isPressed }));
          break;
        case "ArrowLeft":
        case "KeyA":
          setControls((prev) => ({ ...prev, left: isPressed }));
          break;
        case "ArrowRight":
        case "KeyD":
          setControls((prev) => ({ ...prev, right: isPressed }));
          break;
        case "Space":
          setControls((prev) => ({ ...prev, handbrake: isPressed }));
          break;
      }
    },
    []
  );

  // Set up event listeners
  useEffect(() => {
    if (!isPlaying) {
      // Reset all controls when not playing
      setControls({
        forward: false,
        backward: false,
        left: false,
        right: false,
        handbrake: false,
      });
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser behavior for game controls
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      ) {
        e.preventDefault();
        updateControlState(e, true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      ) {
        updateControlState(e, false);
      }
    };

    // Reset controls when window loses focus
    const handleBlur = () => {
      setControls({
        forward: false,
        backward: false,
        left: false,
        right: false,
        handbrake: false,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isPlaying, updateControlState]);

  return controls;
};

export default useGameControls;
