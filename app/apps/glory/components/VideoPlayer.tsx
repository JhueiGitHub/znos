// Updated VideoPlayer.tsx
import { useStyles } from "@/app/hooks/useStyles";
import { YouTubePlayer } from './YouTubePlayer';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  platform?: 'youtube';  // Optional - only needed for YouTube videos
}

export function VideoPlayer({ videoId, title, platform }: VideoPlayerProps) {
  const { getColor } = useStyles();

  // If platform is explicitly set to youtube, use YouTube player
  if (platform === 'youtube') {
    return <YouTubePlayer videoId={videoId} title={title} />;
  }

  // Default to DailyMotion player
  const embedUrl = `https://geo.dailymotion.com/player.html?video=${videoId}&mute=false&queue-enable=false&ui-logo=0&ui-start-screen-info=false&sharing-enable=false&ui-logo-enable=0&queue-enable=0&sharing-enable=0&ui-highlights=false&ui-theme=dark&ui-watermark=false&pip-enable=false&ui-logo-show=false&ui-logo-position=none&ui-click-through=false`;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative w-full pt-[56.25%] overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          style={{
            border: "none",
          }}
        />
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