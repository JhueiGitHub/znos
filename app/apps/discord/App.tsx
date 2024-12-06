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

  // EVOLVED: Fixed server detection and state management
  useEffect(() => {
    const fetchInitialProfile = async () => {
      try {
        const response = await fetch("/api/initial-profile");
        const data = await response.json();

        // EVOLVED: Properly check for existing server
        const servers = await fetch("/api/servers").then((res) => res.json());

        if (servers?.length > 0) {
          const initialServer = servers[0];
          setServerId(initialServer.id);

          if (initialServer.channels?.length > 0) {
            const generalChannel = initialServer.channels.find(
              (c: any) => c.name === "general"
            );
            setActiveChannelId(
              generalChannel?.id || initialServer.channels[0].id
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

  // PRESERVED: Original channel selection handler
  const handleChannelSelect = (channelId: string | null) => {
    setActiveChannelId(channelId);
    if (channelId) {
      onOpen("channel", { channelId });
    }
  };

  if (isLoading) {
    return <AppSkeleton />;
  }

  // EVOLVED: Only show InitialModal if genuinely no server exists
  if (currentView === "initial" && !serverId) {
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
