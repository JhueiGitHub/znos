// /root/app/apps/glory/context/VideoContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

interface Episode {
  title: string;
  videoId: string;
  description: string;
  duration: string;
  thumbnail?: string;
}

interface VideoContextType {
  currentEpisode: Episode | null;
  setCurrentEpisode: (episode: Episode) => void;
  episodes: Episode[];
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  // Expanded episodes array for all 16 episodes
  const episodes: Episode[] = [
    {
      title: "The Glory Episode 1",
      videoId: "x8itrjg",
      description:
        "Moon Dong-eun becomes a homeroom teacher at a high school to carry out her revenge plot.",
      duration: "47:18",
    },
    {
      title: "The Glory Episode 2",
      videoId: "x8ndz4w",
      description:
        "Dong-eun's past is revealed as she meticulously plans her vengeance.",
      duration: "48:22",
    },
    {
      title: "The Glory Episode 3",
      videoId: "x8ne6hh",
      description:
        "The perpetrators of Dong-eun's past begin to face the consequences.",
      duration: "50:09",
    },
    // Episodes 4-16 follow same pattern
    ...Array.from({ length: 13 }, (_, i) => ({
      title: `The Glory Episode ${i + 4}`,
      videoId: `x8ne6sr`,
      description: `Episode ${i + 4} of The Glory series.`,
      duration: "49:00",
    })),
  ];

  return (
    <VideoContext.Provider
      value={{ currentEpisode, setCurrentEpisode, episodes }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}
