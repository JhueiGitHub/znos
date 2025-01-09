"use client";

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

  const handleMacOSIconSelect = async (iconUrl: string) => {
    if (!selectedComponent) return;

    // Update canvas immediately
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

    const updates: ComponentUpdate = {
      mode: "media" as const,
      value: iconUrl,
      mediaId: undefined,
      tokenId: undefined,
    };

    // Update local state and cache
    if (
      selectedComponent.type === "DOCK_ICON" &&
      currentStoreConfig?.dockIcons
    ) {
      const updatedDockIcons = currentStoreConfig.dockIcons.map((icon) =>
        icon.id === selectedComponent.id ? { ...icon, ...updates } : icon
      );

      const updatedConfig = {
        ...currentStoreConfig,
        dockIcons: updatedDockIcons,
      };

      // Update cache directly
      queryClient.setQueryData(["orion-config"], updatedConfig);

      // Update store
      updateOrionConfig(updatedConfig);
    }

    // Update component in backend
    await handleComponentUpdate(selectedComponent.id, updates);
    setMacOSIconSelector(null);
  };

  const handleMediaSelect = async (mediaItem: MediaItem) => {
    if (!selectedComponent) return;

    // Update canvas immediately
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

    const updates: ComponentUpdate = {
      mode: "media",
      value: mediaItem.url,
      mediaId: mediaItem.id,
      tokenId: undefined,
    };

    // Update local state and cache
    if (selectedComponent.type === "DOCK_ICON" && currentStoreConfig) {
      const updatedDockIcons = currentStoreConfig.dockIcons?.map((icon) =>
        icon.id === selectedComponent.id ? { ...icon, ...updates } : icon
      );

      const updatedConfig = {
        ...currentStoreConfig,
        dockIcons: updatedDockIcons,
      };

      // Update cache directly
      queryClient.setQueryData(["orion-config"], updatedConfig);
      queryClient.setQueryData(["dock-icons-config"], updatedDockIcons);

      // Update store
      updateOrionConfig(updatedConfig);
    }

    // Update component in backend
    await handleComponentUpdate(selectedComponent.id, updates);
    setMediaSelector(null);
  };

  const { handleComponentUpdate, saveStatus } = useAutosave({
    onSave: async (id: string, updates: ComponentUpdate) => {
      const response = await axios.patch<OrionFlowComponent>(
        `/api/flows/${flowId}/components/${id}`,
        updates
      );
      return response.data;
    },
    onSuccess: (updatedComponent: OrionFlowComponent) => {
      // Update flow cache directly
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

      // Update orion config if needed
      if (updatedComponent.type === "DOCK_ICON" && currentStoreConfig) {
        const updatedDockIcons = currentStoreConfig.dockIcons?.map((icon) =>
          icon.id === updatedComponent.id
            ? {
                ...icon,
                mode: updatedComponent.mode,
                value: updatedComponent.value,
                mediaId: updatedComponent.mediaId,
                tokenId: updatedComponent.tokenId,
              }
            : icon
        );

        const updatedConfig = {
          ...currentStoreConfig,
          dockIcons: updatedDockIcons,
        };

        // Update cache directly
        queryClient.setQueryData(["orion-config"], updatedConfig);
      }
    },
    onError: (error) => {
      console.error("Failed to update component:", error);
    },
  });

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

    const getTokenColor = (tokenId: string | null): string => {
      if (!tokenId || !designSystem.colorTokens) return "#000000";
      const token = designSystem.colorTokens.find((t) => t.name === tokenId);
      return token?.value || "#000000";
    };

    // EVOLVED: Type-safe pattern creation for video and images
    const createVideoPattern = (
      video: HTMLVideoElement,
      circle: fabric.Circle
    ) => {
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d")!;
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      const pattern = new fabric.Pattern({
        source: tempCanvas.toDataURL(),
        repeat: "no-repeat",
        crossOrigin: "anonymous",
      });

      circle.set({ fill: pattern, dirty: true });
      return { tempCanvas, pattern };
    };

    // EVOLVED: Separate image pattern creation for type safety
    const createImagePattern = (
      img: HTMLImageElement,
      circle: fabric.Circle,
      padding: number = 15
    ) => {
      const maxSize = circle.radius! * 2 - padding * 2;
      const scaleX = maxSize / img.width;
      const scaleY = maxSize / img.height;
      const scale = Math.min(scaleX, scaleY);

      const pattern = new fabric.Pattern({
        source: img,
        repeat: "no-repeat",
        offsetX: circle.radius!,
        offsetY: circle.radius!,
        patternTransform: [scale, 0, 0, scale, -maxSize / 2, -maxSize / 2],
      });

      circle.set({ fill: pattern, dirty: true });
      return pattern;
    };

    // EVOLVED: Modified component initialization with fixed pattern handling
    const initializeComponent = (
      component: OrionFlowComponent,
      index: number
    ) => {
      // EVOLVED: Pattern cache reference
      const patternCache = new Map();

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
          component.mode === "media"
            ? "rgba(0,0,0,0)"
            : getTokenColor(component.tokenId || null),
      });

      // EVOLVED: Cache the circle reference
      if (circle.cacheProperties) {
        circle.cacheProperties = circle.cacheProperties.concat([
          "fill",
          "dirty",
        ]);
      } else {
        circle.cacheProperties = ["fill", "dirty"];
      }
      circle.objectCaching = true;

      canvas.add(circle);

      if (component.mode === "media" && component.value) {
        if (component.type === "DOCK_ICON") {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = component.value;

          img.onload = () => {
            // EVOLVED: Create and cache pattern
            const maxSize = circle.radius! * 2 - 30; // 15px padding on each side
            const scaleX = maxSize / img.width;
            const scaleY = maxSize / img.height;
            const scale = Math.min(scaleX, scaleY);

            const pattern = new fabric.Pattern({
              source: img,
              repeat: "no-repeat",
              crossOrigin: "anonymous",
              offsetX: circle.radius!,
              offsetY: circle.radius!,
              patternTransform: [
                scale,
                0,
                0,
                scale,
                -maxSize / 2,
                -maxSize / 2,
              ],
            });

            // EVOLVED: Cache the pattern
            patternCache.set(component.id, {
              pattern,
              image: img,
              scale,
              maxSize,
            });

            // Set initial fill
            circle.set({
              fill: pattern,
              dirty: true,
              data: { ...circle.data, cacheKey: component.id },
            });

            // EVOLVED: Ensure pattern stays stable during pan/zoom
            circle.on("moving", () => {
              const cached = patternCache.get(component.id);
              if (cached) {
                circle.set("fill", cached.pattern);
              }
            });

            circle.on("scaling", () => {
              const cached = patternCache.get(component.id);
              if (cached) {
                circle.set("fill", cached.pattern);
              }
            });

            canvas.requestRenderAll();
          };

          img.onerror = () => {
            console.error(`Failed to load dock icon: ${component.value}`);
            circle.set("fill", getTokenColor(component.tokenId || null));
            canvas.requestRenderAll();
          };
        } else if (component.type === "WALLPAPER") {
          const video = document.createElement("video");
          video.crossOrigin = "anonymous";
          video.src = component.value;
          video.muted = true;
          video.loop = true;
          video.autoplay = true;

          // EVOLVED: Create a persisted canvas for video frames
          const videoCanvas = document.createElement("canvas");
          const videoCtx = videoCanvas.getContext("2d")!;

          video.oncanplay = () => {
            videoCanvas.width = video.videoWidth;
            videoCanvas.height = video.videoHeight;

            // Initial frame render
            videoCtx.drawImage(
              video,
              0,
              0,
              video.videoWidth,
              video.videoHeight
            );

            // Create initial pattern with the first frame
            const pattern = new fabric.Pattern({
              source: videoCanvas.toDataURL("image/png"), // Convert canvas to data URL
              repeat: "no-repeat",
            });

            circle.set({ fill: pattern, dirty: true });

            // EVOLVED: More efficient video frame updates using requestAnimationFrame
            let frameId: number;
            const updateVideoFrame = () => {
              videoCtx.drawImage(
                video,
                0,
                0,
                video.videoWidth,
                video.videoHeight
              );
              // Update pattern with new frame
              pattern.source = videoCanvas.toDataURL("image/png");
              circle.dirty = true;
              canvas.requestRenderAll();
              frameId = requestAnimationFrame(updateVideoFrame);
            };

            video
              .play()
              .then(() => {
                frameId = requestAnimationFrame(updateVideoFrame);
              })
              .catch(console.error);

            // EVOLVED: Cleanup on circle removal
            circle.on("removed", () => {
              cancelAnimationFrame(frameId);
              video.pause();
              video.remove();
            });
          };

          video.onerror = () => {
            console.error(`Failed to load wallpaper video: ${component.value}`);
            circle.set("fill", getTokenColor(component.tokenId || null));
            canvas.requestRenderAll();
          };
        }
      }

      // EVOLVED: Better pattern stability during modifications
      circle.on("modified", () => {
        const cached = patternCache.get(component.id);
        if (cached && component.type === "DOCK_ICON") {
          const { image, maxSize } = cached;
          const scaleX = maxSize / image.width;
          const scaleY = maxSize / image.height;
          const scale = Math.min(scaleX, scaleY);

          cached.pattern.patternTransform = [
            scale,
            0,
            0,
            scale,
            -maxSize / 2,
            -maxSize / 2,
          ];

          circle.set("fill", cached.pattern);
          canvas.requestRenderAll();
        }
      });

      return circle;
    };

    // EVOLVED: Enhanced canvas event handling
    canvas.on("before:render", () => {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.cacheKey && obj.fill instanceof fabric.Pattern) {
          obj.dirty = true;
        }
      });
    });

    // EVOLVED: Optimize canvas rendering
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

      // EVOLVED: More efficient render
      requestAnimationFrame(() => {
        canvas.requestRenderAll();
      });
    });

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
