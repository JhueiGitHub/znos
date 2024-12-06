"use client";

import { useState, useEffect } from "react";
import { InitialModal } from "./components/modals/initial-modal";
import ServerPage from "./servers/[serverId]/page";
import MainLayout from "./servers/[serverId]/layout";
import { useModal } from "@dis/hooks/use-modal-store";
import { AppSkeleton } from "./components/skeletons/AppSkeleton";

const SetupPage = () => {
  // PRESERVED: Core state
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"initial" | "server">(
    "initial"
  );
  const [serverId, setServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const { onOpen } = useModal();

  // EVOLVED: Enhanced initialization flow
  useEffect(() => {
    const initializeDiscordState = async () => {
      try {
        // Step 1: Get initial profile and available servers
        const [profileRes, sidebarRes] = await Promise.all([
          fetch("/api/initial-profile"),
          fetch("/api/sidebar-data"),
        ]);

        const [profileData, sidebarData] = await Promise.all([
          profileRes.json(),
          sidebarRes.json(),
        ]);

        // Step 2: Select initial server (prioritize profile.server if exists)
        const initialServer = profileData.server || sidebarData.servers?.[0];

        if (initialServer?.id) {
          setServerId(initialServer.id);

          // Step 3: Get full server details
          const serverRes = await fetch(`/api/servers/${initialServer.id}`);
          const serverData = await serverRes.json();

          // Step 4: Select initial channel
          if (serverData.channels?.length) {
            const generalChannel = serverData.channels.find(
              (c: any) => c.name === "general"
            );
            setActiveChannelId(generalChannel?.id || serverData.channels[0].id);
          }

          setCurrentView("server");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Discord state:", error);
        setIsLoading(false);
      }
    };

    initializeDiscordState();
  }, []);

  // PRESERVED: Channel selection handler
  const handleChannelSelect = (channelId: string | null) => {
    setActiveChannelId(channelId);
    if (channelId) {
      onOpen("channel", { channelId });
    }
  };

  if (isLoading) return <AppSkeleton />;

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

  // EVOLVED: Pass serverId explicitly to force synchronization
  if (currentView === "server" && serverId) {
    return (
      <MainLayout
        initialServerId={serverId}
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
