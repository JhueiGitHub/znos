// components/Wallpaper.tsx
import { useEffect } from "react";
import { useStyles } from "../hooks/useStyles";
import { useAppStore } from "../store/appStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { OrionFlowComponent } from "@/app/apps/flow/components/editors/orion-flow-types";

const Wallpaper = () => {
  const { getColor } = useStyles();
  const updateOrionConfig = useAppStore((state) => state.setOrionConfig);
  const wallpaperConfig = useAppStore((state) => state.orionConfig?.wallpaper);

  const { data: wallpaperData } = useQuery({
    queryKey: ["wallpaper-config"],
    queryFn: async () => {
      console.log("1. Fetching wallpaper data...");
      const response = await axios.get<OrionFlowComponent>(
        "/api/flows/components/wallpaper"
      );
      console.log("2. Wallpaper API response:", response.data);

      // Update app store with fetched wallpaper data
      const wallpaperConfig = {
        wallpaper: {
          mode: response.data.mode,
          value: response.data.mode === "media" ? response.data.value : null,
          tokenId:
            response.data.mode === "color"
              ? response.data.tokenId || undefined
              : undefined,
        },
        dockIcons: useAppStore.getState().orionConfig?.dockIcons || [],
      };
      console.log("3. Updating app store with:", wallpaperConfig);
      updateOrionConfig(wallpaperConfig);

      return response.data;
    },
  });

  console.log("4. Current wallpaperConfig from store:", wallpaperConfig);

  const wallpaperStyles =
    wallpaperConfig?.mode === "media" && wallpaperConfig.value
      ? {
          backgroundImage: `url(${wallpaperConfig.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          backgroundColor: getColor(wallpaperConfig?.tokenId || "Black"),
        };

  console.log("5. Computed wallpaperStyles:", wallpaperStyles);

  return (
    <div
      className="absolute inset-0 w-full h-full transition-all duration-300"
      style={wallpaperStyles}
    />
  );
};

export default Wallpaper;
