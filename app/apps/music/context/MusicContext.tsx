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
}

interface Playlist {
  id: string;
  name: string;
  songCount: number;
  thumbnail: string;
  songs: Song[];
}

interface MusicContextType {
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
}

// All playlists data combined into one constant
const ALL_PLAYLISTS: Playlist[] = [
  {
    id: "xpfm",
    name: "XPFM",
    songCount: 9,
    thumbnail: "/media/system/_empty_image.png",
    songs: [
      {
        id: "xpfm-1",
        title: "song1",
        artist: "Unknown Artist",
        path: "/audio/songs/song1.mp4",
        thumbnail: "/media/songs/song1.png",
      },
      {
        id: "xpfm-2",
        title: "song2",
        artist: "Unknown Artist",
        path: "/audio/songs/song2.mp4",
        thumbnail: "/media/songs/song2.png",
      },
      {
        id: "xpfm-3",
        title: "song3",
        artist: "Unknown Artist",
        path: "/audio/songs/song3.mp4",
        thumbnail: "/media/songs/song3.png",
      },
      {
        id: "xpfm-4",
        title: "song4",
        artist: "Unknown Artist",
        path: "/audio/songs/song4.mp4",
        thumbnail: "/media/songs/song4.png",
      },
      {
        id: "xpfm-5",
        title: "song5",
        artist: "Unknown Artist",
        path: "/audio/songs/song5.mp4",
        thumbnail: "/media/songs/song5.png",
      },
      {
        id: "xpfm-6",
        title: "song6",
        artist: "Unknown Artist",
        path: "/audio/songs/song6.mp4",
        thumbnail: "/media/songs/song6.png",
      },
      {
        id: "xpfm-7",
        title: "song7",
        artist: "Unknown Artist",
        path: "/audio/songs/song7.mp4",
        thumbnail: "/media/songs/song7.png",
      },
      {
        id: "xpfm-8",
        title: "song8",
        artist: "Unknown Artist",
        path: "/audio/songs/song8.mp4",
        thumbnail: "/media/songs/song8.png",
      },
      {
        id: "xpfm-9",
        title: "song9",
        artist: "Unknown Artist",
        path: "/audio/songs/song9.mp4",
        thumbnail: "/media/songs/song9.png",
      },
    ],
  },
  {
    id: "blav",
    name: "BLAV",
    songCount: 12,
    thumbnail: "/media/playlists/blav.png",
    songs: [
      {
        id: "blav-1",
        title: "Elastic",
        artist: "BLAV",
        path: "/audio/blav/elastic.mp4",
        thumbnail: "/media/playlists/blav.png",
      },
      {
        id: "blav-2",
        title: "Memories",
        artist: "BLAV",
        path: "/audio/blav/memories.mp4",
        thumbnail: "/media/songs/blav_memories.png",
      },
      {
        id: "blav-3",
        title: "Letting Go",
        artist: "BLAV",
        path: "/audio/blav/letting_go.mp4",
        thumbnail: "/media/songs/blav_letting_go.png",
      },
      {
        id: "blav-4",
        title: "Losing My Mind",
        artist: "BLAV",
        path: "/audio/blav/losing_my_mind.mp4",
        thumbnail: "/media/songs/blav_losing_my_mind.png",
      },
      {
        id: "blav-5",
        title: "Tired",
        artist: "BLAV",
        path: "/audio/blav/tired.mp4",
        thumbnail: "/media/songs/blav_tired.png",
      },
      {
        id: "blav-6",
        title: "Distance",
        artist: "BLAV",
        path: "/audio/blav/distance.mp4",
        thumbnail: "/media/songs/blav_distance.png",
      },
      {
        id: "blav-7",
        title: "Take It All",
        artist: "BLAV",
        path: "/audio/blav/take_it_all.mp4",
        thumbnail: "/media/songs/blav_take_it_all.png",
      },
      {
        id: "blav-8",
        title: "Heartbreak",
        artist: "BLAV",
        path: "/audio/blav/heartbreak.mp4",
        thumbnail: "/media/songs/blav_heartbreak.png",
      },
      {
        id: "blav-9",
        title: "Gone",
        artist: "BLAV",
        path: "/audio/blav/gone.mp4",
        thumbnail: "/media/songs/blav_gone.png",
      },
      {
        id: "blav-10",
        title: "Let Me Go",
        artist: "BLAV",
        path: "/audio/blav/let_me_go.mp4",
        thumbnail: "/media/songs/blav_let_me_go.png",
      },
      {
        id: "blav-11",
        title: "Forever",
        artist: "BLAV",
        path: "/audio/blav/forever.mp4",
        thumbnail: "/media/songs/blav_forever.png",
      },
      {
        id: "blav-12",
        title: "Miss You",
        artist: "BLAV",
        path: "/audio/blav/miss_you.mp4",
        thumbnail: "/media/songs/blav_miss_you.png",
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
        title: "Lost Soul",
        artist: "SWAN",
        path: "/audio/swan/lost_soul.mp4",
        thumbnail: "/media/songs/swan_lost_soul.png",
      },
      {
        id: "swan-2",
        title: "Echoes",
        artist: "SWAN",
        path: "/audio/swan/echoes.mp4",
        thumbnail: "/media/songs/swan_echoes.png",
      },
      {
        id: "swan-3",
        title: "Night Sky",
        artist: "SWAN",
        path: "/audio/swan/night_sky.mp4",
        thumbnail: "/media/songs/swan_night_sky.png",
      },
      {
        id: "swan-4",
        title: "Deeper",
        artist: "SWAN",
        path: "/audio/swan/deeper.mp4",
        thumbnail: "/media/songs/swan_deeper.png",
      },
      {
        id: "swan-5",
        title: "Waves",
        artist: "SWAN",
        path: "/audio/swan/waves.mp4",
        thumbnail: "/media/songs/swan_waves.png",
      },
      {
        id: "swan-6",
        title: "Dreaming",
        artist: "SWAN",
        path: "/audio/swan/dreaming.mp4",
        thumbnail: "/media/songs/swan_dreaming.png",
      },
      {
        id: "swan-7",
        title: "Midnight",
        artist: "SWAN",
        path: "/audio/swan/midnight.mp4",
        thumbnail: "/media/songs/swan_midnight.png",
      },
      {
        id: "swan-8",
        title: "Starlight",
        artist: "SWAN",
        path: "/audio/swan/starlight.mp4",
        thumbnail: "/media/songs/swan_starlight.png",
      },
    ],
  },
  {
    id: "nxra",
    name: "NXRA",
    songCount: 6,
    thumbnail: "/media/playlists/nxra.png",
    songs: [
      {
        id: "nxra-1",
        title: "Shadows",
        artist: "NXRA",
        path: "/audio/nxra/shadows.mp4",
        thumbnail: "/media/songs/nxra_shadows.png",
      },
      {
        id: "nxra-2",
        title: "Darkness",
        artist: "NXRA",
        path: "/audio/nxra/darkness.mp4",
        thumbnail: "/media/songs/nxra_darkness.png",
      },
      {
        id: "nxra-3",
        title: "Eclipse",
        artist: "NXRA",
        path: "/audio/nxra/eclipse.mp4",
        thumbnail: "/media/songs/nxra_eclipse.png",
      },
      {
        id: "nxra-4",
        title: "Void",
        artist: "NXRA",
        path: "/audio/nxra/void.mp4",
        thumbnail: "/media/songs/nxra_void.png",
      },
      {
        id: "nxra-5",
        title: "Abyss",
        artist: "NXRA",
        path: "/audio/nxra/abyss.mp4",
        thumbnail: "/media/songs/nxra_abyss.png",
      },
      {
        id: "nxra-6",
        title: "Eternal",
        artist: "NXRA",
        path: "/audio/nxra/eternal.mp4",
        thumbnail: "/media/songs/nxra_eternal.png",
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
      };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved)
      return {
        currentSongIndex: 0,
        currentTime: 0,
        volume: 1,
        currentPlaylistId: "xpfm",
      };

    try {
      return JSON.parse(saved);
    } catch {
      return {
        currentSongIndex: 0,
        currentTime: 0,
        volume: 1,
        currentPlaylistId: "xpfm",
      };
    }
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
  const audioRef = useRef<HTMLAudioElement>(null);

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

      const handleEnded = () => {
        setIsPlaying(false);
        if (currentSongIndex < songs.length - 1) {
          setCurrentSongIndex((prev) => prev + 1);
        }
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
            })
          );
        }
      }, 1000);

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("ended", handleEnded);
        clearInterval(saveTimeInterval);
      };
    }
  }, [currentSongIndex, songs.length, volume, currentPlaylist]);

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

  const playNext = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
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
    }
  };

  const playPrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex((prev) => prev - 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
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
    }
  };

  const playPlaylist = (playlistId: string) => {
    const playlist = ALL_PLAYLISTS.find((p) => p.id === playlistId);
    if (playlist) {
      setCurrentPlaylist(playlist);
      setSongs(playlist.songs);
      setCurrentSongIndex(0);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
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
    }
  };

  return (
    <MusicContext.Provider
      value={{
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
