"use client";

import { useStyles } from "@/app/hooks/useStyles";
import { useVideo } from "../context/VideoContext";

export function Sidebar() {
  const { getColor } = useStyles();
  const { currentContent, setCurrentEpisode, currentEpisode } = useVideo();

  // Only show sidebar for series content
  if (!currentContent || currentContent.type !== "series") return null;

  return (
    <div
      className="w-64 h-full overflow-y-auto flex-shrink-0 p-4"
      style={{
        borderRight: `1px solid ${getColor("Brd")}`,
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: getColor("Text Primary (Hd)") }}
      >
        {currentContent.title} - Episodes
      </h2>
      <div className="space-y-2">
        {currentContent.episodes.map((episode, index) => (
          <button
            key={episode.videoId}
            onClick={() => setCurrentEpisode(episode)}
            className={`w-full text-left p-2 rounded transition-colors ${
              currentEpisode?.videoId === episode.videoId
                ? "bg-white/10"
                : "hover:bg-white/5"
            }`}
            style={{ color: getColor("Text Primary (Hd)") }}
          >
            Episode {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
