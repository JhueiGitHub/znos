import { useState } from "react";
import { CoreFlowComponent } from "./CoreFlowEditor";
import type { ComponentUpdate } from "./CoreFlowEditor";
import { useStyles } from "@/app/hooks/useStyles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChromePicker } from "react-color";

interface CoreEditorSidebarProps {
  selectedComponents: CoreFlowComponent[];
  designSystem: any | null;
  onUpdateComponent: (ids: string[], updates: ComponentUpdate) => void;
}

export const CoreEditorSidebar: React.FC<CoreEditorSidebarProps> = ({
  selectedComponents,
  designSystem,
  onUpdateComponent,
}) => {
  const { getColor, getFont } = useStyles();
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (selectedComponents.length === 0) {
    return (
      <div
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l flex flex-col bg-[#010203]/80 backdrop-blur-sm"
        style={{
          borderColor: getColor("Brd"),
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

  // Get the first selected component as reference
  const primaryComponent = selectedComponents[0];
  const componentIds = selectedComponents.map((c) => c.id);

  // Check if all selected components are of the same type
  const allSameType = selectedComponents.every(
    (c) => c.type === primaryComponent.type
  );
  const isColorComponent = allSameType && primaryComponent.type === "COLOR";
  const isTypographyComponent =
    allSameType && primaryComponent.type === "TYPOGRAPHY";

  if (!allSameType) {
    return (
      <div
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l flex flex-col bg-[#010203]/80 backdrop-blur-sm"
        style={{
          borderColor: getColor("Brd"),
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
            Multiple Types Selected
          </span>
        </div>
        <div className="p-4">
          <span
            className="text-[11px]"
            style={{
              color: getColor("Text Secondary (Bd)"),
            }}
          >
            Selected components must be of the same type to edit properties
          </span>
        </div>
      </div>
    );
  }

  // Render color component properties
  if (isColorComponent) {
    return (
      <div
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l flex flex-col bg-[#010203]/80 backdrop-blur-sm"
        style={{
          borderColor: getColor("Brd"),
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
            Color Design ({selectedComponents.length} selected)
          </span>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Color Value
            </label>
            <div className="space-y-2">
              <div
                className="w-full h-10 rounded cursor-pointer"
                style={{ backgroundColor: primaryComponent.value || "#000000" }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <div
                className="text-xs"
                style={{
                  color: getColor("Text Secondary (Bd)"),
                }}
              >
                {primaryComponent.value || "#000000"}
              </div>
            </div>

            {showColorPicker && (
              <div className="mt-2 bg-[#010203] border border-white/[0.09] p-2 rounded-md">
                <ChromePicker
                  color={primaryComponent.value || "#000000"}
                  onChange={(color) => {
                    onUpdateComponent(componentIds, {
                      value: color.hex,
                      // Always specify mode to avoid API issues
                      mode: "color",
                    });
                  }}
                  disableAlpha={false}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-white/[0.09]">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Opacity
            </label>
            <Slider
              value={[primaryComponent.opacity || 100]}
              max={100}
              step={1}
              onValueChange={(value) =>
                onUpdateComponent(componentIds, {
                  opacity: value[0],
                  // Always specify mode to avoid API issues
                  mode: "color",
                })
              }
              className="my-4"
            />
            <div
              className="text-xs"
              style={{
                color: getColor("Text Secondary (Bd)"),
              }}
            >
              {primaryComponent.opacity || 100}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render typography component properties
  if (isTypographyComponent) {
    return (
      <div
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l flex flex-col bg-[#010203]/80 backdrop-blur-sm"
        style={{
          borderColor: getColor("Brd"),
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
            Typography Design ({selectedComponents.length} selected)
          </span>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Font Family
            </label>
            <Select
              value={primaryComponent.value || ""}
              onValueChange={(value) =>
                onUpdateComponent(componentIds, {
                  value,
                  fontFamily: value, // Update both value and fontFamily
                  mode: "typography", // Always specify mode
                })
              }
            >
              <SelectTrigger
                className="w-full h-8 px-3 bg-transparent border border-white/[0.09]"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="SF Pro">SF Pro</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/[0.09]">
            <label
              className="text-[11px] uppercase"
              style={{
                color: getColor("Text Secondary (Bd)"),
                fontFamily: getFont("Text Secondary"),
              }}
            >
              Font Weight
            </label>
            <Select
              value={primaryComponent.fontWeight || "regular"}
              onValueChange={(value) =>
                onUpdateComponent(componentIds, {
                  fontWeight: value,
                  mode: "typography", // Always specify mode
                })
              }
            >
              <SelectTrigger
                className="w-full h-8 px-3 bg-transparent border border-white/[0.09]"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="semibold">Semibold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CoreEditorSidebar;
