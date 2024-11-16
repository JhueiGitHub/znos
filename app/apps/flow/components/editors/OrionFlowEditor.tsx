import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import * as Portal from "@radix-ui/react-portal";
import axios from "axios";
import { useStyles } from "@os/hooks/useStyles";
import { Flow, FlowComponent, MediaItem } from "@prisma/client";
import { useOthers } from "@/liveblocks.config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDesignSystem } from "@/app/contexts/DesignSystemContext";

interface OrionFlowEditorProps {
  flowId: string;
}

interface WallpaperAttributes {
  mode: "color" | "media";
  value: string | null;
  mediaId?: string;
  tokenId?: string;
}

interface DockIconAttributes {
  id: string;
  icon: string | null;
  mediaId?: string;
  order: number;
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

interface EditorSidebarProps {
  selectedComponent: fabric.Object | null;
  attributes: WallpaperAttributes;
  dockIconAttributes: DockIconAttributes;
  onAttributeChange: (updates: Partial<WallpaperAttributes>) => void;
  onDockIconChange: (updates: Partial<DockIconAttributes>) => void;
  onMediaSelect: () => void;
}

const EditorSidebar = ({
  selectedComponent,
  attributes,
  dockIconAttributes,
  onAttributeChange,
  onDockIconChange,
  onMediaSelect,
}: EditorSidebarProps) => {
  const { getColor, getFont } = useStyles();

  if (!selectedComponent) {
    return (
      <div
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] flex flex-col bg-[#010203]/80 backdrop-blur-sm"
        style={{
          borderLeft: `1px solid ${getColor("Brd")}`,
          backgroundColor: getColor("Glass"),
        }}
      >
        <div className="h-10 px-4 flex items-center gap-8">
          <span
            className="text-[11px] font-semibold"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            Design
          </span>
          <span
            className="text-[11px]"
            style={{
              color: getColor("Text Secondary (Bd)"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            No selection
          </span>
        </div>
      </div>
    );
  }

  if (selectedComponent.data?.type === "dockIcon") {
    return (
      <div
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] flex flex-col bg-[#010203]/80 backdrop-blur-sm"
        style={{
          borderLeft: `1px solid ${getColor("Brd")}`,
          backgroundColor: getColor("Glass"),
        }}
      >
        <div className="h-10 px-4 flex items-center gap-8">
          <span
            className="text-[11px] font-semibold"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            Design
          </span>
          <span
            className="text-[11px]"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            Dock Icon {dockIconAttributes.order + 1}
          </span>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Icon
            </label>
            {dockIconAttributes.icon ? (
              <div className="space-y-2">
                <div
                  className="aspect-square rounded border overflow-hidden"
                  style={{ borderColor: getColor("Brd") }}
                >
                  <img
                    src={dockIconAttributes.icon}
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={onMediaSelect}
                  className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                    fontFamily: getFont("Text Primary"),
                  }}
                >
                  Change Icon...
                </button>
              </div>
            ) : (
              <button
                onClick={onMediaSelect}
                className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                Choose Icon...
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wallpaper Controls (existing code)
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] flex flex-col bg-[#010203]/80 backdrop-blur-sm"
      style={{
        borderLeft: `1px solid ${getColor("Brd")}`,
        backgroundColor: getColor("Glass"),
      }}
    >
      <div className="h-10 px-4 flex items-center gap-8">
        <span
          className="text-[11px] font-semibold"
          style={{
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          Design
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <label
            className="text-[11px] uppercase"
            style={{
              color: getColor("Text Secondary (Bd)"),
              fontFamily: getFont("Text Secondary"),
            }}
          >
            Mode
          </label>
          <Select
            value={attributes.mode}
            onValueChange={(value) =>
              onAttributeChange({ mode: value as "color" | "media" })
            }
          >
            <SelectTrigger
              className="w-full h-8 px-3 bg-transparent border border-white/[0.09]"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              <SelectItem value="color">Color Fill</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {attributes.mode === "color" ? (
          <div className="space-y-2">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Color
            </label>
            <input
              type="color"
              value={attributes.value || "#000000"}
              onChange={(e) => onAttributeChange({ value: e.target.value })}
              className="w-full h-8 bg-transparent border border-white/[0.09] rounded cursor-pointer"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Media
            </label>
            {attributes.mediaId ? (
              <div className="space-y-2">
                <div
                  className="aspect-video rounded border overflow-hidden"
                  style={{ borderColor: getColor("Brd") }}
                >
                  <img
                    src={attributes.value || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={onMediaSelect}
                  className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                    fontFamily: getFont("Text Primary"),
                  }}
                >
                  Change media...
                </button>
              </div>
            ) : (
              <button
                onClick={onMediaSelect}
                className="w-full h-8 px-3 bg-transparent border border-white/[0.09] rounded text-[11px] hover:bg-white/[0.02]"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                Choose media...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OrionFlowEditor = ({ flowId }: OrionFlowEditorProps) => {
  const others = useOthers();
  const { getColor, getFont } = useStyles();
  const { designSystem } = useDesignSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [selectedComponent, setSelectedComponent] =
    useState<fabric.Object | null>(null);
  const [attributes, setAttributes] = useState<WallpaperAttributes>({
    mode: "color",
    value: null,
    tokenId: "Black", // Default to Black token
  });
  const [dockIconAttributes, setDockIconAttributes] =
    useState<DockIconAttributes>({
      id: "",
      icon: null,
      order: 0,
    });

  // Update mediaSelector state to include component type
  const [mediaSelector, setMediaSelector] = useState<{
    x: number;
    y: number;
    forComponent: "wallpaper" | "dockIcon";
  } | null>(null);
  const queryClient = useQueryClient();

  // Update the flow query to handle default wallpaper initialization
  const { data: flow } = useQuery<Flow & { components: FlowComponent[] }>({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const response = await axios.get(`/api/flows/${flowId}`);
      // If no wallpaper component exists, create one with default token
      if (
        !response.data.components.find(
          (c: FlowComponent) => c.type === "WALLPAPER"
        )
      ) {
        const defaultWallpaper = {
          type: "WALLPAPER",
          mode: "color",
          value: null,
          tokenId: "Black", // Reference to core flow Black token
          order: 0,
        };

        await axios.post(`/api/flows/${flowId}/components`, defaultWallpaper);
        response.data.components.push(defaultWallpaper);
      }

      return response.data;
    },
  });

  const updateComponent = useMutation({
    mutationFn: async ({
      componentId,
      updates,
    }: {
      componentId: string;
      updates: Partial<WallpaperAttributes>;
    }) => {
      if (updates.mode === "color" && !updates.value) {
        // Ensure we're using token for color mode when no direct value
        updates.tokenId = updates.tokenId || "Black";
      } else if (updates.mode === "media") {
        // Clear token reference for media mode
        updates.tokenId = undefined;
      }

      await axios.patch(
        `/api/flows/${flowId}/components/${componentId}`,
        updates
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["flow", flowId]);

      // Update the canvas preview
      if (fabricRef.current && flow) {
        const wallpaperPreview = fabricRef.current
          .getObjects()
          .find((obj) => obj.data?.type === "wallpaperPreview");

        if (wallpaperPreview) {
          if (attributes.mode === "color") {
            const fillColor =
              attributes.value ||
              (attributes.tokenId
                ? getColor(attributes.tokenId)
                : getColor("Black"));
            wallpaperPreview.set("fill", fillColor);
          } else if (attributes.mode === "media" && attributes.value) {
            fabric.Image.fromURL(attributes.value, (img) => {
              if (
                wallpaperPreview &&
                img.getElement() instanceof HTMLImageElement
              ) {
                wallpaperPreview.set(
                  "fill",
                  new fabric.Pattern({
                    source: img.getElement() as HTMLImageElement,
                    repeat: "no-repeat",
                  })
                );
                fabricRef.current?.renderAll();
              }
            });
          }

          fabricRef.current?.renderAll();
        }
      }
    },
  });

  useEffect(() => {
    if (!canvasRef.current || !flow?.components || !designSystem) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 560,
      height: window.innerHeight,
      backgroundColor: "#010203",
      selection: false,
    });

    fabricRef.current = canvas;

    // Get or create wallpaper component
    const wallpaperComponent = flow.components.find(
      (c) => c.type === "WALLPAPER"
    );

    // Determine the fill color based on mode and token
    const getWallpaperFill = () => {
      if (wallpaperComponent) {
        if (wallpaperComponent.mode === "color") {
          return (
            wallpaperComponent.value ||
            (wallpaperComponent.tokenId
              ? getColor(wallpaperComponent.tokenId)
              : getColor("Black"))
          );
        }
        return getColor("Overlaying BG");
      }
      return getColor("Black"); // Default
    };

    // Create wallpaper card
    const wallpaperCard = new fabric.Rect({
      left: 50,
      top: 50,
      width: 400,
      height: 300,
      rx: 10,
      ry: 10,
      fill: getColor("Glass"),
      stroke: getColor("Brd"),
      strokeWidth: 1,
      selectable: true,
      hasControls: false,
      data: { type: "wallpaperCard" },
    });

    // Create preview with proper fill
    const wallpaperPreview = new fabric.Rect({
      left: 70,
      top: 100,
      width: 360,
      height: 220,
      rx: 8,
      ry: 8,
      fill: getWallpaperFill(),
      stroke: getColor("Brd"),
      strokeWidth: 1,
      selectable: false,
      data: { type: "wallpaperPreview" },
    });

    // Handle media preview if needed
    if (wallpaperComponent?.mode === "media" && wallpaperComponent.value) {
      fabric.Image.fromURL(wallpaperComponent.value, (img) => {
        if (img.getElement() instanceof HTMLImageElement) {
          wallpaperPreview.set(
            "fill",
            new fabric.Pattern({
              source: img.getElement() as HTMLImageElement,
              repeat: "no-repeat",
            })
          );
          canvas.renderAll();
        }
      });
    }

    // Selection handler with proper token handling
    wallpaperCard.on("selected", () => {
      setSelectedComponent(wallpaperCard);
      if (wallpaperComponent) {
        setAttributes({
          mode: (wallpaperComponent.mode as "color" | "media") || "color",
          value: wallpaperComponent.value,
          tokenId: wallpaperComponent.tokenId || undefined,
          mediaId: wallpaperComponent.mediaId || undefined,
        });
      }
    });

    // Dock Icons Card
    const dockIconsCard = new fabric.Rect({
      left: 500,
      top: 50,
      width: 400,
      height: 300,
      rx: 10,
      ry: 10,
      fill: getColor("Glass"),
      stroke: getColor("Brd"),
      strokeWidth: 1,
      selectable: true,
      hasControls: false,
      data: { type: "dockIconsCard" },
    });

    const dockIconsTitle = new fabric.Text("Dock Icons", {
      left: 520,
      top: 70,
      fontSize: 16,
      fontFamily: getFont("Text Primary"),
      fill: getColor("Text Primary (Hd)"),
      selectable: false,
    });

    // Create dock icon slots
    // Create dock icon slots
    const dockIcons = flow.components
      .filter((c) => c.type === "DOCK_ICON")
      .sort((a, b) => a.order - b.order)
      .map((icon, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const rect = new fabric.Rect({
          left: 520 + col * 90,
          top: 100 + row * 90,
          width: 80,
          height: 80,
          rx: 8,
          ry: 8,
          fill: getColor("Overlaying BG"),
          stroke: getColor("Brd"),
          strokeWidth: 1,
          selectable: true,
          hasControls: false,
          data: {
            type: "dockIcon",
            id: icon.id,
            order: index,
          },
        });

        // Add selection handler
        rect.on("selected", () => {
          setSelectedComponent(rect);
          setDockIconAttributes({
            id: icon.id,
            icon: icon.value,
            mediaId: icon.mediaId || undefined,
            order: index,
          });
        });

        // If icon exists, create its preview
        if (icon.value) {
          fabric.Image.fromURL(icon.value, (img) => {
            img.scaleToWidth(70);
            img.scaleToHeight(70);

            const iconWrapper = new fabric.Group([rect, img], {
              left: rect.left,
              top: rect.top,
              selectable: true,
              hasControls: false,
              data: {
                type: "dockIcon",
                id: icon.id,
                order: index,
              },
            });

            canvas.add(iconWrapper);
          });
        } else {
          canvas.add(rect);
        }

        return rect;
      });

    wallpaperCard.on("selected", () => {
      setSelectedComponent(wallpaperCard);
      if (wallpaperComponent) {
        setAttributes({
          mode: (wallpaperComponent.mode as "color" | "media") || "color",
          value: wallpaperComponent.value,
          mediaId: wallpaperComponent.mediaId || undefined,
        });
      }
    });

    dockIconsCard.on("selected", () => {
      setSelectedComponent(dockIconsCard);
    });

    canvas.on("selection:cleared", () => {
      setSelectedComponent(null);
    });

    // Define wallpaperTitle
    const wallpaperTitle = new fabric.Text("Wallpaper Title", {
      left: 70,
      top: 70,
      fontSize: 20,
      fontFamily: getFont("Text Primary"),
      fill: getColor("Text Primary (Hd)"),
      selectable: false,
    });

    // Add to canvas
    canvas.add(
      wallpaperCard,
      wallpaperTitle,
      wallpaperPreview,
      dockIconsCard,
      dockIconsTitle,
      ...dockIcons
    );

    // Pan and zoom functionality
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

      const delta = opt.e.deltaY;
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
  }, [flow, designSystem, getColor, getFont]);

  const handleAttributeChange = async (
    updates: Partial<WallpaperAttributes>
  ) => {
    if (!selectedComponent || !flow) return;

    const wallpaperComponent = flow.components.find(
      (c) => c.type === "WALLPAPER"
    );

    if (wallpaperComponent) {
      // Handle token updates for color mode
      if (updates.mode === "color" && !updates.value) {
        updates.tokenId = updates.tokenId || attributes.tokenId || "Black";
      }

      setAttributes((prev) => ({ ...prev, ...updates }));
      await updateComponent.mutate({
        componentId: wallpaperComponent.id,
        updates,
      });
    }
  };

  const handleMediaSelect = (mediaItem: MediaItem) => {
    if (!mediaSelector) return;

    if (mediaSelector.forComponent === "wallpaper") {
      handleAttributeChange({
        mode: "media",
        value: mediaItem.url,
        mediaId: mediaItem.id,
      });
    } else {
      const dockIconComponent = flow?.components.find(
        (c) => c.id === dockIconAttributes.id
      );
      if (dockIconComponent) {
        updateComponent.mutate({
          componentId: dockIconComponent.id,
          updates: {
            value: mediaItem.url,
            mediaId: mediaItem.id,
          },
        });
      }
    }
    setMediaSelector(null);
  };

  const handleDockIconChange = async (updates: Partial<DockIconAttributes>) => {
    if (!selectedComponent || !flow) return;

    const dockIconComponent = flow.components.find(
      (c) => c.id === dockIconAttributes.id
    );

    if (dockIconComponent) {
      await updateComponent.mutate({
        componentId: dockIconComponent.id,
        updates,
      });
    }
  };

  return (
    <div className="h-full w-full bg-[#010203] relative">
      <canvas ref={canvasRef} />
      <EditorSidebar
        selectedComponent={selectedComponent}
        attributes={attributes}
        dockIconAttributes={dockIconAttributes}
        onAttributeChange={handleAttributeChange}
        onDockIconChange={handleDockIconChange}
        onMediaSelect={() =>
          setMediaSelector({
            x: window.innerWidth - 700,
            y: 100,
            forComponent:
              selectedComponent?.data?.type === "dockIcon"
                ? "dockIcon"
                : "wallpaper",
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
