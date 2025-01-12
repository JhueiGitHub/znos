// hooks/useGestureControl.ts
import { useState, useEffect } from "react";

interface GestureState {
  isCtrlPressed: boolean;
  isShiftPressed: boolean;
  swipeDirection: "none" | "left" | "right" | "up" | "down";
  swipeVelocity: number;
  isTouching: boolean;
}

const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels
const VELOCITY_THRESHOLD = 0.1; // Lowered velocity threshold for easier detection

export const useGestureControl = () => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isCtrlPressed: false,
    isShiftPressed: false,
    swipeDirection: "none",
    swipeVelocity: 0,
    isTouching: false,
  });

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        // Calculate the midpoint of the two touches
        touchStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        touchStartTime = performance.now();

        setGestureState((prev) => ({
          ...prev,
          isTouching: true,
          swipeDirection: "none",
          swipeVelocity: 0,
        }));

        console.log("Touch start:", { touchStartX, touchStartY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && gestureState.isCtrlPressed) {
        e.preventDefault();

        // Calculate current midpoint
        const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        // Calculate deltas
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;
        const time = performance.now() - touchStartTime;

        // Calculate velocity (pixels per millisecond)
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / time;

        // Determine direction
        let direction: GestureState["swipeDirection"] = "none";

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            direction = deltaX > 0 ? "right" : "left";
          }
        } else {
          if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
            direction = deltaY > 0 ? "down" : "up";
          }
        }

        console.log("Touch move:", {
          deltaX,
          deltaY,
          direction,
          velocity,
          isCtrlPressed: gestureState.isCtrlPressed,
        });

        if (
          Math.abs(deltaX) > SWIPE_THRESHOLD ||
          Math.abs(deltaY) > SWIPE_THRESHOLD
        ) {
          setGestureState((prev) => ({
            ...prev,
            swipeVelocity: velocity,
            swipeDirection: direction,
          }));
        }
      }
    };

    const handleTouchEnd = () => {
      console.log("Touch end");
      setGestureState((prev) => ({
        ...prev,
        isTouching: false,
        swipeDirection: "none",
        swipeVelocity: 0,
      }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setGestureState((prev) => ({ ...prev, isCtrlPressed: true }));
        console.log("Ctrl pressed");
      } else if (e.key === "Shift") {
        setGestureState((prev) => ({ ...prev, isShiftPressed: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setGestureState((prev) => ({
          ...prev,
          isCtrlPressed: false,
          swipeDirection: "none",
          swipeVelocity: 0,
        }));
        console.log("Ctrl released");
      } else if (e.key === "Shift") {
        setGestureState((prev) => ({ ...prev, isShiftPressed: false }));
      }
    };

    // Important: Set passive: false to allow preventDefault()
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gestureState.isCtrlPressed]); // Only depend on isCtrlPressed

  return gestureState;
};
