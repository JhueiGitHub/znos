"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Channel,
  ChannelType,
  Member,
  MemberRole,
  Profile,
  Server,
} from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

interface ServerSidebarProps {
  serverId: string;
}

interface ServerWithMembersWithProfiles extends Server {
  channels: Channel[];
  members: (Member & {
    profile: Profile;
  })[];
}

// PRESERVED: Single source of icons
const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 mr-2" style={{ color: "#5865F2" }} />
  ),
  [MemberRole.ADMIN]: (
    <ShieldAlert className="h-4 w-4 mr-2" style={{ color: "#ED4245" }} />
  ),
};

export const ServerSidebar = ({ serverId }: ServerSidebarProps) => {
  const { getDiscordStyle } = useDiscordStyles();
  const [server, setServer] = useState<ServerWithMembersWithProfiles | null>(
    null
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, serverRes] = await Promise.all([
          fetch("/api/profile"),
          fetch(`/api/servers/${serverId}`),
        ]);

        if (!profileRes.ok || !serverRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [profileData, serverData] = await Promise.all([
          profileRes.json(),
          serverRes.json(),
        ]);

        setProfile(profileData);
        setServer(serverData);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/");
      }
    };

    fetchData();
  }, [serverId, router]);

  if (!profile || !server) {
    return (
      <div style={{ color: getDiscordStyle("text-default") }}>Loading...</div>
    );
  }

  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  // Added filtering for sections
  const textChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );
  const members = server.members.filter(
    (member) => member.profileId !== profile.id
  );

  // EVOLVED: Added search data structure
  const searchData = [
    {
      label: "Text Channels",
      type: "channel" as const,
      data: textChannels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Voice Channels",
      type: "channel" as const,
      data: audioChannels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Video Channels",
      type: "channel" as const,
      data: videoChannels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Members",
      type: "member" as const,
      data: members.map((member) => ({
        id: member.id,
        name: member.profile.name,
        icon: roleIconMap[member.role],
      })),
    },
  ];

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{
        backgroundColor: getDiscordStyle("container-bg"),
        color: getDiscordStyle("text-default"),
      }}
    >
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-[#ffffff15] dark:bg-zinc-700 rounded-md my-2" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Voice Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              role={role}
              label="Video Channels"
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember key={member.id} member={member} server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
