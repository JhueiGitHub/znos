// app/apps/orion/components/Canvas.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { StarField } from "./StarField";
import { useOrionStore } from "../lib/store";
import { Node } from "../lib/types";
import { debounce } from "lodash";

export function OrionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const starfieldContainerRef = useRef<HTMLDivElement>(null);

  // Get state from store
  const {
    activeCanvasId,
    canvases,
    zoom,
    pan,
    starfieldOptions,
    updateViewport,
    createNode,
    selectNode,
    clearNodeSelection,
    updateNode,
  } = useOrionStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize fabric canvas - with minimal dependencies
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    // Resize handler
    const handleResize = debounce(() => {
      if (!canvas) return;
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      canvas.renderAll();
    }, 100);

    // Set initial dimensions
    canvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener("resize", handleResize);

    // Only set initialized once the canvas is ready
    setIsInitialized(true);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      fabricCanvasRef.current = null;
      setIsInitialized(false);
    };
  }, []); // Empty dependency array - this only runs once on mount

  // Setup event handlers AFTER initialization
  useEffect(() => {
    if (!isInitialized || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Pan and zoom handlers
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;

      // Only start dragging on middle mouse or when alt is pressed
      if (evt.button === 1 || evt.altKey) {
        isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;

        // Prevent default to avoid issues
        evt.preventDefault();
        evt.stopPropagation();
      }

      // Deselect all on canvas click (unless clicking an object)
      if (!opt.target && evt.button === 0) {
        clearNodeSelection();
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;

      if (isDragging) {
        const deltaX = evt.clientX - lastPosX;
        const deltaY = evt.clientY - lastPosY;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;

        // Get current viewport transform from the store
        const { x, y } = pan;

        // Update pan in the store
        updateViewport(zoom, {
          x: x + deltaX,
          y: y + deltaY,
        });

        // Update fabric canvas viewport
        canvas.relativePan(new fabric.Point(deltaX, deltaY));

        canvas.requestRenderAll();

        // Prevent default to avoid issues
        evt.preventDefault();
        evt.stopPropagation();
      }
    };

    const handleMouseUp = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;

      if (isDragging) {
        isDragging = false;
        canvas.selection = true;

        // Prevent default to avoid issues
        evt.preventDefault();
        evt.stopPropagation();
      }
    };

    const handleMouseWheel = (opt: fabric.IEvent) => {
      const evt = opt.e as WheelEvent;
      const delta = evt.deltaY;

      // Prevent default to avoid page scrolling
      evt.preventDefault();

      // Calculate new zoom
      let newZoom = zoom;
      if (delta > 0) {
        newZoom = Math.max(0.1, zoom * 0.95);
      } else {
        newZoom = Math.min(10, zoom * 1.05);
      }

      // Calculate zoom point in canvas coordinates
      const point = new fabric.Point(evt.offsetX, evt.offsetY);

      // Get current pan from the store
      const { x, y } = pan;

      // Calculate new pan
      const zoomRatio = newZoom / zoom;
      const panPoint = new fabric.Point(x, y);
      const pointOnCanvas = point.subtract(panPoint);
      const newPanPoint = point.subtract(pointOnCanvas.multiply(zoomRatio));

      // Update zoom and pan in the store
      updateViewport(newZoom, {
        x: newPanPoint.x,
        y: newPanPoint.y,
      });

      // Apply zoom to canvas
      canvas.zoomToPoint(point, newZoom);

      canvas.requestRenderAll();
    };

    const handleSelectionCreated = (opt: fabric.IEvent) => {
      if (!opt.selected || !opt.selected.length) return;

      const nodeId = opt.selected[0].data?.id;
      if (nodeId) {
        // Use the event's shiftKey property directly
        const isMultiSelect = opt.e ? (opt.e as MouseEvent).shiftKey : false;
        selectNode(nodeId, isMultiSelect);
      }
    };

    const handleSelectionUpdated = (opt: fabric.IEvent) => {
      if (!opt.selected || !opt.selected.length) return;

      const nodeId = opt.selected[0].data?.id;
      if (nodeId) {
        // Use the event's shiftKey property directly
        const isMultiSelect = opt.e ? (opt.e as MouseEvent).shiftKey : false;
        selectNode(nodeId, isMultiSelect);
      }
    };

    const handleObjectMoving = (opt: fabric.IEvent) => {
      if (!opt.target || !opt.target.data?.id) return;

      const nodeId = opt.target.data.id;
      const { left, top } = opt.target;

      updateNode(nodeId, {
        position: { x: left || 0, y: top || 0 },
      });
    };

    const handleObjectScaling = (opt: fabric.IEvent) => {
      if (!opt.target || !opt.target.data?.id) return;

      const nodeId = opt.target.data.id;
      const { width, height, scaleX, scaleY } = opt.target;

      updateNode(nodeId, {
        size: {
          width: (width || 0) * (scaleX || 1),
          height: (height || 0) * (scaleY || 1),
        },
      });
    };

    const handleDoubleClick = (opt: fabric.IEvent) => {
      const evt = opt.e as MouseEvent;

      // Don't create a new note if clicking an existing object
      if (opt.target) return;

      // Calculate position in canvas coordinates
      const canvasPointer = canvas.getPointer(evt);

      // Create a new note
      createNode("note", "New Note", {
        x: canvasPointer.x,
        y: canvasPointer.y,
      });
    };

    // Attach all event handlers
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("mouse:wheel", handleMouseWheel);
    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectScaling);
    canvas.on("mouse:dblclick", handleDoubleClick);

    // Return cleanup function to remove event handlers
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("mouse:wheel", handleMouseWheel);
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionUpdated);
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:scaling", handleObjectScaling);
      canvas.off("mouse:dblclick", handleDoubleClick);
    };
  }, [
    isInitialized,
    zoom,
    pan,
    updateViewport,
    createNode,
    selectNode,
    clearNodeSelection,
    updateNode,
  ]);

  // Load and render canvas nodes
  useEffect(() => {
    if (
      !isInitialized ||
      !fabricCanvasRef.current ||
      !activeCanvasId ||
      !canvases[activeCanvasId]
    ) {
      return;
    }

    const canvas = fabricCanvasRef.current;
    const nodes = canvases[activeCanvasId].nodes;

    // Clear canvas
    canvas.clear();

    // Add each node to the canvas
    nodes.forEach((node) => {
      let fabricObject: fabric.Object | null = null;

      switch (node.type) {
        case "note":
          fabricObject = new fabric.Rect({
            left: node.position.x,
            top: node.position.y,
            width: node.size.width,
            height: node.size.height,
            fill: node.style?.backgroundColor || "#f7e8a4",
            stroke: node.style?.borderColor || "#e6d796",
            strokeWidth: 1,
            rx: 3,
            ry: 3,
            shadow: new fabric.Shadow({
              color: "rgba(0,0,0,0.2)",
              blur: 5,
              offsetX: 0,
              offsetY: 2,
            }),
            data: { id: node.id, type: node.type },
          });

          // Add text
          const text = new fabric.Textbox(node.content, {
            left: node.position.x + 10,
            top: node.position.y + 10,
            width: node.size.width - 20,
            fontSize: 14,
            fontFamily: "Arial",
            fill: node.style?.color || "#000000",
            data: { parentId: node.id },
          });

          canvas.add(text);
          break;

        case "image":
          // Image implementation would go here
          break;

        case "link":
          // Link implementation would go here
          break;

        case "file":
          // File implementation would go here
          break;
      }

      if (fabricObject) {
        canvas.add(fabricObject);
        fabricObject.setCoords();
      }
    });

    // Apply viewport transform
    const storedViewport = canvases[activeCanvasId].viewportTransform;
    if (storedViewport) {
      // Set zoom and pan in the store
      updateViewport(storedViewport.zoom, storedViewport.pan);

      // Apply zoom and pan to canvas
      canvas.setZoom(storedViewport.zoom);
      canvas.absolutePan(
        new fabric.Point(-storedViewport.pan.x, -storedViewport.pan.y)
      );
    }

    canvas.renderAll();
  }, [isInitialized, activeCanvasId, canvases, updateViewport]);

  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Star field background */}
      <div
        ref={starfieldContainerRef}
        className="absolute inset-0 w-full h-full"
      >
        <StarField
          options={{
            ...starfieldOptions,
            viewportTransform: { zoom, pan },
          }}
        />
      </div>

      {/* Fabric.js canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
