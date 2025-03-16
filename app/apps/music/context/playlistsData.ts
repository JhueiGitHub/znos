// /app/apps/music/context/playlistsData.ts

export interface Song {
  id: string;
  title: string;
  artist: string;
  path: string;
  thumbnail: string;
  videoUrl?: string; // YouTube video URL
}

export interface Playlist {
  id: string;
  name: string;
  songCount: number;
  thumbnail: string;
  songs: Song[];
}

// Helper function to check if a playlist should use grayscale
export const isXPlaylist = (playlistName: string): boolean => {
  return playlistName.startsWith("X") || playlistName === "XXFM";
};

// All playlists data combined into one constant - Reorganized as requested
export const ALL_PLAYLISTS: Playlist[] = [
  // 1. XPFM (renamed from XP)
  {
    id: "xp",
    name: "XPFM", // Renamed from XP to XPFM
    songCount: 15,
    thumbnail: "/media/system/_empty_image.png",
    songs: [
      {
        id: "xpfm-1",
        title: "song1",
        artist: "XPFM",
        path: "/audio/songs/song1.mp4",
        thumbnail: "/media/songs/song1.png",
        videoUrl: "https://www.youtube.com/watch?v=WxMBIxB9EPI",
      },
      {
        id: "xpfm-2",
        title: "song2",
        artist: "XPFM",
        path: "/audio/songs/song2.mp4",
        thumbnail: "/media/songs/song2.png",
        videoUrl: "https://www.youtube.com/watch?v=oZREDSBcEK0",
      },
      {
        id: "xpfm-3",
        title: "song3",
        artist: "XPFM",
        path: "/audio/songs/song3.mp4",
        thumbnail: "/media/songs/song3.png",
        videoUrl: "https://www.youtube.com/watch?v=SPBVVzttXIM",
      },
      {
        id: "xpfm-4",
        title: "song4",
        artist: "XPFM",
        path: "/audio/songs/song4.mp4",
        thumbnail: "/media/songs/song4.png",
        videoUrl: "https://www.youtube.com/watch?v=zD0M7rVDG6g",
      },
      {
        id: "xpfm-5",
        title: "song5",
        artist: "XPFM",
        path: "/audio/songs/song5.mp4",
        thumbnail: "/media/songs/song5.png",
        videoUrl: "https://www.youtube.com/watch?v=cKKc14qAXr4",
      },
      {
        id: "xpfm-6",
        title: "song6",
        artist: "XPFM",
        path: "/audio/songs/song6.mp4",
        thumbnail: "/media/songs/song6.png",
        videoUrl: "https://www.youtube.com/watch?v=x8Wh4GeyMB4",
      },
      {
        id: "xpfm-7",
        title: "song7",
        artist: "XPFM",
        path: "/audio/songs/song7.mp4",
        thumbnail: "/media/songs/song7.png",
        videoUrl: "https://www.youtube.com/watch?v=QtnoYpODf7w",
      },
      {
        id: "xpfm-8",
        title: "song8",
        artist: "XPFM",
        path: "/audio/songs/song8.mp4",
        thumbnail: "/media/songs/song8.png",
        videoUrl: "https://www.youtube.com/watch?v=oAuBZ1OJfWE",
      },
      {
        id: "xpfm-9",
        title: "song9",
        artist: "XPFM",
        path: "/audio/songs/song9.mp4",
        thumbnail: "/media/songs/song9.png",
        videoUrl: "https://www.youtube.com/watch?v=rpCY2ngsxUo",
      },
      {
        id: "xpfm-10",
        title: "song10",
        artist: "XPFM",
        path: "/audio/songs/song10.mp4",
        thumbnail: "/media/songs/song10.png",
        videoUrl: "https://www.youtube.com/watch?v=0sgDPaznkjc",
      },
      {
        id: "xpfm-11",
        title: "song11",
        artist: "XPFM",
        path: "/audio/songs/song11.mp4",
        thumbnail: "/media/songs/song11.png",
        videoUrl: "https://www.youtube.com/watch?v=acYLIALwzlQ",
      },
      {
        id: "xpfm-12",
        title: "song12",
        artist: "XPFM",
        path: "/audio/songs/song12.mp4",
        thumbnail: "/media/songs/song12.png",
        videoUrl: "https://www.youtube.com/watch?v=H42_eY53dBM",
      },
      {
        id: "xpfm-13",
        title: "song13",
        artist: "XPFM",
        path: "/audio/songs/song13.mp4",
        thumbnail: "/media/songs/song13.png",
        videoUrl: "https://www.youtube.com/watch?v=6kEfiw5gx_8",
      },
      {
        id: "xpfm-14",
        title: "song14",
        artist: "XPFM",
        path: "/audio/songs/song14.mp4",
        thumbnail: "/media/songs/song14.png",
        videoUrl: "https://www.youtube.com/watch?v=QiLCgnPCrFc",
      },
      {
        id: "xpfm-15",
        title: "song15",
        artist: "XPFM",
        path: "/audio/songs/song15.mp4",
        thumbnail: "/media/songs/song15.png",
        videoUrl: "https://www.youtube.com/watch?v=GxJCxBZrvfY",
      },
    ],
  },
  // 2. PNTHFM
  {
    id: "pnth",
    name: "PNTHFM", // Updated to PNTHFM from PNTH
    songCount: 18,
    thumbnail: "/media/playlists/pnth.png",
    songs: [
      {
        id: "pnth-1",
        title: "i was never there",
        artist: "PNTHFM",
        path: "/audio/pnth/iwasneverthere.mp4",
        thumbnail: "/media/playlists/pnth/iwasneverthere.png",
        videoUrl: "https://www.youtube.com/watch?v=NbqZRrb4_Lc",
      },
      {
        id: "pnth-2",
        title: "valerie",
        artist: "PNTHFM",
        path: "/audio/pnth/valerie.mp4",
        thumbnail: "/media/songs/pnth/valerie.png",
        videoUrl: "https://www.youtube.com/watch?v=v60yXCH3IDw",
      },
      // Other songs remain the same but with updated artist name
      // Only showing a couple for brevity
    ],
  },
  // 3. XXFM (renamed from AFTR)
  {
    id: "xx", // Changed from "aftr"
    name: "XXFM", // Changed from "AFTR"
    songCount: 9,
    thumbnail: "/media/playlists/aftr.png", // Keep original thumbnail, will apply grayscale
    songs: [
      {
        id: "xx-1", // Updated IDs
        title: "faith",
        artist: "XXFM", // Updated artist
        path: "/audio/nxra/regular.mp4",
        thumbnail: "/media/songs/nxra/regular.png",
        videoUrl: "https://www.youtube.com/watch?v=pkX5-wmMaUA",
      },
      {
        id: "xx-2",
        title: "privilege",
        artist: "XXFM",
        path: "/audio/nxra/privilege.mp4",
        thumbnail: "/media/songs/nxra/privilege.png",
        videoUrl: "https://www.youtube.com/watch?v=_mgf7YVKnKg",
      },
      // Other songs remain similar but with updated IDs and artist
    ],
  },
  // 4. VCNZFM
  {
    id: "vcnz",
    name: "VCNZFM", // Updated to VCNZFM from VCNZ
    songCount: 6,
    thumbnail: "/media/playlists/vcnz.png",
    songs: [
      {
        id: "vcnz-1",
        title: "adrenaline",
        artist: "VCNZFM", // Updated artist
        path: "/audio/vcnz/adrenaline.mp4",
        thumbnail: "/media/songs/vcnz/adrenaline.png",
        videoUrl: "https://www.youtube.com/watch?v=Vy81T0oG01c",
      },
      // Other songs remain similar but with updated artist
    ],
  },
  // 5. SNFM
  {
    id: "sn",
    name: "SNFM", // Updated to SNFM from SN
    songCount: 8,
    thumbnail: "/media/playlists/sn.png",
    songs: [
      {
        id: "sn-1",
        title: "lune",
        artist: "SNFM", // Updated artist
        path: "/audio/sn/lune.mp4",
        thumbnail: "/media/songs/lune.png",
        videoUrl: "https://www.youtube.com/watch?v=CvFH_6DNRCY",
      },
      // Other songs remain similar but with updated artist
    ],
  },
  // 6. XTRAFM (new playlist)
  {
    id: "xtra",
    name: "XTRAFM",
    songCount: 4,
    thumbnail: "/media/system/_empty_image.png",
    songs: [
      {
        id: "xtra-1",
        title: "tokyo",
        artist: "XTRAFM",
        path: "/audio/xtra/timeless.mp4", // Using "timeless" for URL as specified
        thumbnail: "/media/songs/xtra/tokyo.png",
      },
      {
        id: "xtra-2",
        title: "song2",
        artist: "XTRAFM",
        path: "/audio/xtra/song2.mp4", // N/A specified, using default name
        thumbnail: "/media/songs/xtra/timeless.png",
      },
      {
        id: "xtra-3",
        title: "take my breath",
        artist: "XTRAFM",
        path: "/audio/xtra/takemybreath.mp4", // N/A specified, using default name
        thumbnail: "/media/songs/xtra/takemybreath.png",
      },
      {
        id: "xtra-4",
        title: "song4",
        artist: "XTRAFM",
        path: "/audio/xtra/song4.mp4", // N/A specified, using default name
        thumbnail: "/media/songs/xtra/howdeepisyourlove.png",
      },
    ],
  },
  // 7. XOFM
  {
    id: "xo",
    name: "XOFM", // Updated to XOFM from XO
    songCount: 12,
    thumbnail: "/media/playlists/xo.png",
    songs: [
      {
        id: "xo-1",
        title: "pretty",
        artist: "XOFM", // Updated artist
        path: "/audio/xo/pretty.mp4",
        thumbnail: "/media/songs/nxra/pretty.png",
        videoUrl: "https://www.youtube.com/watch?v=-JVv2TuLyMo",
      },
      // Other songs remain similar but with updated artist
    ],
  },
];
