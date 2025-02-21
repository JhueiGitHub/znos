import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useOthers } from "@/liveblocks.config";
import { useDesignSystem } from "@/app/contexts/DesignSystemContext";
import { AnimatePresence } from "framer-motion";
import { CoreLeftSidebar } from "./CoreLeftSidebar";
import { CoreEditorSidebar } from "./CoreEditorSidebar";
import { ColorPickerState, CanvasViewState } from "./core-editor-types";
import { useAutosave } from "@/app/hooks/useDebounce";
import SaveStatusIndicator from "@/app/components/SaveStatusIndicator";

interface CoreFlowEditorProps {
  flowId: string;
  onClose: () => void;
  areSidebarsVisible: boolean;
}

const CoreFlowEditor = ({
  flowId,
  onClose,
  areSidebarsVisible,
}: CoreFlowEditorProps) => {
  const others = useOthers();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const queryClient = useQueryClient();
  const { designSystem } = useDesignSystem();
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [colorPicker, setColorPicker] = useState<ColorPickerState>({
    isOpen: false,
    color: "",
    position: { x: 0, y: 0 },
    tokenId: null,
  });

  const [canvasViewState, setCanvasViewState] = useState<CanvasViewState>({
    zoom: 1,
    viewportTransform: null,
  });

  const { data: flow } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const response = await axios.get(`/api/flows/${flowId}`);
      return response.data;
    },
  });

  const selectedToken =
    designSystem?.colorTokens.find((token) => token.id === selectedTokenId) ||
    null;

  const { handleComponentUpdate, saveStatus } = useAutosave({
    onSave: async (tokenId: string, updates: { value: string }) => {
      const response = await axios.patch(
        `/api/design-systems/${designSystem?.id}/tokens/${tokenId}`,
        updates
      );
      return response.data;
    },
    onSuccess: (updatedToken) => {
      // Update design system cache
      queryClient.setQueryData(
        ["designSystem", designSystem?.id],
        (oldData: any) => ({
          ...oldData,
          colorTokens: oldData.colorTokens.map((token: any) =>
            token.id === updatedToken.id ? updatedToken : token
          ),
        })
      );
    },
    onError: (error) => {
      console.error("Failed to update token:", error);
    },
  });

  useEffect(() => {
    if (!canvasRef.current || !flow?.components || !designSystem) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 560, // Adjusted for sidebars
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

    const tokens = designSystem.colorTokens;
    const rows = Math.ceil(tokens.length / 5);
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
        data: { tokenId: token.id },
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

      circle.on("mousedown", () => {
        setSelectedTokenId(token.id);
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
  }, [canvasRef, flow, designSystem, canvasViewState]);

  return (
    <div className="h-full w-full relative">
      <div className="absolute inset-0 px-[280px]">
        <canvas ref={canvasRef} />
      </div>

      <AnimatePresence>
        {areSidebarsVisible && (
          <>
            <CoreLeftSidebar
              flowName={flow?.name || ""}
              isVisible={areSidebarsVisible}
              designSystem={designSystem}
              onColorSelect={setSelectedTokenId}
              selectedTokenId={selectedTokenId}
            />

            <CoreEditorSidebar
              selectedToken={selectedToken}
              designSystem={designSystem}
              onUpdateToken={handleComponentUpdate}
            />
          </>
        )}
      </AnimatePresence>

      {/* Top-right status */}
      <div className="fixed top-4 right-20 flex items-center gap-4 z-20">
        <SaveStatusIndicator status={saveStatus} />
        <div className="text-[#cccccc]/70 text-xs">
          {others.length} other user{others.length === 1 ? "" : "s"} present
        </div>
      </div>
    </div>
  );
};

export default CoreFlowEditor;
