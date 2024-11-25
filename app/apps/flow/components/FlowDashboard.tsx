// app/apps/flow/components/FlowDashboard.tsx
import { useState } from "react";
import { FlowSidebar } from "./FlowSidebar";
import { FlowContent } from "./FlowContent";
import { ViewType } from "../types/view";

export const FlowDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>("streams");

  return (
    <div className="flex h-screen overflow-hidden bg-[#010203] bg-opacity-75">
      <FlowSidebar onViewChange={(view: ViewType) => setCurrentView(view)} />
      <FlowContent currentView={currentView} />
    </div>
  );
};

export default FlowDashboard;