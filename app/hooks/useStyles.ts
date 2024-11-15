// hooks/useStyles.ts
import { useDesignSystem } from "../contexts/DesignSystemContext";

export const useStyles = () => {
  const { designSystem, isLoading, updateDesignSystem } = useDesignSystem();

  if (isLoading) {
    return {
      getColor: () => "",
      getFont: () => "",
      updateColor: async () => {},
      updateFont: async () => {},
      isLoading,
    };
  }

  if (!designSystem) {
    console.error("Design system not loaded");
    return {
      getColor: () => "",
      getFont: () => "",
      updateColor: async () => {},
      updateFont: async () => {},
      isLoading,
    };
  }

  const getColor = (name: string) => {
    const token = designSystem.colorTokens.find((t) => t.name === name);
    return token
      ? `rgba(${hexToRgb(token.value)}, ${token.opacity / 100})`
      : "";
  };

  const getFont = (name: string) => {
    const token = designSystem.typographyTokens.find((t) => t.name === name);
    return token?.fontFamily || "";
  };

  const updateColor = async (name: string, value: string, opacity: number) => {
    if (!designSystem) return;
    const updatedTokens = designSystem.colorTokens.map((token) =>
      token.name === name ? { ...token, value, opacity } : token
    );
    const updatedDesignSystem = {
      ...designSystem,
      colorTokens: updatedTokens,
    };
    await updateDesignSystem(updatedDesignSystem);
  };

  const updateFont = async (name: string, fontFamily: string) => {
    if (!designSystem) return;
    const updatedTokens = designSystem.typographyTokens.map((token) =>
      token.name === name ? { ...token, fontFamily } : token
    );
    const updatedDesignSystem = {
      ...designSystem,
      typographyTokens: updatedTokens,
    };
    await updateDesignSystem(updatedDesignSystem);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : null;
  };

  return { getColor, getFont, updateColor, updateFont, isLoading };
};
