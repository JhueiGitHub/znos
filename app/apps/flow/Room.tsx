// /root/app/apps/flow/Room.tsx
"use client";

import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@/liveblocks.config";

const Room = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoomProvider
      id="flow-canvas-room"
      initialPresence={{ cursor: null }}
      initialStorage={{
        canvasObjects: new LiveMap(),
      }}
    >
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Room;
