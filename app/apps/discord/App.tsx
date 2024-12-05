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

  // EVOLVED: Enhanced initial profile fetching with server + channel logic
  useEffect(() => {
    const fetchInitialProfile = async () => {
      try {
        // PRESERVED: Original profile fetch
        const response = await fetch("/api/initial-profile");
        const data = await response.json();

        // EVOLVED: Intelligent initial state loading
        if (data.servers?.length > 0) {
          // Get first server by default
          const initialServer = data.servers[0];
          setServerId(initialServer.id);

          // EVOLVED: Auto-select first available channel
          if (initialServer.channels?.length > 0) {
            const generalChannel = initialServer.channels.find(
              (c: any) => c.name === "general"
            );
            const firstChannel = initialServer.channels[0];
            setActiveChannelId(generalChannel?.id || firstChannel.id);
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

  // EVOLVED: Loading state with proper skeleton
  if (isLoading) {
    return <AppSkeleton />;
  }

  // PRESERVED: Initial setup modal logic
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

  // EVOLVED: Guaranteed server + channel state
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
