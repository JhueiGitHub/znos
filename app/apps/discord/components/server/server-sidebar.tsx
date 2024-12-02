"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

import { ServerHeader } from "./server-header";

interface ServerSidebarProps {
  serverId: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
}

export const ServerSidebar = ({ serverId }: ServerSidebarProps) => {
  const [server, setServer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, serverRes] = await Promise.all([
          fetch('/api/profile'),
          fetch(`/api/servers/${serverId}`)
        ]);

        if (!profileRes.ok || !serverRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [profileData, serverData] = await Promise.all([
          profileRes.json(),
          serverRes.json()
        ]);

        setProfile(profileData);
        setServer(serverData);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/');
      }
    };

    fetchData();
  }, [serverId, router]);

  if (!profile || !server) {
    return <div>Loading...</div>;
  }

  const role = server.members.find((member: any) => member.profileId === profile.id)?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full bg-[#2B2D31] bg-opacity-45">
      <ServerHeader
        server={server}
        role={role}
      />
    </div>
  )
}