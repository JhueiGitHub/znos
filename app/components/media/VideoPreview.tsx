// components/media/VideoPlayer.tsx
import { useRef } from "react";

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          className="text-white/70 hover:text-white"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.paused
                ? videoRef.current.play()
                : videoRef.current.pause();
            }
          }}
        >
          {videoRef.current?.paused ? (
            <svg className="w-12 h-12" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
          ) : (
            <svg className="w-12 h-12" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
