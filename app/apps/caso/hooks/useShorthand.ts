// app/apps/mila/hooks/useShorthand.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useStyles } from "@/app/hooks/useStyles";

interface UseShorthandOptions {
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export const useShorthand = (options: UseShorthandOptions = {}) => {
  const [shorthandActive, setShorthandActive] = useState(false);
  const lastKeyRef = useRef<string | null>(null);
  const { getColor } = useStyles();

  const toggleShorthand = useCallback(() => {
    const newState = !shorthandActive;
    setShorthandActive(newState);

    if (newState) {
      options.onActivate?.();
    } else {
      options.onDeactivate?.();
    }
  }, [shorthandActive, options]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Check for § key (which can have different key codes depending on keyboard layout)
      if (
        e.key === "§" ||
        e.key === "Dead" ||
        e.code === "IntlBackslash" ||
        e.keyCode === 192
      ) {
        e.preventDefault();
        lastKeyRef.current = e.key;
        toggleShorthand();
      }
    },
    [toggleShorthand]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    // Reset the last key when released
    if (e.key === lastKeyRef.current) {
      lastKeyRef.current = null;
    }
  }, []);

  const activate = useCallback(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
  }, [handleKeyDown, handleKeyUp]);

  const deactivate = useCallback(() => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
  }, [handleKeyDown, handleKeyUp]);

  // Get styles for shorthand mode
  const getShorthandStyles = useCallback(
    (baseStyles: React.CSSProperties = {}): React.CSSProperties => {
      if (!shorthandActive) return baseStyles;

      return {
        ...baseStyles,
        boxShadow: `0 0 15px ${getColor("latte-med")}`,
        transform: "scale(1.02)",
        transition: "box-shadow 0.3s ease, transform 0.2s ease",
      };
    },
    [shorthandActive, getColor]
  );

  // Clean up event listeners
  useEffect(() => {
    return () => {
      deactivate();
    };
  }, [deactivate]);

  return {
    shorthandActive,
    toggleShorthand,
    activate,
    deactivate,
    getShorthandStyles,
  };
};
