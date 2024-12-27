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

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([
    {
      title: "song1",
      artist: "Unknown Artist",
      path: "/audio/songs/song1.mp4",
    },
    // Add more default songs as needed
  ]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Add useEffect to handle audio element updates
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        setSongProgress((audio.currentTime / audio.duration) * 100);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (currentSongIndex < songs.length - 1) {
          setCurrentSongIndex((prev) => prev + 1);
        }
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [currentSongIndex, songs.length]);

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
