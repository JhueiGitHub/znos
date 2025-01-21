// YouTubePlayer.tsx
import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { useStyles } from "@/app/hooks/useStyles";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
}

export function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
  const { getColor } = useStyles();
  const playerRef = useRef<any>(null);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      controls: 1,
    },
  };

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (playerRef.current?.internalPlayer) {
        playerRef.current.internalPlayer.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative w-full pt-[56.25%] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <YouTube
            ref={playerRef}
            videoId={videoId}
            opts={opts}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>
      </div>
      <div className="p-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: getColor("Text Primary (Hd)") }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}
