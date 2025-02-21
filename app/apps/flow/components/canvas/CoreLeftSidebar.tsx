import React from "react";
import { motion } from "framer-motion";
import { FileTreeFolder, FileTreeFile } from "./CoreFileTree";
import { useStyles } from "@/app/hooks/useStyles";
import { ColorToken } from "@prisma/client";

interface CoreLeftSidebarProps {
  flowName: string;
  isVisible: boolean;
  designSystem: {
    colorTokens: ColorToken[];
  } | null;
  onColorSelect: (tokenId: string) => void;
  selectedTokenId: string | null;
}

export const CoreLeftSidebar: React.FC<CoreLeftSidebarProps> = ({
  flowName,
  isVisible,
  designSystem,
  onColorSelect,
  selectedTokenId,
}) => {
  const { getColor, getFont } = useStyles();

  const baseTokens =
    designSystem?.colorTokens.filter(
      (token) =>
        !token.name.includes("-") &&
        ![
          "Underlying BG",
          "Overlaying BG",
          "Brd",
          "Black",
          "Glass",
          "White",
        ].includes(token.name)
    ) || [];

  const variantTokens =
    designSystem?.colorTokens.filter((token) => token.name.includes("-")) || [];

  return (
    <motion.div
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      exit={{ x: -264 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute left-0 top-0 bottom-0 w-[264px] border-r border-white/[0.09] flex flex-col backdrop-blur-sm z-10"
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
            Colors
          </span>
        </button>
        <button className="px-[9px] py-2">
          <span
            className="text-[11px] font-semibold"
            style={{ color: getColor("Text Secondary (Bd)") }}
          >
            Typography
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <FileTreeFolder name="Base Colors" isSelectable={false}>
          {baseTokens.map((token) => (
            <FileTreeFile
              key={token.id}
              name={token.name}
              value={token.id}
              isSelected={selectedTokenId === token.id}
              handleSelect={(id) => onColorSelect(id)}
            />
          ))}
        </FileTreeFolder>
        <FileTreeFolder name="Variants" isSelectable={false}>
          {variantTokens.map((token) => (
            <FileTreeFile
              key={token.id}
              name={token.name}
              value={token.id}
              isSelected={selectedTokenId === token.id}
              handleSelect={(id) => onColorSelect(id)}
            />
          ))}
        </FileTreeFolder>
      </div>
    </motion.div>
  );
};

export default CoreLeftSidebar;
