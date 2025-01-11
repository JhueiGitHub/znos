// MusicWallpaper.tsx
import React from "react";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { useMusicContext } from "../apps/music/context/MusicContext";
import { Play } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  songCount: number;
  thumbnail: string;
  songs: Array<{
    id: string;
    title: string;
    artist: string;
    path: string;
    thumbnail: string;
    videoUrl?: string;
  }>;
}

const MusicWallpaper = () => {
  const { songs, currentSongIndex, isWallpaperMode } = useMusicContext();
  const currentSong = songs[currentSongIndex];

  if (!isWallpaperMode || !currentSong?.videoUrl) {
    return null;
  }

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(currentSong.videoUrl);

  if (!videoId) {
    console.error("Invalid YouTube URL:", currentSong.videoUrl);
    return null;
  }

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      loop: 1,
      mute: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  const onEnd = (event: YouTubeEvent) => {
    event.target.playVideo();
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />{" "}
      {/* Overlay to dim the video */}
      <YouTube
        videoId={videoId}
        opts={opts}
        onEnd={onEnd}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
};

export default MusicWallpaper;
