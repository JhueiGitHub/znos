// app/apps/mila/systems/shorthandSystem.ts
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// Interface for the shorthand context
export interface ShorthandContextType {
  isActive: boolean;
  toggleShorthand: () => void;
  getShorthandStyles: (baseStyles?: React.CSSProperties) => React.CSSProperties;
}

// Create a context with default values
export const ShorthandContext = createContext<ShorthandContextType>({
  isActive: false,
  toggleShorthand: () => {},
  getShorthandStyles: () => ({}),
});

// Provider component
export const ShorthandProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const [isActive, setIsActive] = useState(false);

  const toggleShorthand = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const getShorthandStyles = useCallback(
    (baseStyles: React.CSSProperties = {}): React.CSSProperties => {
      if (!isActive) return baseStyles;

      return {
        ...baseStyles,
        boxShadow: "0 0 15px rgba(123, 108, 189, 0.6)",
        transform: "scale(1.02)",
      };
    },
    [isActive]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === "§" ||
        e.key === "Dead" ||
        e.code === "IntlBackslash" ||
        e.keyCode === 192
      ) {
        toggleShorthand();
        e.preventDefault();
      }
    },
    [toggleShorthand]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const contextValue = {
    isActive,
    toggleShorthand,
    getShorthandStyles,
  };

  return React.createElement(
    ShorthandContext.Provider,
    { value: contextValue },
    props.children
  );
};

// Hook to use the shorthand context
export const useShorthand = (): ShorthandContextType => {
  const context = useContext(ShorthandContext);
  if (!context) {
    throw new Error("useShorthand must be used within a ShorthandProvider");
  }
  return context;
};

// Utility function to parse shorthand notation
export const parseShorthand = (text: string): string => {
  // This will be expanded in future implementations
  return text;
};

// Shorthand commands for future implementation
export const SHORTHAND_COMMANDS = {
  HEADING: "§h",
  BULLET: "§*",
  CHECKBOX: "§[]",
  LINK: "§link",
  CODE: "§code",
};
