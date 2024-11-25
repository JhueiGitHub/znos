// app/apps/flow/components/FlowContent.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { FlowHeader } from "./FlowHeader";
import { FlowGrid } from "./FlowGrid";
import { AppsGrid } from "./AppsGrid";
import { StreamView } from "./StreamView";
import { AppView } from "./AppView";
import { EditorView } from "./canvas/EditorView";
import { OrionEditorView } from "./editors/OrionEditorView";
import { CommunityView } from "./CommunityView";
import { ViewState, ViewType } from "../types/view";

interface FlowContentProps {
  currentView?: ViewType;
}

export const FlowContent = ({ currentView = "streams" }: FlowContentProps) => {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    type: currentView === "apps" ? "apps" : currentView,
    previousView: null,
    flowData: null,
  }));

  useEffect(() => {
    setViewState((prev) => ({
      type: currentView === "apps" ? "apps" : currentView,
      previousView: prev.type !== currentView ? prev : prev.previousView,
      flowData: null,
    }));
  }, [currentView]);

  const handleBack = () => {
    if (viewState.previousView) {
      setViewState(viewState.previousView);
    } else {
      switch (viewState.type) {
        case "stream":
          setViewState({
            type: viewState.id?.startsWith("app-") ? "app" : "streams",
            id: viewState.id?.startsWith("app-")
              ? viewState.id.slice(4)
              : undefined,
            previousView: null,
            flowData: null,
          });
          break;
        case "app":
          setViewState({ type: "apps", previousView: null, flowData: null });
          break;
        case "editor":
          if (viewState.previousView) {
            setViewState({
              type: "stream",
              id: (viewState.previousView as ViewState).id,
              previousView:
                (viewState.previousView as ViewState).previousView ?? null,
              flowData: null,
            });
          } else {
            setViewState({
              type: "streams",
              previousView: null,
              flowData: null,
            });
          }
          break;
        default:
          setViewState({ type: "streams", previousView: null, flowData: null });
      }
    }
  };

  const handleAppSelect = (appId: string) => {
    setViewState({
      type: "app",
      id: appId,
      previousView: viewState,
      flowData: null,
    });
  };

  const handleStreamSelect = (streamId: string) => {
    setViewState({
      type: "stream",
      id: streamId,
      previousView: viewState,
      flowData: null,
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
      {viewState.type === "streams" && (
        <>
          <FlowHeader
            title="Flow"
            subtitle="All Streams"
            onBack={null}
            currentView={viewState.type}
          />
          <FlowGrid onStreamSelect={handleStreamSelect} />
        </>
      )}

      {viewState.type === "apps" && (
        <>
          <FlowHeader
            title="Apps"
            subtitle="OS Configurations"
            onBack={null}
            currentView={viewState.type}
          />
          <AppsGrid onAppSelect={handleAppSelect} />
        </>
      )}

      {viewState.type === "app" && viewState.id && (
        <>
          <FlowHeader
            title={viewState.id}
            subtitle="Configurations"
            onBack={handleBack}
            currentView={viewState.type}
            viewId={viewState.id}
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
            currentView={viewState.type}
            viewId={viewState.id}
          />
          <StreamView streamId={viewState.id} onFlowSelect={handleFlowSelect} />
        </>
      )}

      {viewState.type === "editor" &&
        viewState.id &&
        (viewState.flowData?.streamType === "CONFIG" ? (
          <OrionEditorView flowId={viewState.id} onClose={handleBack} />
        ) : (
          <EditorView flowId={viewState.id} onClose={handleBack} />
        ))}

      {viewState.type === "community" && <CommunityView isFullscreen={false} />}
    </div>
  );
};
