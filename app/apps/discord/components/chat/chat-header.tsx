"use client";

import { Hash } from "lucide-react";
import { MobileToggle } from "@dis/components/mobile-toggle";
import { UserAvatar } from "@dis/components/user-avatar";
import { SocketIndicator } from "@dis/components/socket-indicator";
import { ChatVideoButton } from "./chat-video-button";
import { useDiscordStyles } from "@/app/apps/discord/hooks/useDiscordStyles";

// PRESERVED: Original props interface
interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}

export const ChatHeader = ({
  serverId,
  name,
  type,
  imageUrl,
}: ChatHeaderProps) => {
  // EVOLVED: Add Discord styling
  const { getDiscordStyle } = useDiscordStyles();

  return (
    <div
      className="text-md font-semibold px-3 flex items-center h-12"
      style={{
        backgroundColor: getDiscordStyle("container-bg"),
        borderBottom: "0.6px solid rgba(255, 255, 255, 0.09)",
      }}
    >
      {/* PRESERVED: Mobile toggle */}
      <MobileToggle serverId={serverId} />

      {/* PRESERVED: Channel type icon with evolved styling */}
      {type === "channel" && (
        <Hash
          className="w-5 h-5 mr-2"
          style={{ color: getDiscordStyle("text-default") }}
        />
      )}

      {/* PRESERVED: Conversation avatar */}
      {type === "conversation" && (
        <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8 mr-2" />
      )}

      {/* EVOLVED: Text styling */}
      <p
        className="font-semibold text-md"
        style={{ color: getDiscordStyle("text-default") }}
      >
        {name}
      </p>

      {/* PRESERVED: Action buttons with proper alignment */}
      <div className="ml-auto flex items-center">
        {type === "conversation" && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </div>
  );
};
