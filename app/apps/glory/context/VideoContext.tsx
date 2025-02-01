"use client";

import React, { createContext, useContext, useState } from "react";

interface Episode {
  title: string;
  videoId: string;
  description: string;
  duration: string;
  thumbnail?: string;
}

// Base interface for common properties
interface BaseContent {
  id: string;
  title: string;
  rating: string;
  thumbnail: string;
  description: string;
  maturityRating: string;
}

// Series extends base content with episodes
interface Series extends BaseContent {
  type: "series";
  episodes: Episode[];
  episodeCount: number;
}

// Movie extends base content with a single video
interface Movie extends BaseContent {
  type: "movie";
  videoId: string;
  duration: string;
  platform?: string;
}

type Content = Series | Movie;

interface Category {
  id: string;
  name: string;
  content: Content[];
}

interface VideoContextType {
  currentEpisode: Episode | null;
  setCurrentEpisode: (episode: Episode | null) => void;
  currentContent: Content | null;
  setCurrentContent: (content: Content | null) => void;
  categories: Category[];
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const CATEGORIES_DATA: Category[] = [
  {
    id: "noire",
    name: "Noire",
    content: [
      {
        type: "series",
        id: "vincezo",
        title: "Vincezo",
        rating: "96% Google User Review",
        thumbnail: "/apps/glory/vincezo_thumbnail.png",
        description:
          "A woman puts a carefully crafted revenge plan in motion after suffering traumatic abuse in high school.",
        maturityRating: "18+",
        episodeCount: 16,
        episodes: [
          {
            title: "Vincezo Episode 1",
            videoId: "x8qgvfq",
            description:
              "Moon Dong-eun becomes a homeroom teacher at a high school to carry out her revenge plot.",
            duration: "47:18",
          },
          {
            title: "Vincezo Episode 2",
            videoId: "x8qgvpl",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 3",
            videoId: "x8qgw2t",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 4",
            videoId: "x8qndtz",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 5",
            videoId: "x8qgw2t",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 6",
            videoId: "x8reoef",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 7",
            videoId: "x8reqi7",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 8",
            videoId: "x8rerdi",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 9",
            videoId: "x8qm9hq",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 10",
            videoId: "x8qm9jj",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 11",
            videoId: "x8qo5b1",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 12",
            videoId: "x8qo5b4",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 13",
            videoId: "x8qo5b3",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 14",
            videoId: "x8qo5b5",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 15",
            videoId: "x8qo5b2",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 16",
            videoId: "x8qo5b6",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 17",
            videoId: "x8qo5b6",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 18",
            videoId: "x8qo5b6",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 19",
            videoId: "x8qo5b6",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "Vincezo Episode 20",
            videoId: "x8qo5b6",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
        ],
      },
      {
        type: "series",
        id: "itaewonclass",
        title: "Itaewon Class",
        rating: "95% Google User Review",
        thumbnail: "/apps/glory/itaewon_thumbnail.jpeg",
        description:
          "A woman puts a carefully crafted revenge plan in motion after suffering traumatic abuse in high school.",
        maturityRating: "18+",
        episodeCount: 16,
        episodes: [
          {
            title: "이태원 클라쓰 Episode 1",
            videoId: "x90ph2m",
            description:
              "Moon Dong-eun becomes a homeroom teacher at a high school to carry out her revenge plot.",
            duration: "47:18",
          },
          {
            title: "이태원 클라쓰 Episode 2",
            videoId: "x90phsw",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 3",
            videoId: "x90pi2o",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 4",
            videoId: "x90pi8k",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 5",
            videoId: "x90tybo",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 6",
            videoId: "x90tydy",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 7",
            videoId: "x90tyf4",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 8",
            videoId: "x90tyhm",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 9",
            videoId: "x90tywe",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 10",
            videoId: "x90tyxy",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 11",
            videoId: "x90vgto",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 12",
            videoId: "x90y1y2",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 13",
            videoId: "x90y1y2",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 14",
            videoId: "x90y1y2",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 15",
            videoId: "x90y1y2",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
          {
            title: "이태원 클라쓰 Episode 16",
            videoId: "x90y1y2",
            description:
              "Dong-eun's past is revealed as she meticulously plans her vengeance.",
            duration: "48:22",
          },
        ],
      },
      {
        type: "series",
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
        type: "series",
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
            videoId: "x9bb40a",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Taxi Driver Episode 2",
            videoId: "x9bbq3e",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Taxi Driver Episode 3",
            videoId: "x9bbvu4",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          ...Array.from({ length: 13 }, (_, i) => ({
            title: `Taxi Driver Episode ${i + 3}`,
            videoId: `placeholder-td${i + 3}`,
            description: `Episode ${i + 3} of Taxi Driver series`,
            duration: "59:00",
          })),
        ],
      },
      {
        type: "series",
        id: "move-to-heaven",
        title: "Move To Heaven",
        rating: "93% Google User Review",
        thumbnail: "/apps/glory/movetoheaven_thumbnail.jpeg",
        description:
          "A mysterious taxi service helps victims of crime get revenge on their aggressors, with an ex-special forces officer serving as the service's chief operator.",
        maturityRating: "18+",
        episodeCount: 16,
        episodes: [
          {
            title: "Taxi Driver Episode 1",
            videoId: "x9bb40a",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Taxi Driver Episode 2",
            videoId: "x9bbq3e",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Taxi Driver Episode 3",
            videoId: "x9bbvu4",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          ...Array.from({ length: 13 }, (_, i) => ({
            title: `Taxi Driver Episode ${i + 3}`,
            videoId: `placeholder-td${i + 3}`,
            description: `Episode ${i + 3} of Taxi Driver series`,
            duration: "59:00",
          })),
        ],
      },
    ],
  },
  {
    id: "toshiro",
    name: "Toshiro",
    content: [
      {
        type: "series",
        id: "demons",
        title: "Demons",
        rating: "96% Google User Review",
        thumbnail: "/apps/glory/demons_thumbnail.jpeg",
        description:
          "The story of a feudal lord in medieval Japan as he falls into madness and transforms into a demonic entity.",
        maturityRating: "18+",
        episodeCount: 3,
        episodes: [
          {
            title: "修羅 Part 1",
            videoId: "x5hoa7f",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "修羅 Part 2",
            videoId: "x5hoa9o",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "修羅 Part 3",
            videoId: "x5hoaaq",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
        ],
      },
      {
        type: "series",
        id: "seven-samurai",
        title: "Seven Samurai",
        rating: "93% Google User Review",
        thumbnail: "/apps/glory/seven_thumbnail.jpeg",
        description:
          "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
        maturityRating: "18+",
        episodeCount: 6,
        episodes: [
          {
            title: "七人の侍 Part 1",
            videoId: "x50funt",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "七人の侍 Part 2",
            videoId: "x50fual",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "七人の侍 Part 3",
            videoId: "x50fu0v",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "七人の侍 Part 4",
            videoId: "x50ftnn",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "七人の侍 Part 5",
            videoId: "x50979m",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "七人の侍 Part 6",
            videoId: "x509722",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
        ],
      },
      {
        type: "series",
        id: "sanjuro",
        title: "Sanjuro",
        rating: "93% Google User Review",
        thumbnail: "/apps/glory/sanjuro_thumbnail.jpeg",
        description:
          "A crafty samurai helps a young man and his fellow clansmen save his uncle, who has been framed and imprisoned by a corrupt superintendent.",
        maturityRating: "18+",
        episodeCount: 2,
        episodes: [
          {
            title: "椿三十郎 Part 1",
            videoId: "x103fa7",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "椿三十郎 Part 2",
            videoId: "x8vz8o2",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
        ],
      },
      {
        type: "series",
        id: "harakiri",
        title: "Harakiri",
        rating: "92% Google User Review",
        thumbnail: "/apps/glory/harakiri_thumbnail.jpeg",
        description:
          "An elder samurai challenges the moral and social contradictions of a feudal clan's bureaucracy.",
        maturityRating: "18+",
        episodeCount: 6,
        episodes: [
          {
            title: "切腹 Part 1",
            videoId: "xqi5po",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "切腹 Part 2",
            videoId: "xqi5r4",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "切腹 Part 3",
            videoId: "xqi5tl",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "切腹 Part 4",
            videoId: "xqi5ud",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "切腹 Part 5",
            videoId: "xqi5v0",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "切腹 Part 6",
            videoId: "xqi5wv",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
        ],
      },
      {
        type: "movie",
        id: "sword-of-doom",
        title: "Sword of Doom",
        rating: "91% Google User Review",
        thumbnail: "/apps/glory/sod_thumbnail.jpeg",
        description:
          "Through his rise to fame and eventual downfall, a sociopathic samurai wreaks havoc through feudal Japan.",
        maturityRating: "18+",
        videoId: "x8i6ucl",
        duration: "2:01:00",
      },
      {
        type: "movie",
        id: "twilight-samurai",
        title: "The Twilight Samurai",
        rating: "91% Google User Review",
        thumbnail: "/apps/glory/twilight_thumbnail.png",
        description:
          "A low-ranking samurai caring for his daughters and senile mother faces a crisis when he's ordered to kill a rebellious colleague.",
        maturityRating: "18+",
        videoId: "x8ixy7u",
        duration: "2:09:00",
      },
      {
        type: "movie",
        id: "yojimbo",
        title: "Yojimbo",
        rating: "90% Google User Review",
        thumbnail: "/apps/glory/yojimbo_thumbnail.jpeg",
        description:
          "A crafty ronin arrives in a town divided by two criminal gangs and decides to play them against each other to free the town.",
        maturityRating: "18+",
        videoId: "x8vz8o2",
        duration: "1:50:00",
      },
    ],
  },
  {
    id: "dragon",
    name: "Dragon",
    content: [
      {
        type: "movie",
        id: "fist-of-fury",
        title: "Fist of Fury",
        rating: "84% Google User Review",
        thumbnail: "/apps/glory/fof_thumbnail.jpeg",
        description:
          "A young man seeks revenge from the people who killed his master.",
        maturityRating: "18+",
        videoId: "x8x0ayc",
        duration: "1:47:00",
      },
      {
        type: "series",
        id: "big-boss",
        title: "The Big Boss",
        rating: "84% Google User Review",
        thumbnail: "/apps/glory/bb_thumbnail.jpeg",
        description:
          "A young man becomes involved in a dramatic series of events at an ice factory which turns out to be front for a drug trafficking ring.",
        maturityRating: "18+",
        episodeCount: 2,
        episodes: [
          {
            title: "唐山大兄 Part 1",
            videoId: "x5je76c",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "唐山大兄 Part 2",
            videoId: "x5jeb3c",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
        ],
      },
      {
        type: "movie",
        id: "game-of-death",
        title: "Game of Death",
        rating: "82% Google User Review",
        thumbnail: "/apps/glory/god_thumbnail.jpeg",
        description:
          "A martial arts movie star must fake his death to find the people who are trying to kill him.",
        maturityRating: "18+",
        videoId: "x99kzqw",
        duration: "1:39:00",
      },
      {
        type: "movie",
        id: "way-of-the-dragon",
        title: "Way of the Dragon",
        rating: "81% Google User Review",
        thumbnail: "/apps/glory/wod_thumbnail.jpeg",
        description:
          "A man visits his relatives at their restaurant in Italy and has to help them defend against brutal gangsters harassing them.",
        maturityRating: "18+",
        videoId: "x94t0cs",
        duration: "1:40:00",
      },
      {
        type: "movie",
        id: "enter-the-dragon",
        title: "Enter the Dragon",
        rating: "80% Google User Review",
        thumbnail: "/apps/glory/etd_thumbnail.jpeg",
        description:
          "A martial artist agrees to spy on a reclusive crime lord using his invitation to a tournament there as cover.",
        maturityRating: "18+",
        videoId: "x99nhnc",
        duration: "1:42:00",
      },
    ],
  },
  {
    id: "magna",
    name: "Magna",
    content: [
      {
        type: "movie",
        id: "philly",
        title: "Bill Burr Philly Rant",
        rating: "94% Google User Review",
        thumbnail: "/apps/glory/philly_thumbnail.png",
        description:
          "A martial artist agrees to spy on a reclusive crime lord using his invitation to a tournament there as cover.",
        maturityRating: "18+",
        videoId: "x3zkg5m",
        duration: "1:42:00",
      },
      {
        type: "movie",
        id: "boomerang",
        title: "Boomerang HD",
        rating: "90% Google User Review",
        thumbnail: "/apps/glory/boomerang_thumbnail.png",
        description:
          "A martial artist agrees to spy on a reclusive crime lord using his invitation to a tournament there as cover.",
        maturityRating: "18+",
        videoId: "x2lzd57",
        duration: "1:42:00",
      },
      {
        type: "series",
        id: "fonejacker",
        title: "Fonejacker",
        rating: "90% Google User Review",
        thumbnail: "/apps/glory/fonejacker_thumbnail.jpeg",
        description:
          "A young man becomes involved in a dramatic series of events at an ice factory which turns out to be front for a drug trafficking ring.",
        maturityRating: "18+",
        episodeCount: 12,
        episodes: [
          {
            title: "Fonejacker S1 E1",
            videoId: "x83bwla",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S1 E2",
            videoId: "x83bwlc",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S1 E3",
            videoId: "x6oitp9",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S1 E4",
            videoId: "x83bwlg",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S1 E5",
            videoId: "x83bwlk",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S1 E6",
            videoId: "x6oiuhr",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S2 E1",
            videoId: "x83d68h",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S2 E2",
            videoId: "x83d6cj",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S2 E3",
            videoId: "x83d6fl",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S2 E4",
            videoId: "x83d7as",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S2 E5",
            videoId: "x2am9k0",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Fonejacker S2 E6",
            videoId: "x83e1i9",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
        ],
      },
      {
        type: "series",
        id: "facejacker",
        title: "Facejacker",
        rating: "86% Google User Review",
        thumbnail: "/apps/glory/facejacker_thumbnail.jpeg",
        description:
          "A young man becomes involved in a dramatic series of events at an ice factory which turns out to be front for a drug trafficking ring.",
        maturityRating: "18+",
        episodeCount: 12,
        episodes: [
          {
            title: "Facejacker S1 E1",
            videoId: "x2am8jk",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S1 E2",
            videoId: "x6sgwf9",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S1 E3",
            videoId: "x6ci87s",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S1 E4",
            videoId: "x6ci84j",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S1 E5",
            videoId: "x6ci860",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S1 E6",
            videoId: "x6oiuhr",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S2 E1",
            videoId: "x6sgwhu",
            description: "Episode 1 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S2 E2",
            videoId: "x6ci870",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S2 E3",
            videoId: "x83d6fl",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S2 E4",
            videoId: "x2am9hg",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S2 E5",
            videoId: "x2am9k0",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
          {
            title: "Facejacker S2 E6",
            videoId: "x6ci872",
            description: "Episode 2 of Taxi Driver series",
            duration: "59:00",
          },
        ],
      },
    ],
  },
];

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);

  return (
    <VideoContext.Provider
      value={{
        currentEpisode,
        setCurrentEpisode,
        currentContent,
        setCurrentContent,
        categories: CATEGORIES_DATA,
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
