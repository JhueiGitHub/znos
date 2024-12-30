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

interface Series {
  id: string;
  title: string;
  rating: string;
  episodes: Episode[];
  thumbnail: string;
  description: string;
  maturityRating: string;
  episodeCount: number;
}

interface VideoContextType {
  currentEpisode: Episode | null;
  setCurrentEpisode: (episode: Episode) => void;
  currentSeries: Series | null;
  setCurrentSeries: (series: Series) => void;
  series: Series[];
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const SERIES_DATA: Series[] = [
  {
    id: "glory",
    title: "The Glory",
    rating: "97% Google User Review",
    thumbnail: "/apps/glory/glory_thumbnail.png",
    description:
      "A woman puts a carefully crafted revenge plan in motion after suffering traumatic abuse in high school.",
    maturityRating: "18+",
    episodeCount: 16,
    episodes: [
      {
        title: "The Glory Episode 1",
        videoId: "x8qgvfq",
        description:
          "Moon Dong-eun becomes a homeroom teacher at a high school to carry out her revenge plot.",
        duration: "47:18",
      },
      {
        title: "The Glory Episode 2",
        videoId: "x8qgvpl",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 3",
        videoId: "x8qgw2t",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 4",
        videoId: "x8qndtz",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 5",
        videoId: "x8qgw2t",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 6",
        videoId: "x8reoef",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 7",
        videoId: "x8reqi7",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 8",
        videoId: "x8rerdi",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 9",
        videoId: "x8qm9hq",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 10",
        videoId: "x8qm9jj",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 11",
        videoId: "x8qo5b1",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 12",
        videoId: "x8qo5b4",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 13",
        videoId: "x8qo5b3",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 14",
        videoId: "x8qo5b5",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 15",
        videoId: "x8qo5b2",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
      {
        title: "The Glory Episode 16",
        videoId: "x8qo5b6",
        description:
          "Dong-eun's past is revealed as she meticulously plans her vengeance.",
        duration: "48:22",
      },
    ],
  },
  {
    id: "bloodhounds",
    title: "Bloodhounds",
    rating: "95% Google User Review",
    thumbnail: "/apps/glory/bloodhounds_thumbnail.png",
    description:
      "Two young boxers band together with a benevolent moneylender to take down a ruthless loan shark who preys on the financially desperate.",
    maturityRating: "18+",
    episodeCount: 8,
    episodes: [
      {
        title: "Bloodhounds Episode 1",
        videoId: "x96xyww",
        description: "Episode 1 of Bloodhounds series",
        duration: "52:00",
      },
      {
        title: "Bloodhounds Episode 2",
        videoId: "x976r9s",
        description: "Episode 2 of Bloodhounds series",
        duration: "51:00",
      },
      {
        title: "Bloodhounds Episode 3",
        videoId: "x976rs0",
        description: "Episode 2 of Bloodhounds series",
        duration: "51:00",
      },
      {
        title: "Bloodhounds Episode 4",
        videoId: "x976rxi",
        description: "Episode 2 of Bloodhounds series",
        duration: "51:00",
      },
      {
        title: "Bloodhounds Episode 5",
        videoId: "x976sf6",
        description: "Episode 2 of Bloodhounds series",
        duration: "51:00",
      },
      {
        title: "Bloodhounds Episode 6",
        videoId: "x976ssm",
        description: "Episode 2 of Bloodhounds series",
        duration: "51:00",
      },
      {
        title: "Bloodhounds Episode 7",
        videoId: "x976swy",
        description: "Episode 2 of Bloodhounds series",
        duration: "51:00",
      },
      {
        title: "Bloodhounds Episode 8",
        videoId: "x976t6w",
        description: "Episode 2 of Bloodhounds series",
        duration: "51:00",
      },
    ],
  },
  {
    id: "taxi-driver",
    title: "Taxi Driver",
    rating: "94% Google User Review",
    thumbnail: "/apps/glory/taxi_thumbnail.png",
    description:
      "A mysterious taxi service helps victims of crime get revenge on their aggressors, with an ex-special forces officer serving as the service's chief operator.",
    maturityRating: "18+",
    episodeCount: 16,
    episodes: [
      {
        title: "Taxi Driver Episode 1",
        videoId: "x916ke6",
        description: "Episode 1 of Taxi Driver series",
        duration: "59:00",
      },
      {
        title: "Taxi Driver Episode 2",
        videoId: "placeholder-td2",
        description: "Episode 2 of Taxi Driver series",
        duration: "59:00",
      },
      ...Array.from({ length: 14 }, (_, i) => ({
        title: `Taxi Driver Episode ${i + 3}`,
        videoId: `placeholder-td${i + 3}`,
        description: `Episode ${i + 3} of Taxi Driver series`,
        duration: "59:00",
      })),
    ],
  },
];

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null);

  return (
    <VideoContext.Provider
      value={{
        currentEpisode,
        setCurrentEpisode,
        currentSeries,
        setCurrentSeries,
        series: SERIES_DATA,
      }}
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
