// /app/apps/flow/components/FlowContent.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FlowHeader } from "./FlowHeader";
import { FlowGrid } from "./FlowGrid";
import { AppsGrid } from "./AppsGrid";
import { StreamView } from "./StreamView";
import { AppView } from "./AppView";
import { EditorView } from "./canvas/EditorView";
import { OrionEditorView } from "./editors/OrionEditorView";
import { useStyles } from "@os/hooks/useStyles";
import axios from "axios";

type ViewState = {
  type: "dashboard" | "apps" | "app" | "stream" | "editor";
  id?: string;
  previousView?: ViewState;
  flowData?: {
    id: string;
    type: string;
    streamType: string;
  };
};

interface FlowContentProps {
  currentView?: string;
}

export const FlowContent = ({ currentView = "streams" }) => {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    type: currentView === "apps" ? "apps" : "dashboard",
  }));

  // Update view when sidebar selection changes
  useEffect(() => {
    setViewState((prev) => ({
      type: currentView === "apps" ? "apps" : "dashboard",
      previousView: prev.type !== currentView ? prev : prev.previousView,
    }));
  }, [currentView]);

  // Navigation handlers
  const handleBack = () => {
    if (viewState.previousView) {
      setViewState(viewState.previousView);
    } else {
      // Default fallback navigation logic
      switch (viewState.type) {
        case "stream":
          setViewState({
            type: viewState.id?.startsWith("app-") ? "app" : "dashboard",
          });
          break;
        case "app":
          setViewState({ type: "apps" });
          break;
        case "editor":
          setViewState({ type: "stream", id: "os-main" }); // Replace with actual stream ID
          break;
        default:
          setViewState({ type: "dashboard" });
      }
    }
  };

  const handleAppSelect = (appId: string) => {
    setViewState({
      type: "app",
      id: appId,
      previousView: viewState,
    });
  };

  const handleStreamSelect = (streamId: string) => {
    setViewState({
      type: "stream",
      id: streamId,
      previousView: viewState,
    });
  };

  const handleFlowSelect = async (flowId: string) => {
    try {
      const response = await axios.get(`/api/flows/${flowId}`);
      const flowData = response.data;

      setViewState({
        type: "editor",
        id: flowId,
        flowData: {
          id: flowId,
          type: flowData.type,
          streamType: flowData.stream.type,
        },
        previousView: viewState,
      });
    } catch (error) {
      console.error("Error fetching flow data:", error);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      {viewState.type === "dashboard" && (
        <>
          <FlowHeader title="Flow" subtitle="All Streams" onBack={null} />
          <FlowGrid onStreamSelect={handleStreamSelect} />
        </>
      )}

      {viewState.type === "apps" && (
        <>
          <FlowHeader title="Apps" subtitle="OS Configurations" onBack={null} />
          <AppsGrid onAppSelect={handleAppSelect} />
        </>
      )}

      {viewState.type === "app" && viewState.id && (
        <>
          <FlowHeader
            title={viewState.id}
            subtitle="Configurations"
            onBack={handleBack}
          />
          <AppView appId={viewState.id} onStreamSelect={handleStreamSelect} />
        </>
      )}

      {viewState.type === "stream" && viewState.id && (
        <>
          <FlowHeader
            title={viewState.id}
            subtitle="Flows"
            onBack={handleBack}
          />
          <StreamView streamId={viewState.id} onFlowSelect={handleFlowSelect} />
        </>
      )}

      {viewState.type === "editor" &&
        viewState.id &&
        (viewState.flowData?.streamType === "CONFIG" ? (
          <OrionEditorView flowId={viewState.id} onClose={() => handleBack()} />
        ) : (
          <EditorView flowId={viewState.id} onClose={() => handleBack()} />
        ))}
    </div>
  );
};
