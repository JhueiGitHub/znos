import React, { useEffect, useState } from "react";
import { useFlowStore, fetchFlows } from "../store/flowStore";
import { useAppStore } from "../store/appStore";
import { useStyles } from "../hooks/useStyles";

const FlowDashboard: React.FC = () => {
  const { flows, setFlows, setActiveFlow } = useFlowStore();
  const { openApp, openApps } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getColor, getFont } = useStyles();

  useEffect(() => {
    const loadFlows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedFlows = await fetchFlows();
        if (fetchedFlows) {
          setFlows(fetchedFlows);
        }
      } catch (err) {
        setError("Failed to fetch flows");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFlows();
  }, [setFlows]);

  const handleFlowClick = (flowId: string) => {
    setActiveFlow(flowId);

    if (!openApps.some((app) => app.id === "flow")) {
      openApp({
        id: "flow",
        name: "Flow",
        icon: "flow-icon",
        dockPosition: 1,
        animationType: "magnify",
      });
    }
  };

  return (
    <div
      className="p-6 h-full"
      style={{
        color: getColor("Text Primary (Hd)"),
      }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: getFont("Text Primary") }}
      >
        Flow Dashboard
      </h2>

      {isLoading ? (
        <p style={{ fontFamily: getFont("Text Secondary") }}>
          Loading flows...
        </p>
      ) : error ? (
        <p
          className="text-red-500"
          style={{ fontFamily: getFont("Text Secondary") }}
        >
          {error}
        </p>
      ) : flows.length === 0 ? (
        <p style={{ fontFamily: getFont("Text Secondary") }}>
          No flows available. Create a new flow to get started.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {flows.map((flow) => (
            <div
              key={flow.id}
              className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: getColor("Overlaying BG"),
                borderColor: getColor("Brd"),
              }}
              onClick={() => handleFlowClick(flow.id)}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: getFont("Text Primary") }}
              >
                {flow.name}
              </h3>
              <p
                className="text-sm opacity-70"
                style={{ fontFamily: getFont("Text Secondary") }}
              >
                {flow.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlowDashboard;
