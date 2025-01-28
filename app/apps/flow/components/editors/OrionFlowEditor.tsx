// OrionFlowEditor.tsx

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
    type: "fill" | "outline";
  } | null>(null);
  const updateOrionConfig = useAppStore((state) => state.setOrionConfig);
  const currentStoreConfig = useAppStore((state) => state.orionConfig);
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);
  const [macOSIconSelector, setMacOSIconSelector] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<
    OrionFlowComponent[]
  >([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

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
    gcTime: 30 * 60 * 1000,
  });

  // Effect to sync flow components with app store
  // Effect to sync flow components with app store
  useEffect(() => {
    if (!flow?.components) return;

    const dockIcons = flow.components
      .filter((c) => c.type === "DOCK_ICON")
      .sort((a, b) => a.order - b.order)
      .map((icon) => ({
        id: icon.id,
        name: icon.name,
        mode: icon.mode,
        value: icon.value,
        tokenId: icon.tokenId,
        mediaId: icon.mediaId,
        order: icon.order,
        outlineMode: icon.outlineMode || "color",
        outlineValue: icon.outlineValue,
        outlineTokenId: icon.outlineTokenId,
      }));

    // Add cursor sync
    const cursor = flow.components
      .filter((c) => c.type === "CURSOR")
      .map((cursor) => ({
        id: cursor.id,
        name: cursor.name,
        mode: "color", // Cursor only supports color mode
        tokenId: cursor.tokenId,
        outlineTokenId: cursor.outlineTokenId,
      }))[0]; // Take first cursor component

    if (dockIcons.length > 0 || cursor) {
      queryClient.setQueryData(
        ["orion-config"],
        (oldConfig: typeof currentStoreConfig) => ({
          ...oldConfig,
          dockIcons,
          cursor, // Add cursor to config
        })
      );
    }
  }, [flow?.components, queryClient]);

  const handleMediaSelect = async (
    mediaItem: MediaItem,
    type: "fill" | "outline" = "fill"
  ) => {
    if (selectedComponents.length === 0) return;

    // Update canvas immediately for all selected components
    if (fabricRef.current) {
      selectedComponents.forEach((component) => {
        const objectToUpdate = fabricRef
          .current!.getObjects()
          .find((obj) => obj.data?.id === component.id);

        if (objectToUpdate) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const pattern = new fabric.Pattern({
              source: img,
              repeat: "no-repeat",
            });
            if (type === "outline") {
              objectToUpdate.set({
                stroke: pattern as any,
                strokeWidth: 2,
              });
            } else {
              objectToUpdate.set("fill", pattern);
            }
            fabricRef.current?.renderAll();
          };
          img.src = mediaItem.url;
        }
      });
    }

    // Create appropriate updates based on type
    const updates: ComponentUpdate =
      type === "outline"
        ? {
            outlineMode: "media",
            outlineValue: mediaItem.url,
            outlineTokenId: undefined,
          }
        : {
            mode: "media",
            value: mediaItem.url,
            mediaId: mediaItem.id,
            tokenId: undefined,
          };

    // Update flow cache directly for all selected components
    queryClient.setQueryData(
      ["flow", flowId],
      (oldData: { components: OrionFlowComponent[] } | undefined) => {
        if (!oldData?.components) return oldData;
        return {
          ...oldData,
          components: oldData.components.map((component) =>
            selectedComponents.some((selected) => selected.id === component.id)
              ? { ...component, ...updates }
              : component
          ),
        };
      }
    );

    // Update all components in backend
    const componentIds = selectedComponents.map((c) => c.id);
    await handleComponentUpdate(componentIds, updates);
    setMediaSelector(null);
  };

  const handleMacOSIconSelect = async (iconUrl: string) => {
    if (selectedComponents.length === 0) return;

    // Update canvas immediately for all selected components
    if (fabricRef.current) {
      selectedComponents.forEach((component) => {
        const obj = fabricRef
          .current!.getObjects()
          .find((obj) => obj.data?.id === component.id);
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
      });
    }

    const updates: ComponentUpdate = {
      mode: "media",
      value: iconUrl,
      mediaId: undefined,
      tokenId: undefined,
    };

    // Update flow cache directly for all selected components
    queryClient.setQueryData(
      ["flow", flowId],
      (oldData: { components: OrionFlowComponent[] } | undefined) => {
        if (!oldData?.components) return oldData;
        return {
          ...oldData,
          components: oldData.components.map((component) =>
            selectedComponents.some((selected) => selected.id === component.id)
              ? { ...component, ...updates }
              : component
          ),
        };
      }
    );

    // Update all components in backend
    const componentIds = selectedComponents.map((c) => c.id);
    await handleComponentUpdate(componentIds, updates);
    setMacOSIconSelector(null);
  };

  const { handleComponentUpdate, saveStatus } = useAutosave({
    onSave: async (ids: string | string[], updates: ComponentUpdate) => {
      if (Array.isArray(ids)) {
        // Bulk update
        const response = await axios.patch<OrionFlowComponent[]>(
          `/api/flows/${flowId}/components/bulk`,
          { componentIds: ids, updates }
        );
        return response.data;
      } else {
        // Single update (backward compatibility)
        const response = await axios.patch<OrionFlowComponent>(
          `/api/flows/${flowId}/components/${ids}`,
          updates
        );
        return response.data;
      }
    },
    onSuccess: (
      updatedComponents: OrionFlowComponent | OrionFlowComponent[]
    ) => {
      // Update flow cache directly
      queryClient.setQueryData(
        ["flow", flowId],
        (oldData: { components: OrionFlowComponent[] } | undefined) => {
          if (!oldData?.components) return oldData;
          if (Array.isArray(updatedComponents)) {
            // Handle bulk updates
            return {
              ...oldData,
              components: oldData.components.map((component) => {
                const updatedComponent = updatedComponents.find(
                  (uc) => uc.id === component.id
                );
                return updatedComponent
                  ? { ...component, ...updatedComponent }
                  : component;
              }),
            };
          } else {
            // Handle single update
            return {
              ...oldData,
              components: oldData.components.map((component) =>
                component.id === updatedComponents.id
                  ? { ...component, ...updatedComponents }
                  : component
              ),
            };
          }
        }
      );
    },
    onError: (error) => {
      console.error("Failed to update component:", error);
    },
  });

  const handleComponentSelect = (
    componentId: string,
    modifiers: { shift?: boolean; meta?: boolean }
  ) => {
    const component = flow?.components.find((c) => c.id === componentId);
    if (!component) return;

    let newSelection: OrionFlowComponent[] = [];

    if (modifiers.meta) {
      // Command/Ctrl click: Toggle selection
      const isSelected = selectedComponents.some((c) => c.id === componentId);
      if (isSelected) {
        newSelection = selectedComponents.filter((c) => c.id !== componentId);
      } else {
        newSelection = [...selectedComponents, component];
      }
    } else if (modifiers.shift && lastSelectedId && flow?.components) {
      // Shift click: Select range
      const dockIcons = flow.components.filter((c) => c.type === "DOCK_ICON");
      const lastIndex = dockIcons.findIndex((c) => c.id === lastSelectedId);
      const currentIndex = dockIcons.findIndex((c) => c.id === componentId);
      const [start, end] = [
        Math.min(lastIndex, currentIndex),
        Math.max(lastIndex, currentIndex),
      ];
      newSelection = dockIcons.slice(start, end + 1);
    } else {
      // Normal click: Single selection
      newSelection = [component];
    }

    setSelectedComponents(newSelection);
    setLastSelectedId(componentId);
    setSelectedComponent(component); // Keep for backward compatibility

    // Update canvas selection
    if (fabricRef.current) {
      fabricRef.current.discardActiveObject();
      const objects = fabricRef.current
        .getObjects()
        .filter((obj) => newSelection.some((c) => c.id === obj.data?.id));

      if (objects.length > 1) {
        const selection = new fabric.ActiveSelection(objects, {
          canvas: fabricRef.current,
        });
        fabricRef.current.setActiveObject(selection);
      } else if (objects.length === 1) {
        fabricRef.current.setActiveObject(objects[0]);
      }
      fabricRef.current.requestRenderAll();
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

    const getTokenColor = (tokenId: string | null): string => {
      if (!tokenId || !designSystem.colorTokens) return "#000000";
      const token = designSystem.colorTokens.find((t) => t.name === tokenId);
      return token?.value || "#000000";
    };

    const initializeComponent = (
      component: OrionFlowComponent,
      index: number
    ) => {
      const radius = 40;
      const baseCircleProps = {
        left: 100 + index * 120,
        top: 100,
        radius,
        stroke: "#ffffff10",
        strokeWidth: 2,
        selectable: true,
        data: component,
        objectCaching: true,
        statefullCache: true,
      };

      let fabricObject;

      if (component.type === "CURSOR") {
        // Create cursor visualization using circle with special styling
        fabricObject = new fabric.Circle({
          ...baseCircleProps,
          fill: getTokenColor(component.tokenId || null),
          stroke: getTokenColor(component.outlineTokenId || null),
          strokeWidth: 3,
        });
      } else {
        // Standard circle for other components
        fabricObject = new fabric.Circle({
          ...baseCircleProps,
          fill:
            component.mode === "media" && component.value
              ? "rgba(0,0,0,0)"
              : getTokenColor(component.tokenId || null),
        });
      }

      canvas.add(fabricObject);

      // Handle media loading for non-cursor components
      if (
        component.type !== "CURSOR" &&
        component.mode === "media" &&
        component.value
      ) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const imgRatio = img.width / img.height;
          let scale: number;
          let offsetX: number;
          let offsetY: number;

          if (imgRatio > 1) {
            scale = (radius * 2) / img.height;
            offsetX = -(img.width * scale - radius * 2) / 2;
            offsetY = 0;
          } else {
            scale = (radius * 2) / img.width;
            offsetX = 0;
            offsetY = -(img.height * scale - radius * 2) / 2;
          }

          const pattern = new fabric.Pattern({
            source: img,
            repeat: "no-repeat",
            patternTransform: [scale, 0, 0, scale, offsetX, offsetY],
          });

          fabricObject.set({
            fill: pattern,
            dirty: true,
          });

          canvas.requestRenderAll();
        };
        img.src = component.value;
      }
    };

    flow.components.forEach((component: OrionFlowComponent, index: number) => {
      initializeComponent(component, index);
    });

    canvas.on("selection:created", (options) => {
      const selectedObject = options.selected?.[0];
      if (selectedObject && selectedObject.data) {
        setSelectedComponent(selectedObject.data as OrionFlowComponent);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedComponent(null);
    });

    canvas.on("mouse:wheel", (opt) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY;
        let zoom = canvas.getZoom();
        zoom = zoom * 0.999 ** delta;
        zoom = Math.min(Math.max(0.1, zoom), 20);
        const point = new fabric.Point(e.offsetX, e.offsetY);
        canvas.zoomToPoint(point, zoom);
      } else {
        if (canvas.viewportTransform) {
          canvas.viewportTransform[4] -= e.deltaX;
          canvas.viewportTransform[5] -= e.deltaY;
        }
        ``;
      }

      canvas.requestRenderAll();

      if (fabricRef.current) {
        setCanvasViewState({
          zoom: fabricRef.current.getZoom(),
          viewportTransform: fabricRef.current.viewportTransform
            ? [...fabricRef.current.viewportTransform]
            : null,
        });
      }
    });

    const handleResize = () => {
      if (fabricRef.current) {
        const currentZoom = fabricRef.current.getZoom();
        const currentVPT = fabricRef.current.viewportTransform
          ? [...fabricRef.current.viewportTransform]
          : null;

        fabricRef.current.setDimensions({
          width: window.innerWidth - (areSidebarsVisible ? 560 : 0),
          height: window.innerHeight,
        });

        if (currentVPT) {
          fabricRef.current.setViewportTransform(currentVPT);
          fabricRef.current.setZoom(currentZoom);
        }

        fabricRef.current.requestRenderAll();
      }
    };

    window.addEventListener("resize", handleResize);
    canvas.renderAll();

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, flow, designSystem, areSidebarsVisible, canvasViewState]);

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
              selectedComponentIds={selectedComponents.map((c) => c.id)}
            />
            <motion.div
              initial={{ x: 264 }}
              animate={{ x: 0 }}
              exit={{ x: 264 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] bg-black/30 backdrop-blur-sm z-10"
            >
              <OrionEditorSidebar
                selectedComponents={selectedComponents}
                designSystem={designSystem}
                onUpdateComponent={(ids, updates) =>
                  handleComponentUpdate(ids, updates)
                }
                onMediaSelect={(type) =>
                  setMediaSelector({
                    x: window.innerWidth - 700,
                    y: 100,
                    type: type || "fill",
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
            onSelect={(mediaItem) =>
              handleMediaSelect(mediaItem, mediaSelector.type)
            }
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
