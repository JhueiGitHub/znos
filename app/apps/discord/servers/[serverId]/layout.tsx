"use client";

import { useState } from "react";
import NavigationSidebar from "../../components/navigation/navigation-sidebar";
import { ModalProvider } from "../../components/providers/modal-provider";
import ServerContent from "@dis/servers/[serverId]/page"; // Create this component
import { ServerSidebar } from "../../components/server/server-sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentServerId, setCurrentServerId] = useState<string | null>(null);

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
              <ServerSidebar serverId={currentServerId} />
            </div>
            <div className="h-full md:pl-60 flex-1">
              <ServerContent serverId={currentServerId} />
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
