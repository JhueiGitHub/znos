// /app/apps/flow/components/canvas/OrionEditorView.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrionFlowEditor from "./OrionFlowEditor";

interface OrionEditorViewProps {
  flowId: string;
  onClose: () => void;
}

export const OrionEditorView = ({ flowId, onClose }: OrionEditorViewProps) => {
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "§") {
        setAreSidebarsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#010203]">
      <div className="w-full h-full relative">
        <div className="absolute inset-0">
          <OrionFlowEditor flowId={flowId} />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          ESC
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#cccccc]/50 text-xs">
          Press § to toggle sidebars
        </div>
      </div>
    </div>
  );
};
