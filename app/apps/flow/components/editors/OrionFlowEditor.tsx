import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useOthers } from "@/liveblocks.config";
import { useDesignSystem } from "@/app/contexts/DesignSystemContext";
import { OrionFlowComponent } from "./orion-flow-types";
import OrionEditorSidebar from "./OrionEditorSidebar";

interface OrionFlowEditorProps {
  flowId: string;
}

const OrionFlowEditor = ({ flowId }: OrionFlowEditorProps) => {
  const others = useOthers();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const queryClient = useQueryClient();
  const { designSystem } = useDesignSystem();
  const [selectedComponent, setSelectedComponent] =
    useState<OrionFlowComponent | null>(null);

  const { data: flow } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const response = await axios.get(`/api/flows/${flowId}`);
      return response.data;
    },
  });

  const updateComponent = useMutation({
    mutationFn: async ({
      componentId,
      updates,
    }: {
      componentId: string;
      updates: Partial<OrionFlowComponent>;
    }) => {
      const response = await axios.patch(
        `/api/flows/${flowId}/components/${componentId}`,
        updates
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["flow", flowId]);
    },
  });

  const handleComponentUpdate = (
    componentId: string,
    updates: Partial<OrionFlowComponent>
  ) => {
    updateComponent.mutate({ componentId, updates });
  };

  useEffect(() => {
    if (!canvasRef.current || !flow?.components || !designSystem) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 560,
      height: window.innerHeight,
      backgroundColor: "#010203",
      selection: false,
    });

    fabricRef.current = canvas;

    const getTokenColor = (tokenId: string | null): string => {
      if (!tokenId || !designSystem.colorTokens) return "#000000";
      const token = designSystem.colorTokens.find((t) => t.name === tokenId);
      return token?.value || "#000000";
    };

    // Create wallpaper circle
    const wallpaper = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 40,
      fill: getTokenColor(flow.components[0].tokenId),
      stroke: "#ffffff10",
      strokeWidth: 2,
      selectable: true,
      name: "wallpaper",
      data: flow.components[0],
    });

    // Create dock icon circles
    const dockIcons = flow.components
      .filter((c: OrionFlowComponent) => c.type === "DOCK_ICON")
      .map((icon: OrionFlowComponent, index: number) => {
        return new fabric.Circle({
          left: 100 + (index + 1) * 120,
          top: 100,
          radius: 40,
          fill: getTokenColor(icon.tokenId),
          stroke: "#ffffff10",
          strokeWidth: 2,
          selectable: true,
          name: `dock-icon-${index}`,
          data: icon,
        });
      });

    // Add selection handler
    canvas.on("selection:created", (options) => {
      const selectedObject = options.selected?.[0];
      if (selectedObject && selectedObject.data) {
        setSelectedComponent(selectedObject.data as OrionFlowComponent);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedComponent(null);
    });

    // Add elements to canvas
    canvas.add(wallpaper, ...dockIcons);

    // Standard pan and zoom controls
    let isPanning = false;
    let lastClientX = 0;
    let lastClientY = 0;

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey) {
        isPanning = true;
        lastClientX = evt.clientX;
        lastClientY = evt.clientY;
        canvas.defaultCursor = "grabbing";
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isPanning && opt.e) {
        const evt = opt.e as MouseEvent;
        const deltaX = evt.clientX - lastClientX;
        const deltaY = evt.clientY - lastClientY;

        const vpt = canvas.viewportTransform!;
        vpt[4] += deltaX;
        vpt[5] += deltaY;

        canvas.requestRenderAll();

        lastClientX = evt.clientX;
        lastClientY = evt.clientY;
      }
    });

    canvas.on("mouse:up", () => {
      isPanning = false;
      canvas.defaultCursor = "default";
    });

    canvas.on("mouse:wheel", (opt) => {
      const evt = opt.e as WheelEvent;
      evt.preventDefault();

      const delta = evt.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(0.1, zoom), 20);
      const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
      canvas.zoomToPoint(point, zoom);
    });

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 560,
        height: window.innerHeight,
      });
      canvas.requestRenderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, flow, designSystem]);

  return (
    <div className="h-full w-full bg-[#010203] relative">
      <canvas ref={canvasRef} />

      <OrionEditorSidebar
        selectedComponent={selectedComponent}
        designSystem={designSystem}
        onUpdateComponent={handleComponentUpdate}
      />

      <div className="fixed top-4 right-20 text-[#cccccc]/70 text-xs">
        {others.length} other user{others.length === 1 ? "" : "s"} present
      </div>
    </div>
  );
};

export default OrionFlowEditor;
