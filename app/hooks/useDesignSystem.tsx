// hooks/useDesignSystem.ts
import { useContext } from "react";
import { DesignSystemContext } from "../contexts/DesignSystemContext";

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error(
      "useDesignSystem must be used within a DesignSystemProvider"
    );
  }
  return context;
};
