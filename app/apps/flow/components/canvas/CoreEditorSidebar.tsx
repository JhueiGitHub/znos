import React from "react";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { ColorToken } from "@prisma/client";

interface CoreEditorSidebarProps {
  selectedToken: ColorToken | null;
  designSystem: {
    colorTokens: ColorToken[];
  } | null;
  onUpdateToken: (tokenId: string, updates: { value: string }) => void;
}

export const CoreEditorSidebar: React.FC<CoreEditorSidebarProps> = ({
  selectedToken,
  designSystem,
  onUpdateToken,
}) => {
  const { getColor } = useStyles();

  if (!selectedToken) {
    return (
      <motion.div
        initial={{ x: 264 }}
        animate={{ x: 0 }}
        exit={{ x: 264 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] flex flex-col backdrop-blur-sm z-10"
        style={{
          borderColor: getColor("Brd"),
          backgroundColor: getColor("Glass"),
        }}
      >
        <div className="h-10 px-4 flex items-center">
          <span className="text-[#cccccc]/80 text-[11px] font-semibold">
            Select a token to edit
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 264 }}
      animate={{ x: 0 }}
      exit={{ x: 264 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09] flex flex-col backdrop-blur-sm z-10"
      style={{
        borderColor: getColor("Brd"),
        backgroundColor: getColor("Glass"),
      }}
    >
      <div className="h-10 px-4 flex items-center">
        <span className="text-[#cccccc]/80 text-[11px] font-semibold">
          {selectedToken.name}
        </span>
      </div>

      <div className="flex-1 bg-black/30 p-4">
        <div className="space-y-4">
          <div>
            <label className="text-[#cccccc]/70 text-xs mb-2 block">
              Color Value
            </label>
            <input
              type="color"
              value={selectedToken.value}
              onChange={(e) =>
                onUpdateToken(selectedToken.id, { value: e.target.value })
              }
              className="w-full h-8 rounded bg-[#292929]/50 border border-[#ffffff10]"
            />
          </div>

          <div>
            <label className="text-[#cccccc]/70 text-xs mb-2 block">
              Hex Code
            </label>
            <input
              type="text"
              value={selectedToken.value}
              onChange={(e) =>
                onUpdateToken(selectedToken.id, { value: e.target.value })
              }
              className="w-full h-8 px-2 rounded bg-[#292929]/50 border border-[#ffffff10] text-[#cccccc] text-sm"
            />
          </div>

          <div>
            <label className="text-[#cccccc]/70 text-xs mb-2 block">
              Opacity
            </label>
            <input
              type="number"
              value={selectedToken.opacity}
              className="w-full h-8 px-2 rounded bg-[#292929]/50 border border-[#ffffff10] text-[#cccccc] text-sm"
              disabled
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoreEditorSidebar;
