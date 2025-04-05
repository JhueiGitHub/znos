// app/apps/discord/components/skeletons/AppSkeleton.tsx
"use client";

import { useDiscordStyles } from "../../hooks/useDiscordStyles";
import { Skeleton } from "@/components/ui/skeleton";

export const AppSkeleton = () => {
  const { getDiscordStyle } = useDiscordStyles();

  return (
    <div
      className="h-full flex bg-black/30"
      style={{
        backgroundColor: getDiscordStyle("container-bg"),
      }}
    >
      {/* Server Sidebar Skeleton */}
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed">
        <div className="space-y-4 flex flex-col items-center h-full w-full py-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-12 w-12 rounded-full bg-neutral-700"
            />
          ))}
        </div>
      </div>

      {/* Channel Sidebar Skeleton */}
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed pl-[72px]">
        <div className="space-y-2 p-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full bg-neutral-700" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="h-full md:pl-[360px] flex-1">
        <div className="flex flex-col h-full">
          <Skeleton className="h-12 w-full bg-neutral-700" />
          <div className="flex-1 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full bg-neutral-700" />
                <Skeleton className="h-4 w-[200px] bg-neutral-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
