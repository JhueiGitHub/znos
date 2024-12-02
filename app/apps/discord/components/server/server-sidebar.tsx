// /app/apps/discord/components/server/server-sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { ServerHeader } from "./server-header";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

interface ServerSidebarProps {
  serverId: string;
}

// PRESERVED: Channel type icons don't need dynamic styling
const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

// EVOLVED: Role icons using the correct useDiscordStyles hook
const ModeratorIcon = () => {
  const { getDiscordStyle } = useDiscordStyles();
  return (
    <ShieldCheck
      className="h-4 w-4 mr-2"
      style={{ color: useDiscordStyles().getDiscordStyle("icon-moderator") }}
    />
  );
};

const AdminIcon = () => {
  const { getDiscordStyle } = useDiscordStyles();
  return (
    <ShieldAlert
      className="h-4 w-4 mr-2"
      style={{ color: useDiscordStyles().getDiscordStyle("icon-admin") }}
    />
  );
};

// EVOLVED: Role icon map using the correct hook references
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ModeratorIcon />,
  [MemberRole.ADMIN]: <AdminIcon />,
};

export const ServerSidebar = ({ serverId }: ServerSidebarProps) => {
  const { getDiscordStyle } = useDiscordStyles();

  const [server, setServer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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
    (member: any) => member.profileId === profile.id
  )?.role;

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{
        backgroundColor: getDiscordStyle("container-bg"),
        color: getDiscordStyle("text-default"),
      }}
    >
      <ServerHeader server={server} role={role} />
    </div>
  );
};
