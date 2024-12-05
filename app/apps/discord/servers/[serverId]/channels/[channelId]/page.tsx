"use client";

import { useEffect, useState } from "react";
import { ChannelType } from "@prisma/client";
import { ChatHeader } from "@dis/components/chat/chat-header";
import { ChatInput } from "@dis/components/chat/chat-input";
import { ChatMessages } from "@dis/components/chat/chat-messages";
import { MediaRoom } from "@dis/components/media-room";
import { useDiscordStyles } from "@dis/hooks/useDiscordStyles";

interface ChannelIdPageProps {
  params: {
    channelId: string;
    serverId: string;
  };
  onBack: () => void;
  channelId: string;
}

const ChannelIdPage = ({ params, onBack, channelId }: ChannelIdPageProps) => {
  const { getDiscordStyle } = useDiscordStyles();
  const [channel, setChannel] = useState<any>(null);
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [channelRes, memberRes] = await Promise.all([
          fetch(`/api/channels/${channelId}`),
          fetch(`/api/members/me?serverId=${params.serverId}`),
        ]);

        const [channelData, memberData] = await Promise.all([
          channelRes.json(),
          memberRes.json(),
        ]);

        setChannel(channelData);
        setMember(memberData);
      } catch (error) {
        console.error("Failed to fetch channel data:", error);
      }
    };

    fetchData();
  }, [channelId, params.serverId]);

  if (!channel || !member) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          backgroundColor: getDiscordStyle("container-bg"),
          color: getDiscordStyle("text-default"),
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: getDiscordStyle("container-bg"),
      }}
    >
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={true} />
      )}
    </div>
  );
};

export default ChannelIdPage;
