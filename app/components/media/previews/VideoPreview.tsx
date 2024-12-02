// components/media/previews/VideoPreview.tsx
import { useEffect, useRef, useState } from "react";

interface VideoPreviewProps {
  url: string;
}

export function VideoPreview({ url }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // EVOLVED: Proper video loading and error handling
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    video.addEventListener("loadeddata", () => setIsLoaded(true));
    video.addEventListener("error", (e) => {
      console.error("Video loading error:", e);
      setIsLoaded(false);
    });

    return () => {
      video.removeEventListener("loadeddata", () => setIsLoaded(true));
      video.removeEventListener("error", () => setIsLoaded(false));
    };
  }, [url]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/50">
        <div className="text-[#748393] animate-pulse">Loading video...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2">
        <svg
          className="w-4 h-4 text-[#ABC4C3]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
        </svg>
      </div>
    </div>
  );
}
