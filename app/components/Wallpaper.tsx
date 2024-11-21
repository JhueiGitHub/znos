import { useEffect, useRef } from "react";
import { useStyles } from "../hooks/useStyles";
import { useAppStore } from "../store/appStore";

const Wallpaper = () => {
  const { getColor } = useStyles();
  const wallpaperConfig = useAppStore((state) => state.orionConfig?.wallpaper);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadAttempted = useRef(false);

  const getVideoUrl = (url: string) => {
    // Remove any trailing slashes and add transformations
    const baseUrl = url.replace(/\/+$/, "");
    return `${baseUrl}/-/format/auto/`;
  };

  useEffect(() => {
    console.log("Current wallpaper config:", wallpaperConfig);

    if (!wallpaperConfig?.value || loadAttempted.current) return;

    if (
      videoRef.current &&
      wallpaperConfig.mode === "media" &&
      wallpaperConfig.mediaId
    ) {
      loadAttempted.current = true;
      const videoUrl = getVideoUrl(wallpaperConfig.value);
      console.log("Loading video with URL:", videoUrl);

      videoRef.current.src = videoUrl;
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.error("Video play error:", error);
        // If transformation fails, try original URL
        if (videoUrl !== wallpaperConfig.value) {
          console.log("Falling back to original URL");
          if (wallpaperConfig.value) {
            videoRef.current!.src = wallpaperConfig.value;
            videoRef.current!.load();
            videoRef.current!.play().catch(console.error);
          }
        }
      });
    }
  }, [wallpaperConfig?.value, wallpaperConfig?.mediaId]);

  // Color mode
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

  // Media mode (both images and videos)
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

    // Image handler
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

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ backgroundColor: getColor("Black") }}
    />
  );
};

export default Wallpaper;
