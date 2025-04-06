// /root/app/apps/duolingo/utils/audioUtils.ts

/**
 * Utility functions for handling audio in the Duolingo app
 */

interface AudioOptions {
  volume?: number;
  onEnded?: () => void;
}

// Cache for audio elements to prevent excessive creation
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Play an audio file with the given URL
 * @param url URL of the audio file to play
 * @param options Optional configuration for playback
 * @returns Promise that resolves when audio starts playing
 */
export const playAudio = async (
  url: string | undefined,
  options: AudioOptions = {}
): Promise<void> => {
  if (!url) return Promise.resolve();

  try {
    // Check cache first
    let audio = audioCache[url];

    // Create new audio element if not in cache
    if (!audio) {
      audio = new Audio(url);
      audioCache[url] = audio;
    }

    // Reset audio to beginning
    audio.currentTime = 0;

    // Set volume (default to 100%)
    audio.volume = options.volume ?? 1;

    // Set ended callback if provided
    if (options.onEnded) {
      const onEndedHandler = () => {
        options.onEnded?.();
        audio.removeEventListener("ended", onEndedHandler);
      };

      audio.addEventListener("ended", onEndedHandler);
    }

    // Play the audio
    await audio.play();

    return Promise.resolve();
  } catch (error) {
    console.error("Failed to play audio:", error);
    return Promise.reject(error);
  }
};

/**
 * Play a correct answer sound effect
 */
export const playCorrectSound = async (): Promise<void> => {
  return playAudio("/apps/duolingo/audio/correct.mp3", { volume: 0.7 });
};

/**
 * Play an incorrect answer sound effect
 */
export const playIncorrectSound = async (): Promise<void> => {
  return playAudio("/apps/duolingo/audio/incorrect.mp3", { volume: 0.7 });
};

/**
 * Preload commonly used audio files
 */
export const preloadAudio = (): void => {
  const commonAudio = [
    "/apps/duolingo/audio/correct.mp3",
    "/apps/duolingo/audio/incorrect.mp3",
    // Add other common audio files here
  ];

  // Preload each file
  commonAudio.forEach((url) => {
    const audio = new Audio();
    audio.src = url;
    audioCache[url] = audio;
  });
};

/**
 * Clean up audio resources
 */
export const cleanupAudio = (): void => {
  // Pause all cached audio elements
  Object.values(audioCache).forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
};
