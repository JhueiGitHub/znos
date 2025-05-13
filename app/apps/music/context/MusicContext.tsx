// /root/app/apps/music/context/MusicContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  path: string;
  thumbnail: string;
  videoUrl?: string; // YouTube video URL
}

interface Playlist {
  id: string;
  name: string;
  songCount: number;
  thumbnail: string;
  songs: Song[];
}

interface MusicContextType {
  seek: (time: number) => void;
  songs: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  songProgress: number;
  volume: number;
  currentTime: number;
  duration: number;
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  setSongs: (songs: Song[]) => void;
  setCurrentSongIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSongProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  playPlaylist: (playlistId: string) => void;
  isWallpaperMode: boolean;
  toggleWallpaperMode: () => void;
  fmModeEnabled: Record<string, boolean>;
  toggleFmMode: (playlistId: string) => void;
  // New shuffle-related properties
  shuffleModeEnabled: Record<string, boolean>;
  toggleShuffleMode: (playlistId: string) => void;
  resetShuffleForPlaylist: (playlistId: string) => void;
  shuffledSongIndices: Record<string, number[]>;
}

// All playlists data combined into one constant
const ALL_PLAYLISTS: Playlist[] = [
  {
    id: "xp",
    name: "XP",
    songCount: 15,
    thumbnail: "/media/system/_empty_image.png",
    songs: [
      {
        id: "xpfm-1",
        title: "song1",
        artist: "XPFM",
        path: "/audio/songs/song1.mp4",
        thumbnail: "/media/songs/song1.png",
        videoUrl: "https://www.youtube.com/watch?v=ZfVzCgUwPCI",
      },
      {
        id: "xpfm-2",
        title: "song2",
        artist: "XPFM",
        path: "/audio/songs/song2.mp4",
        thumbnail: "/media/songs/song1.png",
        videoUrl: "https://www.youtube.com/watch?v=WxMBIxB9EPI",
      },
      {
        id: "xpfm-3",
        title: "song3",
        artist: "XPFM",
        path: "/audio/songs/song3.mp4",
        thumbnail: "/media/songs/song2.png",
        videoUrl: "https://www.youtube.com/watch?v=oZREDSBcEK0",
      },
      {
        id: "xpfm-4",
        title: "song4",
        artist: "XPFM",
        path: "/audio/songs/song4.mp4",
        thumbnail: "/media/songs/song3.png",
        videoUrl: "https://www.youtube.com/watch?v=SPBVVzttXIM",
      },
      {
        id: "xpfm-5",
        title: "song5",
        artist: "XPFM",
        path: "/audio/songs/song5.mp4",
        thumbnail: "/media/songs/song4.png",
        videoUrl: "https://www.youtube.com/watch?v=zD0M7rVDG6g",
      },
      {
        id: "xpfm-6",
        title: "song6",
        artist: "XPFM",
        path: "/audio/songs/song6.mp4",
        thumbnail: "/media/songs/song5.png",
        videoUrl: "https://www.youtube.com/watch?v=cKKc14qAXr4",
      },
      {
        id: "xpfm-7",
        title: "song7",
        artist: "XPFM",
        path: "/audio/songs/song7.mp4",
        thumbnail: "/media/songs/song6.png",
        videoUrl: "https://www.youtube.com/watch?v=x8Wh4GeyMB4",
      },
      {
        id: "xpfm-8",
        title: "song8",
        artist: "XPFM",
        path: "/audio/songs/song8.mp4",
        thumbnail: "/media/songs/song7.png",
        videoUrl: "https://www.youtube.com/watch?v=QtnoYpODf7w",
      },
      {
        id: "xpfm-9",
        title: "song9",
        artist: "XPFM",
        path: "/audio/songs/song9.mp4",
        thumbnail: "/media/songs/song9.png",
        videoUrl: "https://www.youtube.com/watch?v=oAuBZ1OJfWE",
      },
      {
        id: "xpfm-10",
        title: "song10",
        artist: "XPFM",
        path: "/audio/songs/song10.mp4",
        thumbnail: "/media/songs/song10.png",
        videoUrl: "https://www.youtube.com/watch?v=rpCY2ngsxUo",
      },
      {
        id: "xpfm-11",
        title: "song11",
        artist: "XPFM",
        path: "/audio/songs/song11.mp4",
        thumbnail: "/media/songs/song11.png",
        videoUrl: "https://www.youtube.com/watch?v=0sgDPaznkjc",
      },
      {
        id: "xpfm-12",
        title: "song12",
        artist: "XPFM",
        path: "/audio/songs/song12.mp4",
        thumbnail: "/media/songs/song12.png",
        videoUrl: "https://www.youtube.com/watch?v=acYLIALwzlQ",
      },
      {
        id: "xpfm-13",
        title: "song13",
        artist: "XPFM",
        path: "/audio/songs/song13.mp4",
        thumbnail: "/media/songs/song13.png",
        videoUrl: "https://www.youtube.com/watch?v=H42_eY53dBM",
      },
      {
        id: "xpfm-14",
        title: "song14",
        artist: "XPFM",
        path: "/audio/songs/song14.mp4",
        thumbnail: "/media/songs/song14.png",
        videoUrl: "https://www.youtube.com/watch?v=GxJCxBZrvfY",
      },
      {
        id: "xpfm-15",
        title: "song15",
        artist: "XPFM",
        path: "/audio/songs/song15.mp4",
        thumbnail: "/media/songs/song15.png",
        videoUrl: "https://www.youtube.com/watch?v=QiLCgnPCrFc",
      },
      {
        id: "xpfm-16",
        title: "song16",
        artist: "XPFM",
        path: "/audio/songs/song16.mp4",
        thumbnail: "/media/songs/song16.png",
        videoUrl: "https://www.youtube.com/watch?v=Y_vsK993ENk",
      },
    ],
  },
  {
    id: "pnth",
    name: "PNTH",
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
      {
        id: "pnth-3",
        title: "in your eyes",
        artist: "PNTHFM",
        path: "/audio/pnth/inyoureyes.mp4",
        thumbnail: "/media/songs/pnth/inyoureyes.png",
        videoUrl: "https://www.youtube.com/watch?v=QLNyHl4nwEo",
      },
      {
        id: "pnth-4",
        title: "starry eyes",
        artist: "PNTHFM",
        path: "/audio/pnth/starryeyes.mp4",
        thumbnail: "/media/songs/pnth/starryeyes.png",
        videoUrl: "https://www.youtube.com/watch?v=SDyf6f7qhcY",
      },
      {
        id: "pnth-5",
        title: "i can't feel my face",
        artist: "PNTHFM",
        path: "/audio/pnth/icantfeelmyface.mp4",
        thumbnail: "/media/songs/pnth/icantfeelmyface.png",
        videoUrl: "https://www.youtube.com/watch?v=533ct1vFHmM",
      },
      {
        id: "pnth-6",
        title: "call out my name",
        artist: "PNTHFM",
        path: "/audio/pnth/calloutmyname.mp4",
        thumbnail: "/media/songs/pnth/calloutmyname.png",
        videoUrl: "https://www.youtube.com/watch?v=ZIBLdNxW5do",
      },
      {
        id: "pnth-7",
        title: "nothing without you",
        artist: "PNTHFM",
        path: "/audio/pnth/nothingwithoutyou.mp4",
        thumbnail: "/media/songs/pnth/nothingwithoutyou.png",
        videoUrl: "https://www.youtube.com/watch?v=LaeJJ9aB9e8",
      },
      {
        id: "pnth-8",
        title: "professional",
        artist: "PNTHFM",
        path: "/audio/pnth/professional.mp4",
        thumbnail: "/media/songs/pnth/professional.png",
        videoUrl: "https://www.youtube.com/watch?v=XzM3d5dBJns",
      },
      {
        id: "pnth-9",
        title: "in the night",
        artist: "PNTHFM",
        path: "/audio/pnth/inthenight.mp4",
        thumbnail: "/media/songs/pnth/inthenight.png",
        videoUrl: "https://www.youtube.com/watch?v=AXM10bYqtUc",
      },
      {
        id: "pnth-10",
        title: "adaptation",
        artist: "PNTHFM",
        path: "/audio/pnth/adaptation.mp4",
        thumbnail: "/media/songs/pnth/adaptation.png",
        videoUrl: "https://www.youtube.com/watch?v=TgKcNj8fKpI",
      },
      {
        id: "pnth-11",
        title: "pray for me",
        artist: "PNTHFM",
        path: "/audio/pnth/pray.mp4",
        thumbnail: "/media/songs/pnth/pray.png",
        videoUrl: "https://www.youtube.com/watch?v=QRj2JP0Fe1c",
      },
      {
        id: "pnth-12",
        title: "starboy",
        artist: "PNTHFM",
        path: "/audio/pnth/starboy.mp4",
        thumbnail: "/media/songs/pnth/starboy.png",
        videoUrl: "https://www.youtube.com/watch?v=mFMNIlhIUvs",
      },
      {
        id: "pnth-13",
        title: "power is power",
        artist: "PNTHFM",
        path: "/audio/pnth/power.mp4",
        thumbnail: "/media/songs/pnth/power.png",
        videoUrl: "https://www.youtube.com/watch?v=x8Wh4GeyMB4",
      },
      {
        id: "pnth-14",
        title: "take my breath",
        artist: "PNTHFM",
        path: "/audio/pnth/takemybreath.mp4",
        thumbnail: "/media/songs/pnth/takemybreath.png",
        videoUrl: "https://www.youtube.com/watch?v=q266o-KOUMk",
      },
      {
        id: "pnth-15",
        title: "moth to a flame",
        artist: "PNTHFM",
        path: "/audio/pnth/mothtoaflame.mp4",
        thumbnail: "/media/songs/pnth/mothtoaflame.png",
        videoUrl: "https://www.youtube.com/watch?v=gl1v-nWiGLk",
      },
      {
        id: "pnth-16",
        title: "lowlife",
        artist: "PNTHFM",
        path: "/audio/pnth/lowlife.mp4",
        thumbnail: "/media/songs/pnth/lowlife.png",
        videoUrl: "https://www.youtube.com/watch?v=nqcjuk0o7YM",
      },
      {
        id: "pnth-17",
        title: "after hours",
        artist: "PNTHFM",
        path: "/audio/pnth/afterhours.mp4",
        thumbnail: "/media/songs/pnth/afterhours.png",
        videoUrl: "https://www.youtube.com/watch?v=pV0ngdzx7RE",
      },
      {
        id: "pnth-18",
        title: "pretty",
        artist: "PNTHFM",
        path: "/audio/pnth/pretty.mp4",
        thumbnail: "/media/songs/pnth/pretty.png",
        videoUrl: "https://www.youtube.com/watch?v=b_SwuIozFdQ",
      },
      {
        id: "pnth-19",
        title: "song19",
        artist: "PNTHFM",
        path: "/audio/pnth/mania.mp4",
        thumbnail: "/media/songs/pnth/mania.png",
        videoUrl: "https://www.youtube.com/watch?v=kBsycvSU6r8",
      },
    ],
  },
  {
    id: "XX",
    name: "XX",
    songCount: 9,
    thumbnail: "/media/playlists/xx.png",
    songs: [
      {
        id: "aftr-1",
        title: "faith",
        artist: "XXFM",
        path: "/audio/nxra/regular.mp4",
        thumbnail: "/media/songs/nxra/regular.png",
        videoUrl: "https://www.youtube.com/watch?v=pkX5-wmMaUA",
      },
      {
        id: "aftr-2",
        title: "privilege",
        artist: "XXFM",
        path: "/audio/nxra/privilege.mp4",
        thumbnail: "/media/songs/nxra/privilege.png",
        videoUrl: "https://www.youtube.com/watch?v=_mgf7YVKnKg",
      },
      {
        id: "aftr-3",
        title: "after hours",
        artist: "XXFM",
        path: "/audio/nxra/afterhours.mp4",
        thumbnail: "/media/songs/nxra/afterhours.png",
        videoUrl: "https://www.youtube.com/watch?v=mj1Y5AWtvmM",
      },
      {
        id: "aftr-4",
        title: "too late",
        artist: "XXFM",
        path: "/audio/nxra/toolate.mp4",
        thumbnail: "/media/songs/nxra/toolate.png",
        videoUrl: "https://www.youtube.com/watch?v=qd9N1DoitW0",
      },
      {
        id: "aftr-5",
        title: "open hearts",
        artist: "XXFM",
        path: "/audio/nxra/openhearts.mp4",
        thumbnail: "/media/songs/nxra/openhearts.png",
        videoUrl: "https://www.youtube.com/watch?v=f9sj9yEziQY",
      },
      {
        id: "aftr-6",
        title: "try me",
        artist: "XXFM",
        path: "/audio/nxra/tryme.mp4",
        thumbnail: "/media/songs/nxra/tryme.png",
        videoUrl: "https://www.youtube.com/watch?v=Qi7bA43x0cg",
      },
      {
        id: "aftr-7",
        title: "often",
        artist: "XXFM",
        path: "/audio/nxra/often.mp4",
        thumbnail: "/media/songs/nxra/often.png",
        videoUrl: "https://www.youtube.com/watch?v=9fF491-R2do",
      },
      {
        id: "aftr-8",
        title: "low life",
        artist: "XXFM",
        path: "/audio/nxra/lowlife.mp4",
        thumbnail: "/media/songs/nxra/lowlife.png",
        videoUrl: "https://www.youtube.com/watch?v=1ZIm3m92_vQ",
      },
      {
        id: "aftr-9",
        title: "sacrafice",
        artist: "XXFM",
        path: "/audio/nxra/sacrafice.mp4",
        thumbnail: "/media/songs/nxra/sacrafice.png",
        videoUrl: "https://www.youtube.com/watch?v=yDFbpYdcK-Q",
      },
      {
        id: "aftr-10",
        title: "song10",
        artist: "XXFM",
        path: "/audio/nxra/song10.mp4",
        thumbnail: "/media/songs/nxra/song10.png",
        videoUrl: "https://www.youtube.com/watch?v=JpK2qaejBOk",
      },
    ],
  },
  {
    id: "vcnz",
    name: "VCNZ",
    songCount: 6,
    thumbnail: "/media/playlists/vcnz.png",
    songs: [
      {
        id: "vcnz-1",
        title: "adrenaline",
        artist: "VCNZFM",
        path: "/audio/vcnz/adrenaline.mp4",
        thumbnail: "/media/songs/vcnz/adrenaline.png",
        videoUrl: "https://www.youtube.com/watch?v=Vy81T0oG01c",
      },
      {
        id: "vcnz-2",
        title: "mafia",
        artist: "VCNZFM",
        path: "/audio/vcnz/mafia.mp4",
        thumbnail: "/media/songs/vcnz/mafia.png",
        videoUrl: "https://www.youtube.com/watch?v=Vy81T0oG01c",
      },
      {
        id: "vcnz-3",
        title: "un diavolo scaccia l'altro",
        artist: "VCNZFM",
        path: "/audio/vcnz/diavolo.mp4",
        thumbnail: "/media/songs/vcnz/diavolo.png",
        videoUrl:
          "https://www.youtube.com/watch?v=Rozhhito9Ew&pp=ygUTdmluY2Vuem8gc291bmR0cmFjaw%3D%3D",
      },
      {
        id: "vcnz-4",
        title: "retributor",
        artist: "VCNZFM",
        path: "/audio/vcnz/retributor.mp4",
        thumbnail: "/media/songs/vcnz/retributor.png",
        videoUrl:
          "https://www.youtube.com/watch?v=hRoNVhyOCKk&pp=ygUTdmluY2Vuem8gc291bmR0cmFjaw%3D%3D",
      },
      {
        id: "vcnz-5",
        title: "your vacancy",
        artist: "VCNZFM",
        path: "/audio/vcnz/yourvacancy.mp4",
        thumbnail: "/media/songs/vcnz/yourvacancy.png",
        videoUrl:
          "https://www.youtube.com/watch?v=sUjtNYhTr7M&list=PLP-eBeyXNQLrg6XprN1VTVhRdROfQYZ49&index=33&pp=iAQB8AUB",
      },
      {
        id: "vcnz-6",
        title: "empty mind",
        artist: "VCNZFM",
        path: "/audio/vcnz/emptymind.mp4",
        thumbnail: "/media/songs/vcnz/emptymind.png",
        videoUrl:
          "https://www.youtube.com/watch?v=2609nR2di5Y&list=PLP-eBeyXNQLrg6XprN1VTVhRdROfQYZ49&index=20&pp=iAQB8AUB",
      },
      {
        id: "vcnz-7",
        title: "song7",
        artist: "VCNZFM",
        path: "/audio/vcnz/song7.mp4",
        thumbnail: "/media/songs/vcnz/emptymind.png",
        videoUrl: "https://www.youtube.com/watch?v=mt0iqJ1eULo",
      },
    ],
  },
  {
    id: "sn",
    name: "SN",
    songCount: 8,
    thumbnail: "/media/playlists/sn.png",
    songs: [
      {
        id: "sn-1",
        title: "lune",
        artist: "SNFM",
        path: "/audio/sn/lune.mp4",
        thumbnail: "/media/songs/lune.png",
        videoUrl: "https://www.youtube.com/watch?v=CvFH_6DNRCY",
      },
      {
        id: "sn-2",
        title: "sns",
        artist: "SNFM",
        path: "/audio/sn/swans.mp4",
        thumbnail: "/media/songs/sns.png",
        videoUrl: "https://youtube.com/watch?v=MyzfjP_wXBw",
      },
      {
        id: "sn-3",
        title: "ballade",
        artist: "SNFM",
        path: "/audio/sn/ballade.mp4",
        thumbnail: "/media/songs/ballade.png",
        videoUrl: "https://www.youtube.com/watch?v=2uvAewYkEFU",
      },
      {
        id: "sn-4",
        title: "nocturne",
        artist: "SNFM",
        path: "/audio/sn/nocturne.mp4",
        thumbnail: "/media/songs/nocturne.png",
        videoUrl: "https://www.youtube.com/watch?v=T7k2pmKUXxI",
      },
      {
        id: "sn-5",
        title: "fantasia",
        artist: "SNFM",
        path: "/audio/sn/fantasia.mp4",
        thumbnail: "/media/songs/fantasia.png",
        videoUrl: "https://www.youtube.com/watch?v=zlWAdUPUCJw",
      },
      {
        id: "sn-6",
        title: "overuse",
        artist: "SNFM",
        path: "/audio/sn/overuse.mp4",
        thumbnail: "/media/songs/overuse.png",
        videoUrl: "https://www.youtube.com/watch?v=rrBsvldbwdQ",
      },
      {
        id: "sn-7",
        title: "lacrimosa",
        artist: "SNFM",
        path: "/audio/sn/lacrimosa.mp4",
        thumbnail: "/media/songs/lacrimosa.png",
        videoUrl: "https://www.youtube.com/watch?v=mt6m63ylw-g",
      },
      {
        id: "sn-8",
        title: "lake",
        artist: "SNFM",
        path: "/audio/sn/lake.mp4",
        thumbnail: "/media/songs/lake.png",
        videoUrl: "https://www.youtube.com/watch?v=xF_x4oenM1E",
      },
      {
        id: "sn-9",
        title: "song9",
        artist: "SNFM",
        path: "/audio/sn/song9.mp4",
        thumbnail: "/media/songs/song9.png",
        videoUrl: "https://www.youtube.com/watch?v=zQebdkLvD00",
      },
    ],
  },
  {
    id: "xtc",
    name: "XTC",
    songCount: 15,
    thumbnail: "/media/playlists/xtc.png",
    songs: [
      {
        id: "xtc-1",
        title: "song1",
        artist: "XTCFM",
        path: "/audio/xtc/saopaulo.mp4",
        thumbnail: "/media/songs/saopaulo.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-2",
        title: "song2",
        artist: "XTCFM",
        path: "/audio/xtc/timeless.mp4",
        thumbnail: "/media/songs/timeless.png",
        videoUrl: "https://www.youtube.com/watch?v=3upvj6tDHoI",
      },
      {
        id: "xtc-3",
        title: "song3",
        artist: "XTCFM",
        path: "/audio/xtc/howdeepisyourlove.mp4",
        thumbnail: "/media/songs/howdeepisyourlove.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-4",
        title: "song4",
        artist: "XTCFM",
        path: "/audio/xtc/song4.mp4",
        thumbnail: "/media/songs/song4.png",
        videoUrl: "https://www.youtube.com/watch?v=h9NSpC2xE-0",
      },
      {
        id: "xtc-5",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/siai.mp4",
        thumbnail: "/media/songs/siai.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-6",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/malamente.mp4",
        thumbnail: "/media/songs/malamente.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-7",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/yekeyeke.mp4",
        thumbnail: "/media/songs/yekeyeke.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-8",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/thehills.mp4",
        thumbnail: "/media/songs/thehills.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-9",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/alldayandnight.mp4",
        thumbnail: "/media/songs/alldayandnight.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-10",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/notearslefttocry.mp4",
        thumbnail: "/media/songs/notearslefttocry.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-11",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/lifeline.mp4",
        thumbnail: "/media/songs/lifeline.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-14",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/starboy.mp4",
        thumbnail: "/media/songs/starboy.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-15",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/youright.mp4",
        thumbnail: "/media/songs/youright.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-16",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/popular.mp4",
        thumbnail: "/media/songs/popular.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-17",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/breakmyheart.mp4",
        thumbnail: "/media/songs/breakmyheart.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-12",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/often.mp4",
        thumbnail: "/media/songs/often.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-19",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/provenza.mp4",
        thumbnail: "/media/songs/provenza.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
      {
        id: "xtc-20",
        title: "xtra",
        artist: "XTCFM",
        path: "/audio/xtc/enchantedwaterfall.mp4",
        thumbnail: "/media/songs/enchantedwaterfall.png",
        videoUrl: "https://www.youtube.com/watch?v=FiE1pA_86S4",
      },
    ],
  },
  {
    id: "xo",
    name: "XO",
    songCount: 12,
    thumbnail: "/media/playlists/xo.png",
    songs: [
      {
        id: "xo-1",
        title: "pretty",
        artist: "XO",
        path: "/audio/xo/pretty.mp4",
        thumbnail: "/media/songs/nxra/pretty.png",
        videoUrl: "https://www.youtube.com/watch?v=-JVv2TuLyMo",
      },
      {
        id: "xo-2",
        title: "wicked games",
        artist: "XO",
        path: "/audio/xo/wickedgames.mp4",
        thumbnail: "/media/songs/nxra/song13.png",
        videoUrl: "https://www.youtube.com/watch?v=OG0AONeJb3w",
      },
      {
        id: "xo-3",
        title: "the knowing",
        artist: "XO",
        path: "/audio/xo/theknowing.mp4",
        thumbnail: "/media/songs/nxra/theknowing.png",
        videoUrl: "https://www.youtube.com/watch?v=ATKejfb_CEo",
      },
      {
        id: "xo-4",
        title: "valerie",
        artist: "XO",
        path: "/audio/xo/valerie.mp4",
        thumbnail: "/media/songs/nxra/valerie.png",
        videoUrl: "https://www.youtube.com/watch?v=inDquagdkaY",
      },
      {
        id: "xo-5",
        title: "professional",
        artist: "XO",
        path: "/audio/xo/professional.mp4",
        thumbnail: "/media/songs/nxra/professional.png",
        videoUrl: "https://www.youtube.com/watch?v=dJ411PNfyXQ",
      },
      {
        id: "xo-6",
        title: "the town",
        artist: "XO",
        path: "/audio/xo/thetown.mp4",
        thumbnail: "/media/songs/nxra/thetown.png",
        videoUrl: "https://www.youtube.com/watch?v=PAN6mc-3cyI",
      },
      {
        id: "xo-7",
        title: "adaptation",
        artist: "XO",
        path: "/audio/xo/adaptation.mp4",
        thumbnail: "/media/songs/nxra/adaptation.png",
        videoUrl: "https://www.youtube.com/watch?v=dJ411PNfyXQ",
      },
      {
        id: "xo-8",
        title: "love in the sky",
        artist: "XO",
        path: "/audio/xo/loveinthesky.mp4",
        thumbnail: "/media/songs/nxra/loveinthesky.png",
        videoUrl: "https://www.youtube.com/watch?v=sU4UQRxISFU",
      },
      {
        id: "xo-9",
        title: "privilege",
        artist: "XO",
        path: "/audio/xo/privilege.mp4",
        thumbnail: "/media/songs/nxra/privilege.png",
        videoUrl: "https://www.youtube.com/watch?v=cZdCRW4UWkk",
      },
      {
        id: "xo-10",
        title: "snowchild",
        artist: "XO",
        path: "/audio/xo/snowchild.mp4",
        thumbnail: "/media/songs/nxra/snowchild.png",
        videoUrl: "https://www.youtube.com/watch?v=pF7N659wVRg",
      },
      {
        id: "xo-11",
        title: "shameless",
        artist: "XO",
        path: "/audio/xo/shameless.mp4",
        thumbnail: "/media/songs/nxra/shameless.png",
        videoUrl: "https://www.youtube.com/watch?v=5GetQaksxJ0",
      },
      {
        id: "xo-12",
        title: "song13",
        artist: "XO",
        path: "/audio/xo/song13.mp4",
        thumbnail: "/media/songs/nxra/song13.png",
        videoUrl: "https://www.youtube.com/watch?v=NovEzbESlL8",
      },
      {
        id: "xo-13",
        title: "i was never there",
        artist: "XO",
        path: "/audio/xo/iwasneverthere.mp4",
        thumbnail: "/media/songs/nxra/iwasneverthere.png",
        videoUrl: "https://www.youtube.com/watch?v=ZIDB9mp0Cn0",
      },
    ],
  },
];

const STORAGE_KEY = "musicState";

interface PersistedState {
  currentSongIndex: number;
  currentTime: number;
  volume: number;
  currentPlaylistId: string;
  fmModeEnabled: Record<string, boolean>;
  // New shuffle-related state
  shuffleModeEnabled: Record<string, boolean>;
  shuffledSongIndices: Record<string, number[]>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  // Load persisted state from localStorage
  const loadPersistedState = (): PersistedState => {
    if (typeof window === "undefined")
      return {
        currentSongIndex: 0,
        currentTime: 0,
        volume: 1,
        currentPlaylistId: "xpfm",
        fmModeEnabled: {},
        shuffleModeEnabled: {},
        shuffledSongIndices: {},
      };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved)
      return {
        currentSongIndex: 0,
        currentTime: 0,
        volume: 1,
        currentPlaylistId: "xpfm",
        fmModeEnabled: {},
        shuffleModeEnabled: {},
        shuffledSongIndices: {},
      };

    try {
      return JSON.parse(saved);
    } catch {
      return {
        currentSongIndex: 0,
        currentTime: 0,
        volume: 1,
        currentPlaylistId: "xpfm",
        fmModeEnabled: {},
        shuffleModeEnabled: {},
        shuffledSongIndices: {},
      };
    }
  };

  const [isWallpaperMode, setIsWallpaperMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("musicWallpaperMode") === "true";
  });

  // Save wallpaper mode to localStorage
  useEffect(() => {
    localStorage.setItem("musicWallpaperMode", isWallpaperMode.toString());
  }, [isWallpaperMode]);

  const toggleWallpaperMode = () => {
    setIsWallpaperMode((prev) => !prev);
  };

  // State management
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(
    () => {
      const persisted = loadPersistedState();
      return (
        ALL_PLAYLISTS.find((p) => p.id === persisted.currentPlaylistId) ||
        ALL_PLAYLISTS[0]
      );
    }
  );
  const [songs, setSongs] = useState<Song[]>(
    () => currentPlaylist?.songs || []
  );
  const [currentSongIndex, setCurrentSongIndex] = useState(
    () => loadPersistedState().currentSongIndex
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const [volume, setVolume] = useState(() => loadPersistedState().volume);
  const [currentTime, setCurrentTime] = useState(
    () => loadPersistedState().currentTime
  );
  const [duration, setDuration] = useState(0);
  const [fmModeEnabled, setFmModeEnabled] = useState<Record<string, boolean>>(
    () => loadPersistedState().fmModeEnabled || {}
  );

  // New shuffle-related state
  const [shuffleModeEnabled, setShuffleModeEnabled] = useState<
    Record<string, boolean>
  >(() => loadPersistedState().shuffleModeEnabled || {});
  const [shuffledSongIndices, setShuffledSongIndices] = useState<
    Record<string, number[]>
  >(() => loadPersistedState().shuffledSongIndices || {});

  const audioRef = useRef<HTMLAudioElement>(null);

  // Create a function to shuffle songs for a playlist
  const shufflePlaylist = useCallback(
    (playlistId: string) => {
      const playlist = ALL_PLAYLISTS.find((p) => p.id === playlistId);
      if (!playlist) return;

      // Create an array of indices and shuffle it
      const indices = Array.from(
        { length: playlist.songs.length },
        (_, i) => i
      );

      // Fisher-Yates shuffle algorithm
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      setShuffledSongIndices((prev) => ({
        ...prev,
        [playlistId]: indices,
      }));

      // Update localStorage
      if (currentPlaylist) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            currentSongIndex,
            currentTime,
            volume,
            currentPlaylistId: currentPlaylist.id,
            fmModeEnabled,
            shuffleModeEnabled,
            shuffledSongIndices: {
              ...shuffledSongIndices,
              [playlistId]: indices,
            },
          })
        );
      }
    },
    [
      ALL_PLAYLISTS,
      currentPlaylist,
      currentSongIndex,
      currentTime,
      volume,
      fmModeEnabled,
      shuffleModeEnabled,
      shuffledSongIndices,
    ]
  );

  // Toggle shuffle mode for a playlist
  const toggleShuffleMode = useCallback(
    (playlistId: string) => {
      setShuffleModeEnabled((prev) => {
        const newState = { ...prev, [playlistId]: !prev[playlistId] };

        // If enabling shuffle, create shuffled indices
        if (
          newState[playlistId] &&
          (!shuffledSongIndices[playlistId] ||
            shuffledSongIndices[playlistId].length === 0)
        ) {
          shufflePlaylist(playlistId);
        }

        // Save to localStorage
        if (currentPlaylist) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              currentSongIndex,
              currentTime,
              volume,
              currentPlaylistId: currentPlaylist.id,
              fmModeEnabled,
              shuffleModeEnabled: newState,
              shuffledSongIndices,
            })
          );
        }

        return newState;
      });
    },
    [
      currentPlaylist,
      currentSongIndex,
      currentTime,
      volume,
      fmModeEnabled,
      shuffledSongIndices,
      shufflePlaylist,
    ]
  );

  // Corrected resetShuffleForPlaylist function for MusicContext.tsx
  const resetShuffleForPlaylist = useCallback(
    (playlistId: string) => {
      // First, clear the shuffled indices for this playlist
      setShuffledSongIndices((prev) => {
        const newState = { ...prev };
        delete newState[playlistId];

        // If this is the current playlist being reset
        if (currentPlaylist && currentPlaylist.id === playlistId) {
          // Set the audio to the first track, but paused
          setCurrentSongIndex(0);
          setSongProgress(0);
          setCurrentTime(0);
          setIsPlaying(false);

          // Immediately update the audio element
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.pause();
          }
        }

        // Save to localStorage
        if (currentPlaylist) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              currentSongIndex:
                currentPlaylist.id === playlistId ? 0 : currentSongIndex,
              currentTime: currentPlaylist.id === playlistId ? 0 : currentTime,
              volume,
              currentPlaylistId: currentPlaylist.id,
              fmModeEnabled,
              shuffleModeEnabled,
              shuffledSongIndices: newState,
            })
          );
        }

        return newState;
      });
    },
    [
      currentPlaylist,
      currentSongIndex,
      currentTime,
      volume,
      fmModeEnabled,
      shuffleModeEnabled,
    ]
  );

  const toggleFmMode = (playlistId: string) => {
    setFmModeEnabled((prev) => {
      const updated = { ...prev, [playlistId]: !prev[playlistId] };
      if (currentPlaylist) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            currentSongIndex,
            currentTime,
            volume,
            currentPlaylistId: currentPlaylist.id,
            fmModeEnabled: updated,
            shuffleModeEnabled,
            shuffledSongIndices,
          })
        );
      }
      return updated;
    });
  };

  // Persist state changes
  useEffect(() => {
    if (currentPlaylist) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentSongIndex,
          currentTime,
          volume,
          currentPlaylistId: currentPlaylist.id,
          fmModeEnabled,
          shuffleModeEnabled,
          shuffledSongIndices,
        })
      );
    }
  }, [
    currentSongIndex,
    currentTime,
    volume,
    currentPlaylist,
    fmModeEnabled,
    shuffleModeEnabled,
    shuffledSongIndices,
  ]);

  // Restore playback position on mount
  useEffect(() => {
    if (audioRef.current) {
      const savedTime = loadPersistedState().currentTime;
      audioRef.current.currentTime = savedTime;
    }
  }, []);

  // Find this useEffect that handles periodic saves in MusicContext
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        setSongProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      };

      const handleDurationChange = () => {
        setDuration(audio.duration);
      };

      // Save current time periodically
      const saveTimeInterval = setInterval(() => {
        if (audio.currentTime > 0 && currentPlaylist) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              currentSongIndex,
              currentTime: audio.currentTime,
              volume,
              currentPlaylistId: currentPlaylist.id,
              fmModeEnabled,
              shuffleModeEnabled,
              shuffledSongIndices,
            })
          );
        }
      }, 1000);

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        clearInterval(saveTimeInterval);
      };
    }
  }, [
    currentSongIndex,
    songs.length,
    volume,
    currentPlaylist,
    fmModeEnabled,
    shuffleModeEnabled,
    shuffledSongIndices,
  ]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Updated playNext with shuffle support
  const playNext = () => {
    if (currentSongIndex < songs.length - 1) {
      setSongProgress(0);
      setCurrentTime(0);
      setDuration(0);

      // Handle shuffle mode if enabled for current playlist
      if (
        currentPlaylist &&
        shuffleModeEnabled[currentPlaylist.id] &&
        shuffledSongIndices[currentPlaylist.id]
      ) {
        const shuffledIndices = shuffledSongIndices[currentPlaylist.id];
        const currentShuffleIndex = shuffledIndices.findIndex(
          (idx) => idx === currentSongIndex
        );

        if (currentShuffleIndex < shuffledIndices.length - 1) {
          const nextSongIndex = shuffledIndices[currentShuffleIndex + 1];
          setCurrentSongIndex(nextSongIndex);
        } else {
          // Loop back to beginning of shuffle if at the end
          const nextSongIndex = shuffledIndices[0];
          setCurrentSongIndex(nextSongIndex);
        }
      } else {
        // Normal sequential play
        setCurrentSongIndex((prev) => prev + 1);
      }

      // Ensure we reset the audio properly
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.pause(); // Ensure we pause first

        // Small timeout to ensure state updates have propagated
        setTimeout(() => {
          if (audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                })
                .catch((error) => {
                  console.error("Error playing audio:", error);
                });
            }
          }
        }, 50);
      }
    }
  };

  // Updated playPrevious with shuffle support
  const playPrevious = () => {
    if (currentSongIndex > 0) {
      // Reset all playback-related states
      setSongProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false); // Reset playing state first

      // Handle shuffle mode if enabled for current playlist
      if (
        currentPlaylist &&
        shuffleModeEnabled[currentPlaylist.id] &&
        shuffledSongIndices[currentPlaylist.id]
      ) {
        const shuffledIndices = shuffledSongIndices[currentPlaylist.id];
        const currentShuffleIndex = shuffledIndices.findIndex(
          (idx) => idx === currentSongIndex
        );

        if (currentShuffleIndex > 0) {
          const prevSongIndex = shuffledIndices[currentShuffleIndex - 1];
          setCurrentSongIndex(prevSongIndex);
        } else {
          // Loop to end of shuffle if at beginning
          const prevSongIndex = shuffledIndices[shuffledIndices.length - 1];
          setCurrentSongIndex(prevSongIndex);
        }
      } else {
        // Normal sequential play
        setCurrentSongIndex((prev) => prev - 1);
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        // Small timeout to ensure state updates have propagated
        setTimeout(() => {
          const playPromise = audioRef.current?.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch((error) => {
                console.error("Error playing audio:", error);
              });
          }
        }, 50);
      }
    }
  };

  const playPlaylist = (playlistId: string) => {
    const playlist = ALL_PLAYLISTS.find((p) => p.id === playlistId);
    if (playlist) {
      // Reset all playback-related states first
      setSongProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false); // Reset playing state first

      // Update playlist and song states
      setCurrentPlaylist(playlist);
      setSongs(playlist.songs);

      // If shuffle mode is enabled for this playlist, start with the first shuffled index
      if (
        shuffleModeEnabled[playlistId] &&
        shuffledSongIndices[playlistId]?.length > 0
      ) {
        setCurrentSongIndex(shuffledSongIndices[playlistId][0]);
      } else {
        // Otherwise start from the beginning
        setCurrentSongIndex(0);
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        // Small timeout to ensure state updates have propagated
        setTimeout(() => {
          const playPromise = audioRef.current?.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch((error) => {
                console.error("Error playing audio:", error);
              });
          }
        }, 50);
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(time, audioRef.current.duration);
      setCurrentTime(audioRef.current.currentTime);
      setSongProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      );
    }
  };

  // Update the handleEnded event handler in the useEffect
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleEnded = async () => {
        const isFmEnabled = fmModeEnabled[currentPlaylist?.id || ""];

        if (isFmEnabled) {
          if (currentSongIndex < songs.length - 1) {
            // Reset states first
            setSongProgress(0);
            setCurrentTime(0);
            setDuration(0);

            // If shuffle is enabled, play next shuffled song
            if (
              currentPlaylist &&
              shuffleModeEnabled[currentPlaylist.id] &&
              shuffledSongIndices[currentPlaylist.id]
            ) {
              const shuffledIndices = shuffledSongIndices[currentPlaylist.id];
              const currentShuffleIndex = shuffledIndices.findIndex(
                (idx) => idx === currentSongIndex
              );

              if (currentShuffleIndex < shuffledIndices.length - 1) {
                const nextSongIndex = shuffledIndices[currentShuffleIndex + 1];
                setCurrentSongIndex(nextSongIndex);
              } else {
                // Loop back to beginning of shuffle if at the end
                const nextSongIndex = shuffledIndices[0];
                setCurrentSongIndex(nextSongIndex);
              }
            } else {
              // Normal sequential play
              setCurrentSongIndex((prev) => prev + 1);
            }

            // Reset audio state
            audio.currentTime = 0;
            audio.pause();

            // Small delay to ensure state updates
            setTimeout(() => {
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    setIsPlaying(true);
                  })
                  .catch((error) => {
                    console.error("Error playing next track:", error);
                  });
              }
            }, 50);
          } else {
            // Handle playlist end - loop back to start
            setSongProgress(0);
            setCurrentTime(0);
            setDuration(0);

            // If shuffle is enabled, start with the first shuffled index
            if (
              currentPlaylist &&
              shuffleModeEnabled[currentPlaylist.id] &&
              shuffledSongIndices[currentPlaylist.id]?.length > 0
            ) {
              setCurrentSongIndex(shuffledSongIndices[currentPlaylist.id][0]);
            } else {
              // Otherwise start from the beginning
              setCurrentSongIndex(0);
            }

            audio.currentTime = 0;
            audio.pause();

            setTimeout(() => {
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    setIsPlaying(true);
                  })
                  .catch((error) => {
                    console.error("Error restarting playlist:", error);
                  });
              }
            }, 50);
          }
        } else {
          // If FM mode is disabled, just stop at the end
          setIsPlaying(false);
          setSongProgress(0);
          setCurrentTime(0);
        }
      };

      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, [
    currentSongIndex,
    songs.length,
    fmModeEnabled,
    currentPlaylist,
    shuffleModeEnabled,
    shuffledSongIndices,
  ]);

  return (
    <MusicContext.Provider
      value={{
        seek,
        songs,
        currentSongIndex,
        isPlaying,
        songProgress,
        volume,
        currentTime,
        duration,
        playlists: ALL_PLAYLISTS,
        currentPlaylist,
        setSongs,
        setCurrentSongIndex,
        setIsPlaying,
        setSongProgress,
        setVolume,
        togglePlay,
        playNext,
        playPrevious,
        audioRef,
        playPlaylist,
        isWallpaperMode,
        toggleWallpaperMode,
        fmModeEnabled,
        toggleFmMode,
        // New shuffle-related properties
        shuffleModeEnabled,
        toggleShuffleMode,
        resetShuffleForPlaylist,
        shuffledSongIndices,
      }}
    >
      <audio
        ref={audioRef}
        src={songs[currentSongIndex]?.path}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {children}
    </MusicContext.Provider>
  );
}

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};
