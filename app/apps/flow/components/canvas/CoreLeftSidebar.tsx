import React from "react";
import { motion } from "framer-motion";
import { FileTreeFolder, FileTreeFile } from "./CoreFileTree";
import { useStyles } from "@/app/hooks/useStyles";
import { CoreFlowComponent } from "./CoreFlowEditor";

export interface CoreLeftSidebarProps {
  flowName: string;
  isVisible: boolean;
  components: CoreFlowComponent[];
  onComponentSelect: (
    componentId: string,
    modifiers: { shift?: boolean; meta?: boolean }
  ) => void;
  selectedComponentIds: string[];
}

export const CoreLeftSidebar: React.FC<CoreLeftSidebarProps> = ({
  flowName,
  isVisible,
  components,
  onComponentSelect,
  selectedComponentIds,
}) => {
  const { getColor, getFont } = useStyles();

  const colorComponents = components.filter((c) => c.type === "COLOR");
  const typographyComponents = components.filter(
    (c) => c.type === "TYPOGRAPHY"
  );

  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-[264px] border-r flex flex-col backdrop-blur-sm z-10"
      style={{
        borderColor: getColor("Brd"),
        backgroundColor: getColor("Glass"),
      }}
    >
      <div className="h-[57px] border-b border-white/[0.09] p-4 flex flex-col justify-center">
        <span
          className="text-[13px] font-bold"
          style={{
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          {flowName || "Untitled"}
        </span>
        <span
          className="text-[11px] font-medium"
          style={{
            color: getColor("Text Secondary (Bd)"),
            fontFamily: getFont("Text Secondary"),
          }}
        >
          Design System
        </span>
      </div>

      <div className="h-10 border-b border-white/[0.09] flex px-2 gap-2 items-center">
        <button className="px-[9px] py-2 bg-[#292929]/50 rounded-md">
          <span
            className="text-[11px] font-semibold"
            style={{ color: getColor("Text Primary (Hd)") }}
          >
            Components
          </span>
        </button>
        <button className="px-[9px] py-2">
          <span
            className="text-[11px] font-semibold"
            style={{ color: getColor("Text Secondary (Bd)") }}
          >
            Assets
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <FileTreeFolder name="Design Tokens" isSelectable={false}>
          <FileTreeFolder name="Colors" isSelectable={false}>
            {colorComponents.map((component) => (
              <FileTreeFile
                key={component.id}
                name={component.name}
                value={component.id}
                isSelected={selectedComponentIds.includes(component.id)}
                handleSelect={(id, modifiers) =>
                  onComponentSelect(id, modifiers)
                }
              />
            ))}
          </FileTreeFolder>
          <FileTreeFolder name="Typography" isSelectable={false}>
            {typographyComponents.map((component) => (
              <FileTreeFile
                key={component.id}
                name={component.name}
                value={component.id}
                isSelected={selectedComponentIds.includes(component.id)}
                handleSelect={(id, modifiers) =>
                  onComponentSelect(id, modifiers)
                }
              />
            ))}
          </FileTreeFolder>
        </FileTreeFolder>
      </div>
    </div>
  );
};

export default CoreLeftSidebar;
