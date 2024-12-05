// app/apps/discord/App.tsx
"use client";

import { useState, useEffect } from "react";
import { InitialModal } from "./components/modals/initial-modal";
import ServerPage from "./servers/[serverId]/page";
import MainLayout from "./servers/[serverId]/layout";
import { useModal } from "@dis/hooks/use-modal-store";
import { AppSkeleton } from "./components/skeletons/AppSkeleton";

interface ChannelSelectHandler {
  (channelId: string | null): void;
}

const SetupPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"initial" | "server">(
    "initial"
  );
  const [serverId, setServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const { onOpen } = useModal();

  // PRESERVED: Simple initial profile fetch with server data
  useEffect(() => {
    const fetchInitialProfile = async () => {
      try {
        const response = await fetch("/api/initial-profile");
        const data = await response.json();

        // RESTORED: Original simple server check
        if (data.server) {
          setServerId(data.server.id);

          // PRESERVED: Channel selection if server exists
          if (data.server.channels?.length > 0) {
            const generalChannel = data.server.channels.find(
              (c: any) => c.name === "general"
            );
            setActiveChannelId(
              generalChannel?.id || data.server.channels[0].id
            );
          }

          setCurrentView("server");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load initial discord state:", error);
        setIsLoading(false);
      }
    };

    fetchInitialProfile();
  }, []);

  const handleChannelSelect = (channelId: string | null) => {
    setActiveChannelId(channelId);
    if (channelId) {
      onOpen("channel", { channelId });
    }
  };

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (currentView === "initial") {
    return (
      <InitialModal
        onServerCreated={(id) => {
          setServerId(id);
          setCurrentView("server");
        }}
      />
    );
  }

  if (currentView === "server" && serverId) {
    return (
      <MainLayout
        onChannelSelect={handleChannelSelect}
        activeChannelId={activeChannelId}
      >
        <ServerPage
          serverId={serverId}
          onChannelSelect={handleChannelSelect}
          activeChannelId={activeChannelId}
        />
      </MainLayout>
    );
  }

  return null;
};

export default SetupPage;
