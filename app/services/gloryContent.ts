"use client";

// This is a hardcoded copy of CATEGORIES_DATA from VideoContext
// This way, we don't need to rely on the VideoContext being available
// and can still search Glory content from anywhere in the app

export const GLORY_CONTENT = [
  {
    id: "noire",
    name: "Noire",
    content: [
      {
        type: "series",
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
          // More episodes exist...
        ],
      },
      // More content exists...
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
          // More episodes exist...
        ],
      },
      // More content exists...
    ],
  },
  // More categories exist...
];

// Function to initialize the search index with Glory content
export function getGloryContent() {
  return GLORY_CONTENT;
}
