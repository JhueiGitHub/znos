// /app/apps/flow/components/canvas/OrionFlowEditor.tsx
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useOthers } from "@/liveblocks.config";
import { useDesignSystem } from "@/app/contexts/DesignSystemContext";
import { OrionFlowComponent } from "./orion-flow-types";
import OrionEditorSidebar from "./OrionEditorSidebar";
import { useAppStore } from "@/app/store/appStore";
import { AnimatePresence, motion } from "framer-motion";
import * as Portal from "@radix-ui/react-portal";
import { MediaItem } from "@prisma/client";
import { useStyles } from "@os/hooks/useStyles";

interface OrionFlowEditorProps {
  flowId: string;
}

interface UpdateResponse {
  id: string;
  type: "WALLPAPER" | "DOCK_ICON";
  mode: "color" | "media";
  value: string | null;
  tokenId?: string;
  mediaId?: string;
  order?: number;
}

interface MediaSelectorProps {
  position: { x: number; y: number };
  onSelect: (mediaItem: MediaItem) => void;
  onClose: () => void;
}

const MediaSelector = ({ position, onSelect, onClose }: MediaSelectorProps) => {
  const { getColor, getFont } = useStyles();
  const { data: mediaItems } = useQuery<MediaItem[]>({
    queryKey: ["media-items"],
    queryFn: async () => {
      const response = await axios.get("/api/media");
      return response.data;
    },
  });

  return (
    <Portal.Root>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="fixed z-50"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div
          className="w-[400px] rounded-lg overflow-hidden border shadow-lg"
          style={{
            backgroundColor: getColor("Glass"),
            borderColor: getColor("Brd"),
          }}
        >
          <div
            className="p-3 border-b flex items-center justify-between"
            style={{
              borderColor: getColor("Brd"),
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              Select Media
            </span>
            <button
              onClick={onClose}
              className="text-sm hover:opacity-70"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              ESC
            </button>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
            {mediaItems?.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05 }}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer border"
                style={{ borderColor: getColor("Brd") }}
                onClick={() => onSelect(item)}
              >
                <img src={item.url} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </Portal.Root>
  );
};

const OrionFlowEditor = ({ flowId }: OrionFlowEditorProps) => {
  const others = useOthers();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const queryClient = useQueryClient();
  const { designSystem } = useDesignSystem();
  const [selectedComponent, setSelectedComponent] =
    useState<OrionFlowComponent | null>(null);
  const [mediaSelector, setMediaSelector] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const updateOrionConfig = useAppStore((state) => state.setOrionConfig);

  const { data: flow } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const response = await axios.get(`/api/flows/${flowId}`);
      return response.data;
    },
    // Remove any app store updates from here
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const updateComponent = useMutation<
    UpdateResponse,
    Error,
    {
      componentId: string;
      updates: Partial<OrionFlowComponent>;
    }
  >({
    mutationFn: async ({ componentId, updates }) => {
      const response = await axios.patch<UpdateResponse>(
        `/api/flows/${flowId}/components/${componentId}`,
        updates
      );
      return response.data;
    },
    onSuccess: (updatedComponent) => {
      queryClient.invalidateQueries(["flow", flowId]);
      queryClient.invalidateQueries(["orion-wallpaper"]);

      if (updatedComponent.type === "WALLPAPER") {
        updateOrionConfig({
          wallpaper: {
            mode: updatedComponent.mode,
            value:
              updatedComponent.mode === "media" ? updatedComponent.value : null,
            tokenId:
              updatedComponent.mode === "color"
                ? updatedComponent.tokenId
                : undefined,
          },
          dockIcons: [],
        });
      }

      const canvas = fabricRef.current;
      if (canvas) {
        const objectToUpdate = canvas
          .getObjects()
          .find((obj) => obj.data?.id === updatedComponent.id);

        if (objectToUpdate) {
          if (updatedComponent.mode === "media" && updatedComponent.value) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const pattern = new fabric.Pattern({
                source: img,
                repeat: "no-repeat",
              });
              objectToUpdate.set("fill", pattern);
              canvas.renderAll();
            };
            img.src = updatedComponent.value;
          } else if (
            updatedComponent.mode === "color" &&
            updatedComponent.tokenId
          ) {
            const token = designSystem?.colorTokens.find(
              (t) => t.name === updatedComponent.tokenId
            );
            if (token) {
              objectToUpdate.set("fill", token.value);
              canvas.renderAll();
            }
          }
        }
      }
    },
    onError: (error) => {
      console.error("Failed to update component:", error);
    },
  });

  const handleMediaSelect = (mediaItem: MediaItem) => {
    if (!selectedComponent) return;

    handleComponentUpdate(selectedComponent.id, {
      mode: "media",
      value: mediaItem.url,
      mediaId: mediaItem.id,
    });
    setMediaSelector(null);
  };

  const handleComponentUpdate = (
    componentId: string,
    updates: Partial<OrionFlowComponent>
  ) => {
    if (
      !flow?.components.find((c: OrionFlowComponent) => c.id === componentId)
    ) {
      console.error("Component not found:", componentId);
      return;
    }

    const updatedComponent = {
      ...updates,
      value: updates.mode === "color" ? undefined : updates.value,
      tokenId: updates.mode === "media" ? undefined : updates.tokenId,
    };

    updateComponent.mutate({
      componentId,
      updates: updatedComponent,
    });
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

    const initializeComponent = (
      component: OrionFlowComponent,
      index: number
    ) => {
      const baseCircleProps = {
        left: 100 + index * 120,
        top: 100,
        radius: 40,
        stroke: "#ffffff10",
        strokeWidth: 2,
        selectable: true,
        data: component,
      };

      const circle = new fabric.Circle({
        ...baseCircleProps,
        fill:
          component.mode === "media" && component.value
            ? "rgba(0,0,0,0)"
            : getTokenColor(component.tokenId),
      });

      canvas.add(circle);

      if (component.mode === "media" && component.value) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const pattern = new fabric.Pattern({
            source: img,
            repeat: "no-repeat",
          });
          circle.set("fill", pattern);
          canvas.renderAll();
        };
        img.src = component.value;
      }
    };

    flow.components.forEach((component: OrionFlowComponent, index: number) => {
      initializeComponent(component, index);
    });

    if (canvas.getContext()) {
      canvas.renderAll();
    }

    canvas.on("selection:created", (options) => {
      const selectedObject = options.selected?.[0];
      if (selectedObject && selectedObject.data) {
        setSelectedComponent(selectedObject.data as OrionFlowComponent);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedComponent(null);
    });

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

        if (canvas.viewportTransform) {
          canvas.viewportTransform[4] += deltaX;
          canvas.viewportTransform[5] += deltaY;
          canvas.requestRenderAll();
        }

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
      canvas.zoomToPoint(new fabric.Point(evt.offsetX, evt.offsetY), zoom);
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
        onMediaSelect={() =>
          setMediaSelector({
            x: window.innerWidth - 700,
            y: 100,
          })
        }
      />

      <AnimatePresence>
        {mediaSelector && (
          <MediaSelector
            position={mediaSelector}
            onSelect={handleMediaSelect}
            onClose={() => setMediaSelector(null)}
          />
        )}
      </AnimatePresence>

      <div className="fixed top-4 right-20 text-[#cccccc]/70 text-xs">
        {others.length} other user{others.length === 1 ? "" : "s"} present
      </div>
    </div>
  );
};

export default OrionFlowEditor;
