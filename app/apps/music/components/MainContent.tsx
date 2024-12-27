// /root/app/apps/music/components/MainContent.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";

interface Song {
  title: string;
  artist: string;
  path: string;
}

export function MainContent() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { getColor, getFont } = useStyles();

  useEffect(() => {
    // Initialize songs list
    setSongs([
      { title: "Song 1", artist: "Artist 1", path: "/audio/songs/song1.mp4" },
      { title: "Song 2", artist: "Artist 2", path: "/audio/songs/song2.mp4" },
    ]);
  }, []);

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

  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#030303] overflow-hidden flex flex-col">
      <div className="h-16 flex items-center px-6 gap-4">
        <div className="flex-1 max-w-[720px]">
          <div className="bg-white/[0.08] rounded-full px-4 py-2 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-white/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search songs, albums, artists, podcasts"
              className="bg-transparent border-none outline-none text-white w-full"
              style={{ fontFamily: getFont("Text Primary") }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="flex flex-wrap gap-4">
          {songs.map((song, index) => (
            <div
              key={index}
              className="w-48 cursor-pointer"
              onClick={() => {
                setCurrentSongIndex(index);
                if (audioRef.current) {
                  audioRef.current.play();
                  setIsPlaying(true);
                }
              }}
            >
              <div className="relative group">
                <Image
                  src="/media/system/_empty_image.png"
                  alt={song.title}
                  width={192}
                  height={192}
                  className="rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {currentSongIndex === index && isPlaying ? (
                    <Pause size={40} className="text-white" />
                  ) : (
                    <Play size={40} className="text-white" />
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-white font-medium">{song.title}</div>
                <div className="text-white/60 text-sm">{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={songs[currentSongIndex]?.path}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress(
              (audioRef.current.currentTime / audioRef.current.duration) * 100
            );
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (currentSongIndex < songs.length - 1) {
            setCurrentSongIndex((prev) => prev + 1);
            if (audioRef.current) {
              audioRef.current.play();
              setIsPlaying(true);
            }
          }
        }}
      />

      <div
        className="h-20 border-t flex items-center px-4 gap-4"
        style={{ borderColor: getColor("Brd") }}
      >
        <div className="flex items-center gap-4 flex-1">
          <Image
            src="/media/system/_empty_image.png"
            alt="Current Song"
            width={48}
            height={48}
            className="rounded"
          />
          <div>
            <div className="text-white font-medium">
              {songs[currentSongIndex]?.title}
            </div>
            <div className="text-white/60 text-sm">
              {songs[currentSongIndex]?.artist}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="text-white/80 hover:text-white"
            onClick={() => {
              if (currentSongIndex > 0) {
                setCurrentSongIndex((prev) => prev - 1);
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play();
                  setIsPlaying(true);
                }
              }
            }}
          >
            <SkipBack size={20} />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            className="text-white/80 hover:text-white"
            onClick={() => {
              if (currentSongIndex < songs.length - 1) {
                setCurrentSongIndex((prev) => prev + 1);
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play();
                  setIsPlaying(true);
                }
              }
            }}
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-end gap-4">
          <Volume2 size={20} className="text-white/80" />
          <div className="w-24 h-1 bg-white/10 rounded-full">
            <div
              className="h-full bg-white rounded-full cursor-pointer"
              style={{ width: `${volume * 100}%` }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const newVolume = Math.max(0, Math.min(1, x / rect.width));
                handleVolumeChange(newVolume);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
