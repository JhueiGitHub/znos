import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useOthers } from "@/liveblocks.config";
import { useDesignSystem } from "@/app/contexts/DesignSystemContext";
import { OrionFlowComponent, ComponentUpdate } from "./orion-flow-types";
import OrionEditorSidebar from "./OrionEditorSidebar";
import { OrionLeftSidebar } from "./OrionLeftSidebar";
import { MediaSelector } from "./MediaSelector";
import { useAppStore } from "@/app/store/appStore";
import { AnimatePresence, motion } from "framer-motion";
import { MediaItem } from "@prisma/client";
import { useStyles } from "@os/hooks/useStyles";
import { useAutosave } from "@/app/hooks/useDebounce";
import SaveStatusIndicator from "@/app/components/SaveStatusIndicator";
import { MacOSIconsSelector } from "./MacOSIconsSelector";

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
  const [mediaSelector, setMediaSelector] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const updateOrionConfig = useAppStore((state) => state.setOrionConfig);
  const currentStoreConfig = useAppStore((state) => state.orionConfig);
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);
  const [macOSIconSelector, setMacOSIconSelector] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const handleMacOSIconClose = () => setMacOSIconSelector(null);

  // Simplified handler to match MacOSIconsSelector's onSelect type
  const handleMacOSIconSelect = async (iconUrl: string) => {
    if (!selectedComponent) return;

    // Create component update
    const updates: ComponentUpdate = {
      mode: "media" as const,
      value: iconUrl,
      mediaId: undefined,
      tokenId: undefined,
    };

    // Update local state immediately for UI feedback
    const updatedComponent = {
      ...selectedComponent,
      ...updates,
    };

    // Update dock icons if it's a dock icon
    if (
      selectedComponent.type === "DOCK_ICON" &&
      currentStoreConfig?.dockIcons
    ) {
      const updatedDockIcons = currentStoreConfig.dockIcons.map((icon) =>
        icon.id === selectedComponent.id ? updatedComponent : icon
      );

      // Update orion config
      updateOrionConfig({
        ...currentStoreConfig,
        dockIcons: updatedDockIcons,
      });
    }

    // Update canvas with direct image loading
    if (fabricRef.current) {
      const obj = fabricRef.current
        .getObjects()
        .find((obj) => obj.data?.id === selectedComponent.id);
      if (obj) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = iconUrl;
        img.onload = () => {
          const pattern = new fabric.Pattern({
            source: img,
            repeat: "no-repeat",
          });
          obj.set("fill", pattern);
          fabricRef.current?.renderAll();
        };
      }
    }

    // Update component
    await handleComponentUpdate(selectedComponent.id, updates);

    // Clean up
    setMacOSIconSelector(null);

    // Force UI updates
    queryClient.invalidateQueries(["orion-config"]);
  };

  // Add state for canvas view
  const [canvasViewState, setCanvasViewState] = useState<{
    zoom: number;
    viewportTransform: number[] | null;
  }>({
    zoom: 1,
    viewportTransform: null,
  });

  const { data: flow } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const response = await axios.get<{
        name: string;
        components: OrionFlowComponent[];
      }>(`/api/flows/${flowId}`);
      return response.data;
    },
    staleTime: Infinity,
    cacheTime: 30 * 60 * 1000,
  });

  const { handleComponentUpdate, saveStatus } = useAutosave({
    onSave: async (id: string, updates: ComponentUpdate) => {
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

      if (updatedComponent.type === "DOCK_ICON" && currentStoreConfig) {
        const updatedConfig = {
          ...currentStoreConfig,
          dockIcons: currentStoreConfig.dockIcons?.map((icon) =>
            icon.id === updatedComponent.id
              ? {
                  ...icon,
                  mode: updatedComponent.mode,
                  value: updatedComponent.value,
                  mediaId: updatedComponent.mediaId,
                  tokenId: updatedComponent.tokenId,
                }
              : icon
          ),
        };
        queryClient.setQueryData(["orion-config"], updatedConfig);
      }
    },
    onError: (error) => {
      console.error("Failed to update component:", error);
      queryClient.invalidateQueries(["flow", flowId]);
      queryClient.invalidateQueries(["orion-config"]);
    },
  });

  const handleMediaSelect = async (mediaItem: MediaItem) => {
    if (!selectedComponent) return;

    const updates: ComponentUpdate = {
      mode: "media",
      value: mediaItem.url,
      mediaId: mediaItem.id,
      tokenId: undefined,
    };

    if (selectedComponent.type === "DOCK_ICON" && currentStoreConfig) {
      updateOrionConfig({
        ...currentStoreConfig,
        dockIcons: currentStoreConfig.dockIcons?.map((icon) =>
          icon.id === selectedComponent.id ? { ...icon, ...updates } : icon
        ),
      });

      const currentQueryConfig = queryClient.getQueryData<{
        wallpaper?: any;
        dockIcons?: Array<any>;
      }>(["orion-config"]);

      if (currentQueryConfig) {
        queryClient.setQueryData(["orion-config"], {
          ...currentQueryConfig,
          dockIcons: currentQueryConfig.dockIcons?.map((icon) =>
            icon.id === selectedComponent.id ? { ...icon, ...updates } : icon
          ),
        });
      }

      queryClient.setQueryData<Array<any>>(["dock-icons-config"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((icon) =>
          icon.id === selectedComponent.id ? { ...icon, ...updates } : icon
        );
      });

      queryClient.invalidateQueries(["dock-icons-config"]);
      queryClient.invalidateQueries(["orion-config"]);
    }

    if (fabricRef.current) {
      const objectToUpdate = fabricRef.current
        .getObjects()
        .find((obj) => obj.data?.id === selectedComponent.id);

      if (objectToUpdate) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const pattern = new fabric.Pattern({
            source: img,
            repeat: "no-repeat",
          });
          objectToUpdate.set("fill", pattern);
          fabricRef.current?.renderAll();
        };
        img.src = mediaItem.url;
      }
    }

    handleComponentUpdate(selectedComponent.id, updates);
    setMediaSelector(null);
  };

  const handleComponentSelect = (componentId: string) => {
    const component =
      flow?.components.find((c) => c.id === componentId) || null;
    setSelectedComponent(component);

    if (fabricRef.current) {
      const canvasObject = fabricRef.current
        .getObjects()
        .find((obj) => obj.data?.id === componentId);

      if (canvasObject) {
        fabricRef.current.setActiveObject(canvasObject);
        fabricRef.current.renderAll();
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "§") {
        setAreSidebarsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !flow?.components || !designSystem) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - (areSidebarsVisible ? 560 : 0),
      height: window.innerHeight,
      backgroundColor: "#010203",
      selection: false,
    });

    fabricRef.current = canvas;

    // Restore previous view state if it exists
    if (canvasViewState.viewportTransform) {
      canvas.setViewportTransform(canvasViewState.viewportTransform);
      canvas.setZoom(canvasViewState.zoom);
    }

    // Initialize components on canvas
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

      // Handle media initialization
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

    // Initialize all components
    flow.components.forEach((component: OrionFlowComponent, index: number) => {
      initializeComponent(component, index);
    });

    // Handle component selection
    canvas.on("selection:created", (options) => {
      const selectedObject = options.selected?.[0];
      if (selectedObject && selectedObject.data) {
        setSelectedComponent(selectedObject.data as OrionFlowComponent);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedComponent(null);
    });

    // Handle trackpad gestures for pan and zoom
    canvas.on("mouse:wheel", (opt) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Handle zooming with Cmd/Ctrl + trackpad gesture
        const delta = e.deltaY;
        let zoom = canvas.getZoom();
        zoom = zoom * 0.999 ** delta;
        zoom = Math.min(Math.max(0.1, zoom), 20);
        const point = new fabric.Point(e.offsetX, e.offsetY);
        canvas.zoomToPoint(point, zoom);
      } else {
        // Handle two-finger trackpad panning
        if (canvas.viewportTransform) {
          canvas.viewportTransform[4] -= e.deltaX;
          canvas.viewportTransform[5] -= e.deltaY;
        }
      }

      canvas.requestRenderAll();

      // Update view state after transformation
      if (fabricRef.current) {
        setCanvasViewState({
          zoom: fabricRef.current.getZoom(),
          viewportTransform: fabricRef.current.viewportTransform
            ? [...fabricRef.current.viewportTransform]
            : null,
        });
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (fabricRef.current) {
        // Store current view state
        const currentZoom = fabricRef.current.getZoom();
        const currentVPT = fabricRef.current.viewportTransform
          ? [...fabricRef.current.viewportTransform]
          : null;

        // Update dimensions
        fabricRef.current.setDimensions({
          width: window.innerWidth - (areSidebarsVisible ? 560 : 0),
          height: window.innerHeight,
        });

        // Restore view state
        if (currentVPT) {
          fabricRef.current.setViewportTransform(currentVPT);
          fabricRef.current.setZoom(currentZoom);
        }

        fabricRef.current.requestRenderAll();
      }
    };

    // Add event listeners
    window.addEventListener("resize", handleResize);

    // Render initial state
    canvas.renderAll();

    // Cleanup
    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, flow, designSystem, areSidebarsVisible, canvasViewState]);

  // Rest of the component remains unchanged
  return (
    <div className="h-full w-full bg-[#010203] relative">
      <AnimatePresence>
        {areSidebarsVisible && (
          <>
            <OrionLeftSidebar
              flowName={flow?.name || ""}
              isVisible={areSidebarsVisible}
              components={flow?.components || []}
              onComponentSelect={handleComponentSelect}
              selectedComponentId={selectedComponent?.id}
            />
            <motion.div
              initial={{ x: 264 }}
              animate={{ x: 0 }}
              exit={{ x: 264 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] bg-black/30 backdrop-blur-sm z-10"
            >
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
                onMacOSIconSelect={() =>
                  setMacOSIconSelector({
                    x: window.innerWidth - 700,
                    y: 100,
                  })
                }
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Canvas Container */}
      <div
        className="absolute inset-0"
        style={{
          marginLeft: areSidebarsVisible ? "264px" : "0",
          marginRight: areSidebarsVisible ? "264px" : "0",
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      <AnimatePresence>
        {mediaSelector && (
          <MediaSelector
            position={mediaSelector}
            onSelect={handleMediaSelect}
            onClose={() => setMediaSelector(null)}
          />
        )}
      </AnimatePresence>

      <div className="fixed top-4 right-4 flex items-center gap-4 z-20">
        <SaveStatusIndicator status={saveStatus} />
        <div className="text-[#cccccc]/70 text-xs">
          {others.length} other user{others.length === 1 ? "" : "s"} present
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#cccccc]/50 text-xs">
        Press § to toggle sidebars
      </div>

      <AnimatePresence>
        {macOSIconSelector && (
          <MacOSIconsSelector
            position={macOSIconSelector}
            onSelect={handleMacOSIconSelect}
            onClose={() => setMacOSIconSelector(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrionFlowEditor;
