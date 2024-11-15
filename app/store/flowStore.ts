// app/store/flowStore.ts

import { create } from "zustand";
import { Flow, FlowComponent } from "@prisma/client";

// Extend the Flow type to include components
interface ExtendedFlow extends Flow {
  components: FlowComponent[];
}

interface FlowState {
  flows: ExtendedFlow[];
  activeFlowId: string | null;
  setFlows: (flows: ExtendedFlow[]) => void;
  setActiveFlow: (flowId: string) => void;
  addFlow: (flow: ExtendedFlow) => void;
  updateFlow: (updatedFlow: ExtendedFlow) => void;
  deleteFlow: (flowId: string) => void;
  addComponent: (flowId: string, component: FlowComponent) => void;
  updateComponent: (flowId: string, updatedComponent: FlowComponent) => void;
  deleteComponent: (flowId: string, componentId: string) => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  flows: [],
  activeFlowId: null,
  setFlows: (flows) => set({ flows }),
  setActiveFlow: (flowId) => set({ activeFlowId: flowId }),
  addFlow: (flow) => set((state) => ({ flows: [...state.flows, flow] })),
  updateFlow: (updatedFlow) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === updatedFlow.id ? updatedFlow : flow
      ),
    })),
  deleteFlow: (flowId) =>
    set((state) => ({
      flows: state.flows.filter((flow) => flow.id !== flowId),
      activeFlowId: state.activeFlowId === flowId ? null : state.activeFlowId,
    })),
  addComponent: (flowId, component) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? { ...flow, components: [...flow.components, component] }
          : flow
      ),
    })),
  updateComponent: (flowId, updatedComponent) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              components: flow.components.map((comp) =>
                comp.id === updatedComponent.id ? updatedComponent : comp
              ),
            }
          : flow
      ),
    })),
  deleteComponent: (flowId, componentId) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              components: flow.components.filter(
                (comp) => comp.id !== componentId
              ),
            }
          : flow
      ),
    })),
}));

// Utility function to fetch flows from the API
export const fetchFlows = async () => {
  try {
    const response = await fetch("/api/flows");
    if (!response.ok) {
      throw new Error("Failed to fetch flows");
    }
    const flows: ExtendedFlow[] = await response.json();
    useFlowStore.getState().setFlows(flows);
    return flows;
  } catch (error) {
    console.error("Error fetching flows:", error);
    return null;
  }
};

// Utility function to create a new flow
export const createFlow = async (name: string, description: string) => {
  try {
    const response = await fetch("/api/flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to create flow");
    }
    const newFlow: ExtendedFlow = await response.json();
    useFlowStore.getState().addFlow(newFlow);
    return newFlow;
  } catch (error) {
    console.error("Error creating flow:", error);
    return null;
  }
};

// Utility function to update a flow
export const updateFlow = async (
  flowId: string,
  name: string,
  description: string
) => {
  try {
    const response = await fetch(`/api/flows/${flowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to update flow");
    }
    const updatedFlow: ExtendedFlow = await response.json();
    useFlowStore.getState().updateFlow(updatedFlow);
    return updatedFlow;
  } catch (error) {
    console.error("Error updating flow:", error);
    return null;
  }
};

// Utility function to delete a flow
export const deleteFlow = async (flowId: string) => {
  try {
    const response = await fetch(`/api/flows/${flowId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete flow");
    }
    useFlowStore.getState().deleteFlow(flowId);
  } catch (error) {
    console.error("Error deleting flow:", error);
  }
};
