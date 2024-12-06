"use client";

import { useEffect, useState } from "react";
import { NavigationAction } from "./navigation-action";
import { ScrollArea } from "@dis/components/ui/scroll-area";
import { Separator } from "@dis/components/ui/separator";
import { Server } from "@prisma/client";
import { NavigationItem } from "./navigation-item";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

interface NavigationSidebarProps {
  initialServerId: string; // EVOLVED: Take initial server
}

interface MainLayoutProps {
  children: React.ReactNode;
  initialServerId: string; // EVOLVED: Take explicit serverId
  onChannelSelect: (channelId: string | null) => void;
  activeChannelId: string | null;
}

const NavigationSidebar = ({ initialServerId }: NavigationSidebarProps) => {
  const { getDiscordStyle, getFont } = useDiscordStyles();
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sidebar-data");
        const data = await response.json();
        setServers(data.servers);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      className="space-y-4 flex flex-col items-center h-full w-full py-3"
      style={{
        backgroundColor: getDiscordStyle("container-bg"),
        color: getDiscordStyle("text-default"),
        fontFamily: getFont("Text Primary"),
      }}
    >
      <NavigationAction />
      <Separator className="h-[2px] bg-[#FFFFFF15] rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
              initialServerId={initialServerId} // EVOLVED: Pass for active state
              onSelect={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default NavigationSidebar;
