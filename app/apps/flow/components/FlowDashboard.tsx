import { useState } from "react";
import { FlowSidebar } from "./FlowSidebar";
import { FlowContent } from "./FlowContent";

export const FlowDashboard = () => {
  const [currentView, setCurrentView] = useState<string>("streams");

  return (
    <div className="flex h-screen overflow-hidden bg-[#010203] bg-opacity-75">
      <FlowSidebar onViewChange={setCurrentView} />
      <FlowContent currentView={currentView} />
    </div>
  );
};

export default FlowDashboard;
