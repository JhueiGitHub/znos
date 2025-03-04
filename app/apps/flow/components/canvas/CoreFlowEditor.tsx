import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useOthers } from "@/liveblocks.config";
import { useDesignSystem } from "@/app/contexts/DesignSystemContext";
import { ChromePicker } from "react-color";
import { CoreLeftSidebar } from "./CoreLeftSidebar";
import { CoreEditorSidebar } from "./CoreEditorSidebar";
import { AnimatePresence, motion } from "framer-motion";
import SaveStatusIndicator from "@/app/components/SaveStatusIndicator";
import { debounce } from "lodash";

interface CoreFlowEditorProps {
  flowId: string;
  onClose: () => void;
}

export interface CoreFlowComponent {
  id: string;
  name: string;
  type: "COLOR" | "TYPOGRAPHY";
  value: string | null;
  opacity?: number;
  fontFamily?: string;
  fontWeight?: string;
  mode?: string;
  order: number;
  tokenId?: string;
}

export type ComponentUpdate = Partial<
  Pick<
    CoreFlowComponent,
    "value" | "tokenId" | "opacity" | "fontFamily" | "fontWeight" | "mode"
  >
>;

interface ColorPickerState {
  isOpen: boolean;
  color: string;
  position: { x: number; y: number };
  tokenId: string | null;
}

const CoreFlowEditor = ({ flowId, onClose }: CoreFlowEditorProps) => {
  const others = useOthers();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const queryClient = useQueryClient();
  const { designSystem, isLoading: designSystemLoading } = useDesignSystem();
  const [selectedComponent, setSelectedComponent] =
    useState<CoreFlowComponent | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<
    CoreFlowComponent[]
  >([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);
  const [colorPicker, setColorPicker] = useState<ColorPickerState>({
    isOpen: false,
    color: "",
    position: { x: 0, y: 0 },
    tokenId: null,
  });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [canvasViewState, setCanvasViewState] = useState<{
    zoom: number;
    viewportTransform: number[] | null;
  }>({
    zoom: 1,
    viewportTransform: null,
  });

  // Fetch flow data
  const { data: flow, isLoading: flowLoading } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const response = await axios.get<{
        name: string;
        components: CoreFlowComponent[];
      }>(`/api/flows/${flowId}`);
      return response.data;
    },
  });

  // Component update handler with proper API structure
  const handleComponentUpdate = async (
    ids: string[],
    updates: ComponentUpdate
  ) => {
    try {
      setSaveStatus("saving");

      let updatedComponents: CoreFlowComponent | CoreFlowComponent[];

      // Format updates to match what the API expects
      const apiUpdates = {
        // Standard properties
        value: updates.value,
        tokenId: updates.tokenId,
        // Maintain current mode if it exists, otherwise use 'color' as default
        mode: updates.mode || "color",
        // Include typography-specific properties
        fontFamily: updates.fontFamily,
        fontWeight: updates.fontWeight,
        // Include color-specific properties
        opacity: updates.opacity,
      };

      if (ids.length > 1) {
        // Bulk update
        const response = await axios.patch<CoreFlowComponent[]>(
          `/api/flows/${flowId}/components/bulk`,
          {
            componentIds: ids,
            updates: apiUpdates,
          }
        );
        updatedComponents = response.data;
      } else if (ids.length === 1) {
        // Single update
        const response = await axios.patch<CoreFlowComponent>(
          `/api/flows/${flowId}/components/${ids[0]}`,
          apiUpdates
        );
        updatedComponents = response.data;
      } else {
        throw new Error("No components selected for update");
      }

      // Update flow cache
      queryClient.setQueryData(
        ["flow", flowId],
        (
          oldData: { name: string; components: CoreFlowComponent[] } | undefined
        ) => {
          if (!oldData?.components) return oldData;

          if (Array.isArray(updatedComponents)) {
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

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);

      return updatedComponents;
    } catch (error) {
      console.error("Failed to update component:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      throw error;
    }
  };

  // Handle color click for color picker
  const handleColorClick = (
    color: string,
    tokenId: string,
    clientX: number,
    clientY: number
  ) => {
    setColorPicker({
      isOpen: true,
      color,
      position: { x: clientX, y: clientY },
      tokenId,
    });
  };

  // Handle color change from color picker
  const handleColorChange = async (color: string) => {
    if (!colorPicker.tokenId) return;

    // Update components with this tokenId
    const componentIds = selectedComponents
      .filter((c) => c.tokenId === colorPicker.tokenId)
      .map((c) => c.id);

    if (componentIds.length > 0) {
      await handleComponentUpdate(componentIds, { value: color });
    }

    // Also update the design system color tokens
    if (designSystem) {
      try {
        const updatedTokens = designSystem.colorTokens.map((token) =>
          token.id === colorPicker.tokenId ? { ...token, value: color } : token
        );

        await axios.patch("/api/design-system", {
          ...designSystem,
          colorTokens: updatedTokens,
        });

        // Refetch design system
        queryClient.invalidateQueries({ queryKey: ["design-system"] });
      } catch (error) {
        console.error("Failed to update design system color:", error);
      }
    }
  };

  // Create debounced color change handler using lodash
  const debouncedColorChange = useCallback(
    debounce((color: string) => handleColorChange(color), 300),
    [handleColorChange]
  );

  // Component selection handler
  const handleComponentSelect = (
    componentId: string,
    modifiers: { shift?: boolean; meta?: boolean }
  ) => {
    // Find component in flow components
    let component: CoreFlowComponent | undefined = flow?.components.find(
      (c) => c.id === componentId
    );

    // If not found in flow components, check if it's a design system token
    if (!component && designSystem?.colorTokens) {
      const token = designSystem.colorTokens.find((t) => t.id === componentId);
      if (token) {
        // Create a component-like object from the token
        component = {
          id: token.id,
          name: token.name,
          type: "COLOR",
          value: token.value,
          opacity: token.opacity,
          order: 0,
          tokenId: token.id,
          mode: "color",
        };
      }
    }

    if (!component) return;

    // Clear selection if clicking a different type when something is already selected
    if (
      selectedComponents.length > 0 &&
      selectedComponents[0].type !== component.type &&
      !modifiers.meta &&
      !modifiers.shift
    ) {
      setSelectedComponents([]);
      setLastSelectedId(null);
    }

    let newSelection: CoreFlowComponent[] = [];

    if (modifiers.meta) {
      // Command/Ctrl click: Toggle selection only within same type
      const isSelected = selectedComponents.some((c) => c.id === componentId);
      if (isSelected) {
        newSelection = selectedComponents.filter((c) => c.id !== componentId);
      } else if (
        selectedComponents.length === 0 ||
        selectedComponents[0].type === component.type
      ) {
        newSelection = [...selectedComponents, component];
      } else {
        newSelection = [component]; // Reset selection if different type
      }
    } else if (modifiers.shift && lastSelectedId) {
      // For shift selection, we need combined array of flow components and design system tokens
      let allComponents: CoreFlowComponent[] = [...(flow?.components || [])];

      // Add design system tokens as components if needed
      if (designSystem?.colorTokens) {
        const tokenComponents = designSystem.colorTokens.map((token) => ({
          id: token.id,
          name: token.name,
          type: "COLOR" as const,
          value: token.value,
          opacity: token.opacity,
          order: 0,
          tokenId: token.id,
          mode: "color",
        }));
        allComponents = [...allComponents, ...tokenComponents];
      }

      // Filter to only components of same type
      const typeComponents = allComponents.filter(
        (c) => c.type === component!.type
      );

      const lastIndex = typeComponents.findIndex(
        (c) => c.id === lastSelectedId
      );
      if (lastIndex !== -1) {
        // Only do range select if last selected was same type
        const currentIndex = typeComponents.findIndex(
          (c) => c.id === componentId
        );
        const [start, end] = [
          Math.min(lastIndex, currentIndex),
          Math.max(lastIndex, currentIndex),
        ];
        newSelection = typeComponents.slice(start, end + 1);
      } else {
        newSelection = [component];
      }
    } else {
      // Normal click: Single selection
      newSelection = [component];
    }

    setSelectedComponents(newSelection);
    setLastSelectedId(componentId);
    setSelectedComponent(newSelection[0]); // Always use first component for compatibility

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

  // Keyboard handler effect
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "§") {
        setAreSidebarsVisible((prev) => !prev);
      }

      if (fabricRef.current) {
        // Spacebar temporarily enables panning mode
        if (e.code === "Space" && !e.repeat) {
          fabricRef.current.defaultCursor = "grab";
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (fabricRef.current && e.code === "Space") {
        fabricRef.current.defaultCursor = "default";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onClose]);

  // Canvas setup effect
  useEffect(() => {
    if (
      !canvasRef.current ||
      !designSystem ||
      designSystemLoading ||
      !flow?.components
    )
      return;

    // Create canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#010203",
      selection: false,
    });

    // Set global selection styles
    fabric.Object.prototype.set({
      borderColor: "#4C4F69",
      cornerColor: "#4C4F69",
      cornerStrokeColor: "#4C4F69",
      cornerSize: 6,
      transparentCorners: false,
      cornerStyle: "rect",
    });

    fabricRef.current = canvas;

    // Restore view state if exists
    if (canvasViewState.viewportTransform) {
      canvas.setViewportTransform(canvasViewState.viewportTransform);
      canvas.setZoom(canvasViewState.zoom);
    }

    // Render Design System color tokens
    if (designSystem.colorTokens?.length) {
      const cols = 5;
      const radius = 30;
      const spacing = 100;
      const startX = 100;
      const startY = 100;

      designSystem.colorTokens.forEach((token, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        const centerX = startX + col * spacing;
        const centerY = startY + row * spacing;

        // Create circle for color
        const circle = new fabric.Circle({
          left: centerX - radius,
          top: centerY - radius,
          radius: radius,
          fill: token.value,
          stroke: "#ffffff10",
          strokeWidth: 2,
          selectable: true,
          hasControls: false,
          data: {
            id: token.id,
            name: token.name,
            type: "COLOR",
            value: token.value,
            opacity: token.opacity,
            tokenId: token.id,
            mode: "color",
          },
        });

        // Create name label
        const text = new fabric.Text(token.name, {
          left: centerX,
          top: centerY + radius + 10,
          fontSize: 12,
          fontFamily: "Arial",
          fill: "#cccccc",
          originX: "center",
          textAlign: "center",
          selectable: false,
        });

        // Create hex value label
        const hexText = new fabric.Text(token.value, {
          left: centerX,
          top: centerY + radius + 25,
          fontSize: 10,
          fontFamily: "Arial",
          fill: "#cccccc80",
          originX: "center",
          textAlign: "center",
          selectable: false,
        });

        canvas.add(circle);
        canvas.add(text);
        canvas.add(hexText);
      });

      // Render Typography components if available
      const typoComponents = flow.components.filter(
        (c) => c.type === "TYPOGRAPHY"
      );

      if (typoComponents.length) {
        const typoStartY =
          startY +
          Math.ceil(designSystem.colorTokens.length / cols) * spacing +
          100;

        typoComponents.forEach((comp, index) => {
          const textObj = new fabric.Text(comp.name, {
            left: startX + (index % 2) * 300,
            top: typoStartY + Math.floor(index / 2) * 80,
            fontSize: 20,
            fontFamily: comp.value || "Arial",
            fill: "#cccccc",
            selectable: true,
            data: comp,
          });

          canvas.add(textObj);
        });
      }
    }

    // Setup canvas event handlers
    canvas.on("selection:created", (options) => {
      if (!options.selected) return;

      const selectedObjects = Array.isArray(options.selected)
        ? options.selected
        : [options.selected];
      const selectedComponents = selectedObjects
        .map((obj) => obj.data as CoreFlowComponent)
        .filter(Boolean);

      setSelectedComponents(selectedComponents);
      setSelectedComponent(selectedComponents[0]);
      setLastSelectedId(selectedComponents[0]?.id || null);
    });

    canvas.on("selection:updated", (options) => {
      if (!options.selected) return;

      const selectedObjects = Array.isArray(options.selected)
        ? options.selected
        : [options.selected];
      const selectedComponents = selectedObjects
        .map((obj) => obj.data as CoreFlowComponent)
        .filter(Boolean);

      setSelectedComponents(selectedComponents);
      setSelectedComponent(selectedComponents[0]);
      setLastSelectedId(selectedComponents[0]?.id || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedComponents([]);
      setSelectedComponent(null);
      setLastSelectedId(null);
    });

    // Mouse wheel handler for zooming and panning
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

    // Mouse drag handler for panning
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e as MouseEvent;
      if (
        evt.altKey ||
        evt.button === 1 ||
        (evt.buttons === 1 && evt.getModifierState("Space"))
      ) {
        isPanning = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.defaultCursor = "grabbing";
        canvas.hoverCursor = "grabbing";

        if (opt.target) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isPanning && opt.e) {
        const evt = opt.e as MouseEvent;
        if (canvas.viewportTransform) {
          canvas.viewportTransform[4] += evt.clientX - lastPosX;
          canvas.viewportTransform[5] += evt.clientY - lastPosY;
          canvas.requestRenderAll();
        }
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on("mouse:up", () => {
      isPanning = false;
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "default";
    });

    // Double-click handler for color picker
    canvas.on("mouse:dblclick", (opt) => {
      const target = opt.target;
      if (target && target.data) {
        const evt = opt.e as MouseEvent;
        if (target.data.type === "COLOR") {
          handleColorClick(
            target.data.value,
            target.data.tokenId || target.data.id,
            evt.clientX,
            evt.clientY
          );
        }
      }
    });

    // Window resize handler
    const handleResize = () => {
      if (fabricRef.current) {
        const currentZoom = fabricRef.current.getZoom();
        const currentVPT = fabricRef.current.viewportTransform
          ? [...fabricRef.current.viewportTransform]
          : null;

        fabricRef.current.setDimensions({
          width: window.innerWidth,
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
  }, [flow, designSystem, designSystemLoading, canvasViewState]);

  // Loading state
  if (flowLoading || designSystemLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#010203] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Loading editor...</p>
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Canvas container */}
      <div className="absolute inset-0">
        <canvas ref={canvasRef} />
      </div>

      {/* Overlaying sidebars */}
      <AnimatePresence>
        {areSidebarsVisible && (
          <>
            {/* Left Sidebar */}
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[264px] border-r border-white/[0.09] bg-[#01020387] backdrop-blur-md z-10"
            >
              <CoreLeftSidebar
                flowName={flow?.name || ""}
                isVisible={areSidebarsVisible}
                components={flow?.components || []}
                onComponentSelect={handleComponentSelect}
                selectedComponentIds={selectedComponents.map((c) => c.id)}
              />
            </motion.div>

            {/* Right Sidebar */}
            <motion.div
              initial={{ x: 264 }}
              animate={{ x: 0 }}
              exit={{ x: 264 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] bg-[#010203]/50 backdrop-blur-md z-10"
            >
              <CoreEditorSidebar
                selectedComponents={selectedComponents}
                designSystem={designSystem}
                onUpdateComponent={handleComponentUpdate}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Color picker popup */}
      <AnimatePresence>
        {colorPicker.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50"
            style={{
              left: colorPicker.position.x - 100,
              top: colorPicker.position.y - 50,
            }}
          >
            <div className="p-1 rounded-lg bg-[#000000] border border-[#ffffff10]">
              <ChromePicker
                color={colorPicker.color}
                onChange={(color) => debouncedColorChange(color.hex)}
              />
              <div className="flex justify-between mt-2">
                <button
                  className="px-4 py-1 text-sm rounded bg-[#292929] text-[#cccccc]"
                  onClick={() =>
                    setColorPicker((prev) => ({ ...prev, isOpen: false }))
                  }
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 text-sm rounded bg-[#7B6CBD] text-white"
                  onClick={() =>
                    setColorPicker((prev) => ({ ...prev, isOpen: false }))
                  }
                >
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-right status */}
      <div className="fixed top-4 right-4 flex items-center gap-4 z-20">
        <SaveStatusIndicator status={saveStatus} showText />
        <div className="text-[#cccccc]/70 text-xs">
          {others.length} other user{others.length === 1 ? "" : "s"} present
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-20 text-white/70 hover:text-white z-50"
      >
        ESC
      </button>

      {/* Bottom help text */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-[#cccccc]/50 text-xs">
        Press § to toggle sidebars
      </div>
    </div>
  );
};

export default CoreFlowEditor;
