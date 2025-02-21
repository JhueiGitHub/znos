// /root/app/apps/music/context/MusicContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
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
  // Add these two new properties
  fmModeEnabled: Record<string, boolean>;
  toggleFmMode: (playlistId: string) => void;
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
    id: "blav",
    name: "BLAV",
    songCount: 18,
    thumbnail: "/media/playlists/blav.png",
    songs: [
      {
        id: "blav-1",
        title: "i was never there",
        artist: "BLAV",
        path: "/audio/blav/iwasneverthere.mp4",
        thumbnail: "/media/playlists/blav/iwasneverthere.png",
        videoUrl: "https://www.youtube.com/watch?v=NbqZRrb4_Lc",
      },
      {
        id: "blav-2",
        title: "valerie",
        artist: "BLAV",
        path: "/audio/blav/valerie.mp4",
        thumbnail: "/media/songs/blav/valerie.png",
        videoUrl: "https://www.youtube.com/watch?v=v60yXCH3IDw",
      },
      {
        id: "blav-3",
        title: "in your eyes",
        artist: "BLAV",
        path: "/audio/blav/inyoureyes.mp4",
        thumbnail: "/media/songs/blav/inyoureyes.png",
        videoUrl: "https://www.youtube.com/watch?v=QLNyHl4nwEo",
      },
      {
        id: "blav-4",
        title: "starry eyes",
        artist: "BLAV",
        path: "/audio/blav/starryeyes.mp4",
        thumbnail: "/media/songs/blav/starryeyes.png",
        videoUrl: "https://www.youtube.com/watch?v=SDyf6f7qhcY",
      },
      {
        id: "blav-5",
        title: "i can't feel my face",
        artist: "BLAV",
        path: "/audio/blav/icantfeelmyface.mp4",
        thumbnail: "/media/songs/blav/icantfeelmyface.png",
        videoUrl: "https://www.youtube.com/watch?v=533ct1vFHmM",
      },
      {
        id: "blav-6",
        title: "call out my name",
        artist: "BLAV",
        path: "/audio/blav/calloutmyname.mp4",
        thumbnail: "/media/songs/blav/calloutmyname.png",
        videoUrl: "https://www.youtube.com/watch?v=ZIBLdNxW5do",
      },
      {
        id: "blav-7",
        title: "nothing without you",
        artist: "BLAV",
        path: "/audio/blav/nothingwithoutyou.mp4",
        thumbnail: "/media/songs/blav/nothingwithoutyou.png",
        videoUrl: "https://www.youtube.com/watch?v=LaeJJ9aB9e8",
      },
      {
        id: "blav-8",
        title: "pretty",
        artist: "BLAV",
        path: "/audio/blav/pretty.mp4",
        thumbnail: "/media/songs/blav/pretty.png",
        videoUrl: "https://www.youtube.com/watch?v=b_SwuIozFdQ",
      },
      {
        id: "blav-9",
        title: "professional",
        artist: "BLAV",
        path: "/audio/blav/professional.mp4",
        thumbnail: "/media/songs/blav/professional.png",
        videoUrl: "https://www.youtube.com/watch?v=XzM3d5dBJns",
      },
      {
        id: "blav-10",
        title: "in the night",
        artist: "BLAV",
        path: "/audio/blav/inthenight.mp4",
        thumbnail: "/media/songs/blav/inthenight.png",
        videoUrl: "https://www.youtube.com/watch?v=AXM10bYqtUc",
      },
      {
        id: "blav-11",
        title: "adaptation",
        artist: "BLAV",
        path: "/audio/blav/adaptation.mp4",
        thumbnail: "/media/songs/blav/adaptation.png",
        videoUrl: "https://www.youtube.com/watch?v=TgKcNj8fKpI",
      },
      {
        id: "blav-12",
        title: "pray for me",
        artist: "BLAV",
        path: "/audio/blav/pray.mp4",
        thumbnail: "/media/songs/blav/pray.png",
        videoUrl: "https://www.youtube.com/watch?v=QRj2JP0Fe1c",
      },
      {
        id: "blav-13",
        title: "starboy",
        artist: "BLAV",
        path: "/audio/blav/starboy.mp4",
        thumbnail: "/media/songs/blav/starboy.png",
        videoUrl: "https://www.youtube.com/watch?v=mFMNIlhIUvs",
      },
      {
        id: "blav-14",
        title: "power is power",
        artist: "BLAV",
        path: "/audio/blav/power.mp4",
        thumbnail: "/media/songs/blav/power.png",
        videoUrl: "https://www.youtube.com/watch?v=x8Wh4GeyMB4",
      },
      {
        id: "blav-15",
        title: "take my breath",
        artist: "BLAV",
        path: "/audio/blav/takemybreath.mp4",
        thumbnail: "/media/songs/blav/takemybreath.png",
        videoUrl: "https://www.youtube.com/watch?v=q266o-KOUMk",
      },
      {
        id: "blav-16",
        title: "moth to a flame",
        artist: "BLAV",
        path: "/audio/blav/mothtoaflame.mp4",
        thumbnail: "/media/songs/blav/mothtoaflame.png",
        videoUrl: "https://www.youtube.com/watch?v=gl1v-nWiGLk",
      },
      {
        id: "blav-17",
        title: "lowlife",
        artist: "BLAV",
        path: "/audio/blav/lowlife.mp4",
        thumbnail: "/media/songs/blav/lowlife.png",
        videoUrl: "https://www.youtube.com/watch?v=nqcjuk0o7YM",
      },
      {
        id: "blav-18",
        title: "after hours",
        artist: "BLAV",
        path: "/audio/blav/afterhours.mp4",
        thumbnail: "/media/songs/blav/afterhours.png",
        videoUrl: "https://www.youtube.com/watch?v=pV0ngdzx7RE",
      },
    ],
  },
  {
    id: "swan",
    name: "SWAN",
    songCount: 8,
    thumbnail: "/media/playlists/swan.png",
    songs: [
      {
        id: "swan-1",
        title: "lune",
        artist: "SWAN",
        path: "/audio/swan/lune.mp4",
        thumbnail: "/media/songs/lune.png",
        videoUrl: "https://www.youtube.com/watch?v=CvFH_6DNRCY",
      },
      {
        id: "swan-2",
        title: "swans",
        artist: "SWAN",
        path: "/audio/swan/swans.mp4",
        thumbnail: "/media/songs/swans.png",
        videoUrl: "https://youtube.com/watch?v=MyzfjP_wXBw",
      },
      {
        id: "swan-3",
        title: "ballade",
        artist: "SWAN",
        path: "/audio/swan/ballade.mp4",
        thumbnail: "/media/songs/ballade.png",
        videoUrl: "https://www.youtube.com/watch?v=2uvAewYkEFU",
      },
      {
        id: "swan-4",
        title: "nocturne",
        artist: "SWAN",
        path: "/audio/swan/nocturne.mp4",
        thumbnail: "/media/songs/nocturne.png",
        videoUrl: "https://www.youtube.com/watch?v=T7k2pmKUXxI",
      },
      {
        id: "swan-5",
        title: "fantasia",
        artist: "SWAN",
        path: "/audio/swan/fantasia.mp4",
        thumbnail: "/media/songs/fantasia.png",
        videoUrl: "https://www.youtube.com/watch?v=zlWAdUPUCJw",
      },
      {
        id: "swan-6",
        title: "overuse",
        artist: "SWAN",
        path: "/audio/swan/overuse.mp4",
        thumbnail: "/media/songs/overuse.png",
        videoUrl: "https://www.youtube.com/watch?v=rrBsvldbwdQ",
      },
      {
        id: "swan-7",
        title: "lacrimosa",
        artist: "SWAN",
        path: "/audio/swan/lacrimosa.mp4",
        thumbnail: "/media/songs/lacrimosa.png",
        videoUrl: "https://www.youtube.com/watch?v=mt6m63ylw-g",
      },
      {
        id: "swan-8",
        title: "lake",
        artist: "SWAN",
        path: "/audio/swan/lake.mp4",
        thumbnail: "/media/songs/lake.png",
        videoUrl: "https://www.youtube.com/watch?v=xF_x4oenM1E",
      },
    ],
  },
  {
    id: "aftr",
    name: "AFTR",
    songCount: 9,
    thumbnail: "/media/playlists/aftr.png",
    songs: [
      {
        id: "aftr-1",
        title: "faith",
        artist: "AFTR",
        path: "/audio/nxra/regular.mp4",
        thumbnail: "/media/songs/nxra/regular.png",
        videoUrl: "https://www.youtube.com/watch?v=pkX5-wmMaUA",
      },
      {
        id: "aftr-2",
        title: "privilege",
        artist: "AFTR",
        path: "/audio/nxra/privilege.mp4",
        thumbnail: "/media/songs/nxra/privilege.png",
        videoUrl: "https://www.youtube.com/watch?v=_mgf7YVKnKg",
      },
      {
        id: "aftr-3",
        title: "after hours",
        artist: "AFTR",
        path: "/audio/nxra/afterhours.mp4",
        thumbnail: "/media/songs/nxra/afterhours.png",
        videoUrl: "https://www.youtube.com/watch?v=mj1Y5AWtvmM",
      },
      {
        id: "aftr-4",
        title: "too late",
        artist: "AFTR",
        path: "/audio/nxra/toolate.mp4",
        thumbnail: "/media/songs/nxra/toolate.png",
        videoUrl: "https://www.youtube.com/watch?v=qd9N1DoitW0",
      },
      {
        id: "aftr-5",
        title: "open hearts",
        artist: "AFTR",
        path: "/audio/nxra/openhearts.mp4",
        thumbnail: "/media/songs/nxra/openhearts.png",
        videoUrl: "https://www.youtube.com/watch?v=f9sj9yEziQY",
      },
      {
        id: "aftr-6",
        title: "try me",
        artist: "AFTR",
        path: "/audio/nxra/tryme.mp4",
        thumbnail: "/media/songs/nxra/tryme.png",
        videoUrl: "https://www.youtube.com/watch?v=Qi7bA43x0cg",
      },
      {
        id: "aftr-7",
        title: "often",
        artist: "AFTR",
        path: "/audio/nxra/often.mp4",
        thumbnail: "/media/songs/nxra/often.png",
        videoUrl: "https://www.youtube.com/watch?v=9fF491-R2do",
      },
      {
        id: "aftr-8",
        title: "low life",
        artist: "AFTR",
        path: "/audio/nxra/lowlife.mp4",
        thumbnail: "/media/songs/nxra/lowlife.png",
        videoUrl: "https://www.youtube.com/watch?v=1ZIm3m92_vQ",
      },
      {
        id: "aftr-9",
        title: "sacrafice",
        artist: "AFTR",
        path: "/audio/nxra/sacrafice.mp4",
        thumbnail: "/media/songs/nxra/sacrafice.png",
        videoUrl: "https://www.youtube.com/watch?v=yDFbpYdcK-Q",
      },
      {
        id: "aftr-10",
        title: "as you are",
        artist: "AFTR",
        path: "/audio/nxra/asyouare.mp4",
        thumbnail: "/media/songs/nxra/asyouare.png",
        videoUrl: "https://www.youtube.com/watch?v=NovEzbESlL8",
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
        artist: "VCNZ",
        path: "/audio/vcnz/adrenaline.mp4",
        thumbnail: "/media/songs/vcnz/adrenaline.png",
        videoUrl: "https://www.youtube.com/watch?v=Vy81T0oG01c",
      },
      {
        id: "vcnz-2",
        title: "mafia",
        artist: "VCNZ",
        path: "/audio/vcnz/mafia.mp4",
        thumbnail: "/media/songs/vcnz/mafia.png",
        videoUrl: "https://www.youtube.com/watch?v=Vy81T0oG01c",
      },
      {
        id: "vcnz-3",
        title: "un diavolo scaccia l'altro",
        artist: "VCNZ",
        path: "/audio/vcnz/diavolo.mp4",
        thumbnail: "/media/songs/vcnz/diavolo.png",
        videoUrl:
          "https://www.youtube.com/watch?v=Rozhhito9Ew&pp=ygUTdmluY2Vuem8gc291bmR0cmFjaw%3D%3D",
      },
      {
        id: "vcnz-4",
        title: "retributor",
        artist: "VCNZ",
        path: "/audio/vcnz/retributor.mp4",
        thumbnail: "/media/songs/vcnz/retributor.png",
        videoUrl:
          "https://www.youtube.com/watch?v=hRoNVhyOCKk&pp=ygUTdmluY2Vuem8gc291bmR0cmFjaw%3D%3D",
      },
      {
        id: "vcnz-5",
        title: "empty mind",
        artist: "VCNZ",
        path: "/audio/vcnz/emptymind.mp4",
        thumbnail: "/media/songs/vcnz/emptymind.png",
        videoUrl:
          "https://www.youtube.com/watch?v=2609nR2di5Y&list=PLP-eBeyXNQLrg6XprN1VTVhRdROfQYZ49&index=20&pp=iAQB8AUB",
      },
      {
        id: "vcnz-6",
        title: "your vacancy",
        artist: "VCNZ",
        path: "/audio/vcnz/yourvacancy.mp4",
        thumbnail: "/media/songs/vcnz/yourvacancy.png",
        videoUrl:
          "https://www.youtube.com/watch?v=sUjtNYhTr7M&list=PLP-eBeyXNQLrg6XprN1VTVhRdROfQYZ49&index=33&pp=iAQB8AUB",
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
      };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved)
      return {
        currentSongIndex: 0,
        currentTime: 0,
        volume: 1,
        currentPlaylistId: "xpfm",
        fmModeEnabled: {},
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

  const audioRef = useRef<HTMLAudioElement>(null);

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
        })
      );
    }
  }, [currentSongIndex, currentTime, volume, currentPlaylist]);

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
              fmModeEnabled, // Add this line - it was missing from the periodic save!
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
  }, [currentSongIndex, songs.length, volume, currentPlaylist, fmModeEnabled]); // Add fmModeEnabled to deps

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

  // Update the playNext function to be more robust
  const playNext = () => {
    if (currentSongIndex < songs.length - 1) {
      setSongProgress(0);
      setCurrentTime(0);
      setDuration(0);

      setCurrentSongIndex((prev) => prev + 1);

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

  const playPrevious = () => {
    if (currentSongIndex > 0) {
      // Reset all playback-related states
      setSongProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false); // Reset playing state first

      setCurrentSongIndex((prev) => prev - 1);

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
      setCurrentSongIndex(0);

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

  // Update useEffect for audio ended event
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

            // Update index
            setCurrentSongIndex((prev) => prev + 1);

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
            setCurrentSongIndex(0);

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
  }, [currentSongIndex, songs.length, fmModeEnabled, currentPlaylist]);

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
