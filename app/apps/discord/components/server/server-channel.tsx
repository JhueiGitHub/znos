"use client";

import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { ActionTooltip } from "@dis/components/action-tooltip";
import { useModal } from "@dis/hooks/use-modal-store";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

// PRESERVED: Original interfaces
interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
  onSelect: (channelId: string) => void; // EVOLVED: Direct state management
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

export const ServerChannel = ({
  channel,
  server,
  role,
  onSelect,
}: ServerChannelProps) => {
  // PRESERVED: Original hooks
  const { onOpen } = useModal();
  const params = useParams();
  const { getDiscordStyle } = useDiscordStyles();

  // PRESERVED: Original icon mapping
  const Icon = iconMap[channel.type];

  // PRESERVED: Original permission checks
  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;
  const isGuest = !isAdmin && !isModerator;

  return (
    <button
      onClick={() => onSelect(channel.id)} // EVOLVED: Clean state management
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-black/30 transition mb-1",
        params?.channelId === channel.id && "bg-black/30"
      )}
    >
      <Icon className="flex-shrink-0 w-5 h-5 text-[#4C4F69]" />
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-[#CCCCCC]/80 group-hover:text-[#CCCCCC]/80 transition",
          params?.channelId === channel.id && "text-red-500"
        )}
      >
        {channel.name}
      </p>
      {/* PRESERVED: Original permission-based actions */}
      {channel.name !== "general" && !isGuest && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              onClick={(e) => {
                e.stopPropagation();
                onOpen("editChannel", {
                  server,
                  channel,
                });
              }}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              onClick={(e) => {
                e.stopPropagation();
                onOpen("deleteChannel", {
                  server,
                  channel,
                });
              }}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  );
};
