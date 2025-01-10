"use client";

import React, { createContext, useContext, useState } from "react";

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

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  playPlaylist: (playlistId: string) => void;
}

const PLAYLISTS_DATA: Playlist[] = [
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
        thumbnail: "/media/songs/blav_elastic.png",
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

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);

  const playPlaylist = (playlistId: string) => {
    const playlist = PLAYLISTS_DATA.find((p) => p.id === playlistId);
    if (playlist) {
      setCurrentPlaylist(playlist);
    }
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists: PLAYLISTS_DATA,
        currentPlaylist,
        setCurrentPlaylist,
        playPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
