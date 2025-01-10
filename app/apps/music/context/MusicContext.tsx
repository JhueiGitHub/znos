"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface Song {
  title: string;
  artist: string;
  path: string;
}

interface MusicContextType {
  songs: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  songProgress: number;
  volume: number;
  currentTime: number;
  duration: number;
  setSongs: (songs: Song[]) => void;
  setCurrentSongIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSongProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const STORAGE_KEY = "musicState";

interface PersistedState {
  currentSongIndex: number;
  currentTime: number;
  volume: number;
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([
    {
      title: "song1",
      artist: "Unknown Artist",
      path: "/audio/songs/song1.mp4",
    },
    {
      title: "song2",
      artist: "Unknown Artist",
      path: "/audio/songs/song2.mp4",
    },
    {
      title: "song3",
      artist: "Unknown Artist",
      path: "/audio/songs/song3.mp4",
    },
    {
      title: "song4",
      artist: "Unknown Artist",
      path: "/audio/songs/song4.mp4",
    },
    {
      title: "song5",
      artist: "Unknown Artist",
      path: "/audio/songs/song5.mp4",
    },
    {
      title: "song6",
      artist: "Unknown Artist",
      path: "/audio/songs/song6.mp4",
    },
    {
      title: "song7",
      artist: "Unknown Artist",
      path: "/audio/songs/song7.mp4",
    },
    {
      title: "song8",
      artist: "Unknown Artist",
      path: "/audio/songs/song8.mp4",
    },
    {
      title: "song9",
      artist: "Unknown Artist",
      path: "/audio/songs/song9.mp4",
    },
  ]);

  // Load persisted state from localStorage
  const loadPersistedState = (): PersistedState => {
    if (typeof window === "undefined")
      return { currentSongIndex: 0, currentTime: 0, volume: 1 };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { currentSongIndex: 0, currentTime: 0, volume: 1 };

    try {
      return JSON.parse(saved);
    } catch {
      return { currentSongIndex: 0, currentTime: 0, volume: 1 };
    }
  };

  // Initialize state with persisted values
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
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentSongIndex,
        currentTime,
        volume,
      })
    );
  }, [currentSongIndex, currentTime, volume]);

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
        if (audio.currentTime > 0) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              currentSongIndex,
              currentTime: audio.currentTime,
              volume,
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
  }, [currentSongIndex, songs.length, volume]);

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
        setSongs,
        setCurrentSongIndex,
        setIsPlaying,
        setSongProgress,
        setVolume,
        togglePlay,
        playNext,
        playPrevious,
        audioRef,
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
