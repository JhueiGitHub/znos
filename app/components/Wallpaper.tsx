import { useEffect, useRef } from "react";
import { useStyles } from "../hooks/useStyles";
import { useAppStore } from "../store/appStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const Wallpaper = () => {
  // PRESERVED: Original style hooks
  const { getColor } = useStyles();

  // PRESERVED: Original store access plus new active flow
  const wallpaperConfig = useAppStore((state) => state.orionConfig?.wallpaper);
  const activeOSFlowId = useAppStore((state) => state.activeOSFlowId);
  const updateWallpaper = useAppStore((state) => state.updateWallpaper);

  // PRESERVED: Original video ref handling
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadAttempted = useRef(false);

  // UPDATED: Fetch active flow config on component mount
  const { data: activeFlowConfig } = useQuery({
    queryKey: ["orion-active-flow"],
    queryFn: async () => {
      const response = await axios.get("/api/apps/orion/active-flow");
      return response.data;
    },
  });

  // Update wallpaper when active flow config changes
  useEffect(() => {
    if (activeFlowConfig?.flow) {
      const wallpaper = activeFlowConfig.flow.components.find(
        (c: any) => c.type === "WALLPAPER"
      );
      if (wallpaper) {
        updateWallpaper({
          mode: wallpaper.mode,
          value: wallpaper.value,
          tokenId: wallpaper.tokenId,
          mediaId: wallpaper.mediaId,
        });
      }
    }
  }, [activeFlowConfig, updateWallpaper]);

  // NEW: Query for active flow's wallpaper
  useQuery({
    queryKey: ["active-flow-wallpaper", activeOSFlowId],
    queryFn: async () => {
      if (!activeOSFlowId) return null;
      // AFTER (correct):
      const { data } = await axios.get(
        `/api/flows/${activeOSFlowId}/components`
      );
      const wallpaper = data?.components?.find(
        (c: any) => c.type === "WALLPAPER"
      );
      if (wallpaper) {
        updateWallpaper({
          mode: wallpaper.mode,
          value: wallpaper.value,
          tokenId: wallpaper.tokenId,
          mediaId: wallpaper.mediaId,
        });
      }
      return wallpaper;
    },
    enabled: !!activeOSFlowId,
  });

  // PRESERVED: Original video URL transformation
  const getVideoUrl = (url: string) => {
    const baseUrl = url.replace(/\/+$/, "");
    return `${baseUrl}/-/format/auto/`;
  };

  // PRESERVED: Original video handling effect
  // AFTER - Surgical fix:
  useEffect(() => {
    console.log("Current wallpaper config:", wallpaperConfig);

    if (!wallpaperConfig?.value) return;

    if (
      videoRef.current &&
      wallpaperConfig.mode === "media" &&
      wallpaperConfig.mediaId
    ) {
      // Reset load attempted when wallpaper changes
      loadAttempted.current = false;

      const videoUrl = getVideoUrl(wallpaperConfig.value);
      console.log("Loading video with URL:", videoUrl);

      // Cleanup previous video state
      videoRef.current.pause();
      videoRef.current.currentTime = 0;

      videoRef.current.src = videoUrl;
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.error("Video play error:", error);
        if (videoUrl !== wallpaperConfig.value) {
          console.log("Falling back to original URL");
          if (wallpaperConfig.value) {
            videoRef.current!.src = wallpaperConfig.value;
            videoRef.current!.load();
            videoRef.current!.play().catch(console.error);
          }
        }
      });

      loadAttempted.current = true;
    }

    // Cleanup function
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
        loadAttempted.current = false;
      }
    };
  }, [wallpaperConfig?.value, wallpaperConfig?.mediaId, wallpaperConfig?.mode]); // Added mode as dependency

  // PRESERVED: Original color mode rendering
  if (wallpaperConfig?.mode === "color") {
    return (
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundColor: getColor(wallpaperConfig.tokenId || "Black"),
        }}
      />
    );
  }

  // PRESERVED: Original media mode rendering
  if (wallpaperConfig?.mode === "media" && wallpaperConfig.value) {
    const isVideo = Boolean(wallpaperConfig.mediaId);

    console.log("Rendering media wallpaper:", {
      isVideo,
      mediaId: wallpaperConfig.mediaId,
      value: wallpaperConfig.value,
    });

    if (isVideo) {
      return (
        <div className="absolute inset-0 w-full h-full bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            autoPlay
            muted
            loop
            crossOrigin="anonymous"
            onLoadedData={() => console.log("Video loaded successfully")}
            onError={(e) => {
              console.error("Video error:", {
                error: e,
                src: videoRef.current?.src,
              });
            }}
          />
        </div>
      );
    }

    // PRESERVED: Original image rendering
    return (
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${wallpaperConfig.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  // PRESERVED: Original fallback
  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ backgroundColor: getColor("Black") }}
    />
  );
};

export default Wallpaper;
