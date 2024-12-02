// /app/apps/discord/components/navigation/navigation-sidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { NavigationAction } from "./navigation-action";
import { ScrollArea } from "@dis/components/ui/scroll-area";
import { Separator } from "@dis/components/ui/separator";
import { Server } from "@prisma/client";
import { NavigationItem } from "./navigation-item";
import { useDiscordStyles } from "../../hooks/useDiscordStyles";

interface NavigationSidebarProps {
  onServerSelect: (serverId: string) => void;
}

const NavigationSidebar = ({ onServerSelect }: NavigationSidebarProps) => {
  const { getDiscordStyle, getFont } = useDiscordStyles();
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sidebar-data");
        if (!response.ok) {
          throw new Error("Failed to fetch sidebar data");
        }
        const data = await response.json();
        setServers(data.servers);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
        router.push("/");
      }
    };

    fetchData();
  }, [router]);

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
      <Separator
        className="h-[2px] rounded-md w-10 mx-auto"
        style={{
          backgroundColor: getDiscordStyle("separator"),
        }}
      />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
              onSelect={() => onServerSelect(server.id)}
            />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default NavigationSidebar;
