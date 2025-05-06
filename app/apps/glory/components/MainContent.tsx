"use client";

import { useStyles } from "@/app/hooks/useStyles";
import { useVideo } from "../context/VideoContext";
import { VideoPlayer } from "./VideoPlayer";
import { Sidebar } from "./Sidebar";

export function MainContent() {
  const { getColor } = useStyles();
  const { currentContent, currentEpisode } = useVideo();

  if (!currentContent) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ color: getColor("Text Primary (Hd)") }}
      >
        <p className="text-lg">Select something to watch</p>
      </div>
    );
  }

  return (
    <>
      {currentContent.type === "series" && <Sidebar />}
      <div className="flex-1 h-full overflow-hidden">
        <VideoPlayer
          videoId={
            currentContent.type === "movie"
              ? currentContent.videoId
              : currentEpisode?.videoId || ""
          }
          title={
            currentContent.type === "movie"
              ? currentContent.title
              : currentEpisode?.title || ""
          }
          platform={
            (currentContent.type === "movie" && currentContent.platform === "youtube") ||
            (currentContent.type === "series" && currentEpisode?.platform === "youtube")
              ? "youtube"
              : undefined
          }
        />
      </div>
    </>
  );
}
