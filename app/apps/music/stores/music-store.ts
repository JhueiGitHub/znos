// /root/app/apps/music/stores/music-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { debounce } from "lodash";

interface Song {
  id: string;
  title: string;
  artist: string;
  path: string;
  thumbnail: string;
}

interface MusicState {
  currentSongIndex: number;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  currentPlaylistId: string | null;

  // Actions
  setCurrentSongIndex: (index: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentPlaylistId: (id: string | null) => void;
}

// Create store with persistence
export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      currentSongIndex: 0,
      currentTime: 0,
      isPlaying: false,
      volume: 1,
      currentPlaylistId: null,

      // Actions with direct state updates
      setCurrentSongIndex: (index) => set({ currentSongIndex: index }),
      setCurrentTime: debounce((time) => set({ currentTime: time }), 1000),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      setCurrentPlaylistId: (id) => set({ currentPlaylistId: id }),
    }),
    {
      name: "music-storage", // localStorage key
      partialize: (state) => ({
        currentSongIndex: state.currentSongIndex,
        currentTime: state.currentTime,
        volume: state.volume,
        currentPlaylistId: state.currentPlaylistId,
      }),
    }
  )
);
