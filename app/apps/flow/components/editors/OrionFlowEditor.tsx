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
import { useAutosave } from "@/app/hooks/useDebounce";
import SaveStatusIndicator from "@/app/components/SaveStatusIndicator";

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
            {mediaItems?.map((item: MediaItem) => (
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
      const response = await axios.get<{ components: OrionFlowComponent[] }>(
        `/api/flows/${flowId}`
      );
      return response.data;
    },
    staleTime: Infinity,
    cacheTime: 30 * 60 * 1000,
  });

  const { handleComponentUpdate, saveStatus } = useAutosave({
    onSave: async (id: string, updates: Partial<OrionFlowComponent>) => {
      const response = await axios.patch<OrionFlowComponent>(
        `/api/flows/${flowId}/components/${id}`,
        updates
      );
      return response.data;
    },
    onSuccess: (updatedComponent: OrionFlowComponent) => {
      queryClient.setQueryData(
        ["flow", flowId],
        (oldData: { components: OrionFlowComponent[] } | undefined) => {
          if (!oldData?.components) return oldData;
          return {
            ...oldData,
            components: oldData.components.map((component) =>
              component.id === updatedComponent.id
                ? { ...component, ...updatedComponent }
                : component
            ),
          };
        }
      );

      if (updatedComponent.type === "WALLPAPER") {
        const currentConfig = queryClient.getQueryData<{
          wallpaper?: {
            mode?: string;
            value?: string | null;
            tokenId?: string;
          };
          dockIcons?: any[];
        }>(["orion-config"]) || { wallpaper: {}, dockIcons: [] };

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
          dockIcons: currentConfig.dockIcons || [],
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
    } as Partial<OrionFlowComponent>);
    setMediaSelector(null);
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
            : getTokenColor(component.tokenId || null),
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

    // Handle trackpad gestures
    canvas.on("mouse:wheel", (opt) => {
      const e = opt.e as WheelEvent;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        let zoom = canvas.getZoom();
        zoom = zoom * 0.999 ** delta;
        zoom = Math.min(Math.max(0.1, zoom), 20);
        canvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
      } else {
        if (canvas.viewportTransform) {
          canvas.viewportTransform[4] -= e.deltaX;
          canvas.viewportTransform[5] -= e.deltaY;
          canvas.requestRenderAll();
        }
      }
    });

    let isPanning = false;
    let lastClientX = 0;
    let lastClientY = 0;
    let isSpacebarPressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        isSpacebarPressed = true;
        if (fabricRef.current) {
          fabricRef.current.defaultCursor = "grab";
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        isSpacebarPressed = false;
        isPanning = false;
        if (fabricRef.current) {
          fabricRef.current.defaultCursor = "default";
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isSpacebarPressed) {
        isPanning = true;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        if (fabricRef.current) {
          fabricRef.current.defaultCursor = "grabbing";
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;

      const deltaX = e.clientX - lastClientX;
      const deltaY = e.clientY - lastClientY;

      if (fabricRef.current?.viewportTransform) {
        fabricRef.current.viewportTransform[4] += deltaX;
        fabricRef.current.viewportTransform[5] += deltaY;
        fabricRef.current.requestRenderAll();
      }

      lastClientX = e.clientX;
      lastClientY = e.clientY;
    };

    const handleMouseUp = () => {
      isPanning = false;
      if (fabricRef.current) {
        fabricRef.current.defaultCursor = isSpacebarPressed
          ? "grab"
          : "default";
      }
    };

    // Handle resize
    const handleResize = () => {
      if (fabricRef.current) {
        const currentVPT = fabricRef.current.viewportTransform
          ? [...fabricRef.current.viewportTransform]
          : undefined;
        const currentZoom = fabricRef.current.getZoom();

        fabricRef.current.setDimensions({
          width: window.innerWidth - 560,
          height: window.innerHeight,
        });

        if (currentVPT) {
          fabricRef.current.setViewportTransform(currentVPT);
          fabricRef.current.setZoom(currentZoom);
        }

        fabricRef.current.requestRenderAll();
      }
    };

    canvas.on("selection:created", (options) => {
      const selectedObject = options.selected?.[0];
      if (selectedObject && selectedObject.data) {
        setSelectedComponent(selectedObject.data as OrionFlowComponent);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedComponent(null);
    });

    const canvasElement = canvasRef.current;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvasElement.addEventListener("mousedown", handleMouseDown);
    canvasElement.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mouseup", handleMouseUp);
    canvasElement.addEventListener("mouseleave", handleMouseUp);
    window.addEventListener("resize", handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvasElement.removeEventListener("mousedown", handleMouseDown);
      canvasElement.removeEventListener("mousemove", handleMouseMove);
      canvasElement.removeEventListener("mouseup", handleMouseUp);
      canvasElement.removeEventListener("mouseleave", handleMouseUp);
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

      <div className="fixed top-4 right-4 flex items-center gap-4">
        <SaveStatusIndicator status={saveStatus} />
        <div className="text-[#cccccc]/70 text-xs">
          {others.length} other user{others.length === 1 ? "" : "s"} present
        </div>
      </div>
    </div>
  );
};
export default OrionFlowEditor;
