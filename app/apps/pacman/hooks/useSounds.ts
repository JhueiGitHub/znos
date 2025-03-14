// app/apps/pacman/hooks/useSounds.ts
import { useEffect, useRef } from "react";

interface SoundOptions {
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

// Sound IDs
export type SoundId = "chomp" | "death" | "start" | "ghostEat";

// Sound paths
const SOUND_PATHS: Record<SoundId, string> = {
  chomp: "/media/pacman/pacman_chomp.mp3",
  death: "/media/pacman/pacman_death.mp3",
  start: "/media/pacman/pacman_beginning.mp3",
  ghostEat: "/media/pacman/pacman_eatghost.mp3",
};

// Default options for each sound
const SOUND_OPTIONS: Record<SoundId, SoundOptions> = {
  chomp: { volume: 0.5, loop: true },
  death: { volume: 0.7 },
  start: { volume: 0.7 },
  ghostEat: { volume: 0.7 },
};

export const useSounds = () => {
  const soundsRef = useRef<Record<SoundId, HTMLAudioElement | null>>({
    chomp: null,
    death: null,
    start: null,
    ghostEat: null,
  });

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUND_PATHS).forEach(([id, path]) => {
      const soundId = id as SoundId;
      const options = SOUND_OPTIONS[soundId];

      const audio = new Audio(path);
      audio.volume = options.volume || 0.7;
      audio.loop = options.loop || false;

      soundsRef.current[soundId] = audio;
    });

    // Cleanup on unmount
    return () => {
      Object.values(soundsRef.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, []);

  const play = (id: SoundId) => {
    const audio = soundsRef.current[id];
    if (audio) {
      // For looping sounds like chomp, don't restart if already playing
      if (id === "chomp" && !audio.paused) {
        return;
      }

      // For non-looping sounds, reset and play from beginning
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(`Error playing sound '${id}':`, error);
      });
    }
  };

  const stop = (id: SoundId) => {
    const audio = soundsRef.current[id];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const pause = (id: SoundId) => {
    const audio = soundsRef.current[id];
    if (audio) {
      audio.pause();
    }
  };

  const pauseAll = () => {
    Object.values(soundsRef.current).forEach((audio) => {
      if (audio) {
        audio.pause();
      }
    });
  };

  return {
    play,
    stop,
    pause,
    pauseAll,
  };
};
