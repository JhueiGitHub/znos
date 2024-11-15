import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useFlowStore } from "../store/flowStore";
import { useDesignSystem } from "../contexts/DesignSystemContext";
import { useStyles } from "../hooks/useStyles";
import { debounce } from "lodash";
import ColorPicker from "./ColorPicker";

const FlowEditor: React.FC = () => {
  const { activeFlowId, flows } = useFlowStore();
  const {
    designSystem,
    isLoading: isDesignSystemLoading,
    updateDesignSystem,
  } = useDesignSystem();
  const { getColor, getFont } = useStyles();
  const [canvasComponents, setCanvasComponents] = useState<any[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  // Effect to load canvas components when activeFlowId or designSystem changes
  useEffect(() => {
    if (activeFlowId && !isDesignSystemLoading && designSystem) {
      const activeFlow = flows.find((flow) => flow.id === activeFlowId);
      if (activeFlow) {
        const flowComponents = activeFlow.components.map((component) => ({
          ...component,
          isFlowComponent: true,
        }));
        const designSystemComponents = [
          ...designSystem.colorTokens.map((token) => ({
            id: token.id,
            type: "color",
            name: token.name,
            value: token.value,
            opacity: token.opacity,
            isDesignSystemComponent: true,
          })),
          ...designSystem.typographyTokens.map((token) => ({
            id: token.id,
            type: "typography",
            name: token.name,
            fontFamily: token.fontFamily,
            isDesignSystemComponent: true,
          })),
        ];
        setCanvasComponents([...flowComponents, ...designSystemComponents]);
      }
    }
  }, [activeFlowId, flows, designSystem, isDesignSystemLoading]);

  // Debounced function to update design system
  const debouncedUpdateDesignSystem = useMemo(
    () =>
      debounce(async (updates: any) => {
        if (!designSystem) return;
        try {
          const updatedDesignSystem = {
            ...designSystem,
            colorTokens: designSystem.colorTokens.map((token) =>
              updates[token.id] ? { ...token, ...updates[token.id] } : token
            ),
            typographyTokens: designSystem.typographyTokens.map((token) =>
              updates[token.id] ? { ...token, ...updates[token.id] } : token
            ),
          };
          await updateDesignSystem(updatedDesignSystem);
        } catch (error) {
          console.error("Failed to update design system:", error);
        }
      }, 1000),
    [designSystem, updateDesignSystem]
  );

  // Memoized function to handle component updates
  const handleComponentUpdate = useCallback(
    (componentId: string, updates: any) => {
      setCanvasComponents((prevComponents) =>
        prevComponents.map((comp) =>
          comp.id === componentId ? { ...comp, ...updates } : comp
        )
      );

      if (
        updates.value !== undefined ||
        updates.opacity !== undefined ||
        updates.fontFamily !== undefined
      ) {
        debouncedUpdateDesignSystem({ [componentId]: updates });
      }
    },
    [debouncedUpdateDesignSystem]
  );

  // Memoized function to create stable onUpdate references for each component
  const memoizedOnUpdate = useCallback(
    (componentId: string) => (updates: any) =>
      handleComponentUpdate(componentId, updates),
    [handleComponentUpdate]
  );

  const handleColorUpdate = useCallback(
    (colorId: string, newColor: string, newOpacity: number) => {
      debouncedUpdateDesignSystem({
        [colorId]: { value: newColor, opacity: newOpacity },
      });
    },
    [debouncedUpdateDesignSystem]
  );

  if (isDesignSystemLoading) {
    return (
      <div style={{ color: getColor("Text Primary (Hd)") }}>Loading...</div>
    );
  }

  return (
    <div
      className="w-full h-full p-6"
      style={{
        color: getColor("Text Primary (Hd)"),
      }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: getFont("Text Primary") }}
      >
        Flow Editor
      </h2>
      <div className="grid grid-cols-6 gap-6">
        {designSystem?.colorTokens.map((color) => (
          <div key={color.id} className="flex flex-col items-center">
            <button
              className="w-12 h-12 rounded-full shadow-lg transition-transform hover:scale-110"
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColorId(color.id)}
            />
            <span
              className="mt-2 text-sm"
              style={{ fontFamily: getFont("Text Secondary") }}
            >
              {color.name}
            </span>
            <span
              className="text-xs opacity-60"
              style={{ fontFamily: getFont("Text Secondary") }}
            >
              {color.value}
            </span>
          </div>
        ))}
      </div>
      {selectedColorId && (
        <ColorPicker
          color={
            designSystem?.colorTokens.find((c) => c.id === selectedColorId)
              ?.value || ""
          }
          opacity={
            designSystem?.colorTokens.find((c) => c.id === selectedColorId)
              ?.opacity || 100
          }
          onUpdate={(color, opacity) =>
            handleColorUpdate(selectedColorId, color, opacity)
          }
          onClose={() => setSelectedColorId(null)}
        />
      )}
    </div>
  );
};

export default FlowEditor;
