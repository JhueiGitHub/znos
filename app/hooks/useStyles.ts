// hooks/useStyles.ts

import { useDesignSystem } from "../contexts/DesignSystemContext";

export interface AppComponentStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  [key: string]: string | undefined;
}

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

  const getAppComponent = (
    appId: string,
    componentType: "wallpaper" | "dock-icon",
    options: {
      mode: "color" | "media";
      tokenId?: string;
      mediaUrl?: string | null;
      value?: string | null;
    }
  ): AppComponentStyle => {
    const { mode, tokenId, mediaUrl, value } = options;

    // Handle media mode
    if (mode === "media") {
      const mediaSource = mediaUrl || value;
      if (mediaSource) {
        return {
          backgroundImage: `url(${mediaSource})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      }
    }

    // Handle color mode
    if (mode === "color") {
      if (componentType === "wallpaper") {
        const wallpaperToken = designSystem.colorTokens.find(
          (t) => t.name === (tokenId || "Black")
        );

        if (wallpaperToken) {
          return {
            backgroundColor: `rgba(${hexToRgb(wallpaperToken.value)}, ${
              wallpaperToken.opacity / 100
            })`,
          };
        }
      }

      if (componentType === "dock-icon") {
        const iconToken = designSystem.colorTokens.find(
          (t) => t.name === (tokenId || "Graphite")
        );

        if (iconToken) {
          return {
            backgroundColor: `rgba(${hexToRgb(iconToken.value)}, ${
              iconToken.opacity / 100
            })`,
          };
        }
      }
    }

    // Default fallback
    return {
      backgroundColor: getColor("Glass"),
    };
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

  return {
    getColor,
    getFont,
    updateColor,
    updateFont,
    getAppComponent,
    isLoading,
  };
};
