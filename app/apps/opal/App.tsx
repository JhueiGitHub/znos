// /root/app/apps/opal/App.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@opalc/global/sidebar";

const OpalApp = () => {
  // We can add loading state later if needed
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex h-full w-full bg-black/80 text-white/75">
      {/* Main app container */}
      <Sidebar activeWorkspaceId="default" />

      {/* Content area - will be added later */}
      <div className="flex-1">
        {/* Video recording interface will go here */}
      </div>
    </div>
  );
};

export default OpalApp;
