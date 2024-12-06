"use client";

import { useState } from "react";
import NavigationSidebar from "../../components/navigation/navigation-sidebar";
import { ModalProvider } from "../../components/providers/modal-provider";
import ServerContent from "@dis/servers/[serverId]/page";
import { ServerSidebar } from "../../components/server/server-sidebar";
import ChannelIdPage from "@dis/servers/[serverId]/channels/[channelId]/page";

interface MainLayoutProps {
  children: React.ReactNode;
  onChannelSelect: (channelId: string | null) => void; // EVOLVED: Allow null
  activeChannelId: string | null;
}

const MainLayout = ({
  children,
  onChannelSelect,
  activeChannelId,
}: MainLayoutProps) => {
  const [currentServerId, setCurrentServerId] = useState<string | null>(null);

  // EVOLVED: Handle back to server view
  const handleChannelBack = () => {
    onChannelSelect(null);
  };

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed">
        <NavigationSidebar onServerSelect={setCurrentServerId} />
      </div>
      <ModalProvider />
      <main className="md:pl-[72px] h-full">
        {currentServerId ? (
          <div className="h-full flex">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed">
              <ServerSidebar
                serverId={currentServerId}
                onChannelSelect={onChannelSelect}
                selectedChannelId={activeChannelId}
              />
            </div>
            <div className="h-full md:pl-60 flex-1">
              {/* EVOLVED: Conditional rendering based on activeChannelId */}
              {activeChannelId ? (
                <ChannelIdPage
                  params={{
                    serverId: currentServerId,
                    channelId: activeChannelId,
                  }}
                  channelId={activeChannelId}
                  onBack={handleChannelBack}
                />
              ) : (
                <ServerContent
                  serverId={currentServerId}
                  onChannelSelect={onChannelSelect}
                  activeChannelId={activeChannelId}
                />
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default MainLayout;
