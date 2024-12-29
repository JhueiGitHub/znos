// /root/app/apps/glory/components/MainContent.tsx
"use client";

import { useStyles } from "@/app/hooks/useStyles";
import { useVideo } from "../context/VideoContext";
import { VideoPlayer } from "./VideoPlayer";

export function MainContent() {
  const { getColor } = useStyles();
  const { currentEpisode } = useVideo();

  return (
    <div className="flex-1 h-full overflow-hidden">
      {currentEpisode ? (
        <VideoPlayer
          videoId={currentEpisode.videoId}
          title={currentEpisode.title}
        />
      ) : (
        <div
          className="h-full flex items-center justify-center"
          style={{ color: getColor("Text Primary (Hd)") }}
        >
          <p className="text-lg">Select an episode to start watching</p>
        </div>
      )}
    </div>
  );
}
