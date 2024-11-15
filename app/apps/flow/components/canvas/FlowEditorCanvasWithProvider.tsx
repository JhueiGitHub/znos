import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { ChromePicker } from "react-color";
import { motion, AnimatePresence } from "framer-motion";
import { useOthers } from "@/liveblocks.config";
import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@/liveblocks.config";
import { useDesignSystem } from "@/app/contexts/DesignSystemContext";

interface ColorPickerState {
  isOpen: boolean;
  color: string;
  position: { x: number; y: number };
  tokenId: string | null;
}

const FlowEditorCanvas = () => {
  const others = useOthers();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { designSystem, updateDesignSystem } = useDesignSystem();
  const [colorPicker, setColorPicker] = useState<ColorPickerState>({
    isOpen: false,
    color: "",
    position: { x: 0, y: 0 },
    tokenId: null,
  });

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

  const handleColorChange = async (color: string) => {
    if (!colorPicker.tokenId || !designSystem) return;

    try {
      const updatedTokens = designSystem.colorTokens.map((token) =>
        token.id === colorPicker.tokenId ? { ...token, value: color } : token
      );

      await updateDesignSystem({
        ...designSystem,
        colorTokens: updatedTokens,
      });
    } catch (error) {
      console.error("Failed to update color:", error);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !designSystem) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 560,
      height: window.innerHeight,
      backgroundColor: "#010203",
      selection: false,
    });

    const tokens = designSystem.colorTokens;
    const rows = 2;
    const cols = 5;
    const size = 80;
    const gap = 40;
    const startX = (canvas.width! - cols * (size + gap)) / 2 + 100;
    const startY = (canvas.height! - rows * (size + gap)) / 2;

    tokens.forEach((token, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX + col * (size + gap);
      const y = startY + row * (size + gap);

      // Color Circle
      const circle = new fabric.Circle({
        left: x,
        top: y,
        radius: size / 2,
        fill: token.value,
        strokeWidth: 2,
        stroke: "#ffffff10",
        selectable: false,
        hoverCursor: "pointer",
      });

      // Name Text
      const nameText = new fabric.Text(token.name, {
        left: x - size / 2,
        top: y + size / 2 + 10,
        fontSize: 14,
        fill: "#cccccc",
        fontFamily: "Inter",
        textAlign: "center",
        width: size * 2,
        selectable: false,
      });

      // Value Text
      const valueText = new fabric.Text(token.value, {
        left: x - size / 2,
        top: y + size / 2 + 30,
        fontSize: 12,
        fill: "#cccccc80",
        fontFamily: "Inter",
        textAlign: "center",
        width: size * 2,
        selectable: false,
      });

      // Handle click
      circle.on("mousedown", (opt) => {
        const evt = opt.e as MouseEvent;
        handleColorClick(token.value, token.id, evt.clientX, evt.clientY);
      });

      canvas.add(circle, nameText, valueText);
    });

    // Standard pan and zoom
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

      if (evt.shiftKey) {
        const deltaX = -evt.deltaY;
        const vpt = canvas.viewportTransform!;
        vpt[4] += deltaX;
        canvas.requestRenderAll();
      } else {
        const delta = evt.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        zoom = Math.min(Math.max(0.1, zoom), 20);
        const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
        canvas.zoomToPoint(point, zoom);
      }
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
  }, [designSystem]);

  return (
    <div className="h-full w-full bg-[#010203] relative">
      <canvas ref={canvasRef} />

      <AnimatePresence>
        {colorPicker.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed"
            style={{
              left: colorPicker.position.x - 100,
              top: colorPicker.position.y - 50,
              zIndex: 100,
            }}
          >
            <div className="p-1 rounded-lg bg-[#000000] border border-[#ffffff10]">
              <ChromePicker
                color={colorPicker.color}
                onChange={(color) => handleColorChange(color.hex)}
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

      <div className="fixed top-4 right-20 text-[#cccccc]/70 text-xs">
        {others.length} other user{others.length === 1 ? "" : "s"} present
      </div>
    </div>
  );
};

const FlowEditorCanvasWithProvider = ({ flowId }: { flowId: string }) => {
  return (
    <RoomProvider
      id={`flow-${flowId}`}
      initialPresence={{}}
      initialStorage={{
        canvasObjects: new LiveMap(),
      }}
    >
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => <FlowEditorCanvas />}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default FlowEditorCanvasWithProvider;
