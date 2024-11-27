import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { FileTreeFolder, FileTreeFile } from "./OrionFileTree";
import { OrionFlowComponent } from "./orion-flow-types";

interface OrionLeftSidebarProps {
  flowName: string;
  isVisible: boolean;
  components: OrionFlowComponent[];
  onComponentSelect: (componentId: string) => void;
  selectedComponentId?: string;
}

export const OrionLeftSidebar: React.FC<OrionLeftSidebarProps> = ({
  flowName,
  isVisible,
  components,
  onComponentSelect,
  selectedComponentId,
}) => {
  const { getColor, getFont } = useStyles();

  const wallpaperComponents = components.filter((c) => c.type === "WALLPAPER");
  const dockComponents = components.filter((c) => c.type === "DOCK_ICON");

  return (
    <motion.div
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      exit={{ x: -264 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute left-0 top-0 bottom-0 w-[264px] border-r border-white/[0.09] flex flex-col bg-black/30 backdrop-blur-sm z-10"
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
          OS Configuration
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
        <FileTreeFolder name="System" isSelectable={false}>
          <FileTreeFolder name="Wallpaper" isSelectable={false}>
            {wallpaperComponents.map((component) => (
              <FileTreeFile
                key={component.id}
                name={component.name}
                value={component.id}
                isSelected={component.id === selectedComponentId}
                handleSelect={onComponentSelect}
              />
            ))}
          </FileTreeFolder>
          <FileTreeFolder name="Dock Icons" isSelectable={false}>
            {dockComponents.map((component) => (
              <FileTreeFile
                key={component.id}
                name={component.name}
                value={component.id}
                isSelected={component.id === selectedComponentId}
                handleSelect={onComponentSelect}
              />
            ))}
          </FileTreeFolder>
        </FileTreeFolder>
      </div>
    </motion.div>
  );
};
