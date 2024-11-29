// app/apps/flow/components/editors/OrionEditorView.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useStyles } from "@/app/hooks/useStyles";
import OrionFlowEditor from "./OrionFlowEditor";

interface OrionEditorViewProps {
  flowId: string;
  onClose: () => void;
}

export const OrionEditorView = ({ flowId, onClose }: OrionEditorViewProps) => {
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);
  const { getColor } = useStyles();

  // Add query to check flow data loading state
  const { data: flow, isLoading } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const response = await axios.get<{
        name: string;
        components: any[];
      }>(`/api/flows/${flowId}`);
      return response.data;
    },
  });

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

  const EditorSkeleton = () => (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm">
      {/* Left Sidebar Skeleton */}
      <div className="absolute left-0 top-0 bottom-0 w-[264px] border-r border-white/[0.09]">
        <Skeleton className="h-[57px] w-full bg-white/5" />
        <div className="p-4 space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full bg-white/5" />
          ))}
        </div>
      </div>

      {/* Canvas Area Skeleton */}
      <div className="absolute left-[264px] right-[264px] top-0 bottom-0">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: "80px",
              height: "80px",
              left: `${25 + i * 15}%`,
              top: "40%",
            }}
          />
        ))}
      </div>

      {/* Right Sidebar Skeleton */}
      <div className="absolute right-0 top-0 bottom-0 w-[264px] border-l border-white/[0.09]">
        <Skeleton className="h-10 w-full bg-white/5" />
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#010203]">
      <div className="w-full h-full relative">
        {isLoading ? (
          <EditorSkeleton />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default OrionEditorView;
