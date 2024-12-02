"use client";

import { useState, useEffect } from "react";
import { InitialModal } from "./components/modals/initial-modal";
import ServerPage from "./servers/[serverId]/page";
import MainLayout from "./servers/[serverId]/layout";

interface SetupPageProps {
  initialProfile: any; // Replace 'any' with your actual profile type
}

const SetupPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'initial' | 'server'>('initial');
  const [serverId, setServerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialProfile = async () => {
      const response = await fetch("/api/initial-profile");
      const data = await response.json();

      if (data.server) {
        setServerId(data.server.id);
        setCurrentView('server');
      }
      setIsLoading(false);
    };

    fetchInitialProfile();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (currentView === 'initial') {
    return <InitialModal onServerCreated={(id) => {
      setServerId(id);
      setCurrentView('server');
    }} />;
  }

  if (currentView === 'server' && serverId) {
    return (
    <MainLayout>
      <ServerPage serverId={serverId} />
      </MainLayout>
      )
  }

  return null;
};

export default SetupPage;