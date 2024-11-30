// app/apps/flow/components/StreamView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { FlowSkeletonGrid } from "@/app/components/skeletons/FlowSkeletons";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

interface ColorComponent {
  id: string;
  name: string;
  type: "COLOR";
  tokenId: string;
  value: string;
  order: number;
}

interface Flow {
  id: string;
  name: string;
  description: string | null;
  components: ColorComponent[];
  updatedAt: string;
}

interface Stream {
  id: string;
  name: string;
  type: "CORE" | "CONFIG";
  flows: Flow[];
}

interface StreamViewProps {
  streamId: string;
  onFlowSelect: (flowId: string) => void;
}

export const StreamView = ({ streamId, onFlowSelect }: StreamViewProps) => {
  const { getColor, getFont } = useStyles();
  const queryClient = useQueryClient();
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  const { data: stream, isLoading } = useQuery<Stream>({
    queryKey: ["stream", streamId],
    queryFn: async () => {
      const response = await axios.get(`/api/streams/${streamId}`);
      console.log("Stream response:", response.data);
      return response.data;
    },
  });

  // PRESERVED: Original flow duplication
  const handleDuplicateFlow = async (flowId: string, flowName: string) => {
    setIsDuplicating(flowId);
    try {
      await axios.post(`/api/flows/${flowId}/duplicate`);
      queryClient.invalidateQueries(["stream", streamId]);
      toast.success(`Successfully duplicated "${flowName}"`);
    } catch (error) {
      console.error("Failed to duplicate flow:", error);
      toast.error(`Failed to duplicate "${flowName}"`);
    } finally {
      setIsDuplicating(null);
    }
  };

  // PRESERVED: XP publishing functionality
  const { mutate: publishToXP } = useMutation({
    mutationFn: async (flowId: string) => {
      setIsPublishing(flowId);
      const response = await axios.post(`/api/xp/publications`, {
        flowId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["xp-profile"]);
      queryClient.invalidateQueries(["published-flows"]);
      toast.success("Design system published to XP successfully!");
    },
    onError: () => {
      toast.error("Failed to publish design system");
    },
    onSettled: () => {
      setIsPublishing(null);
    },
  });

  if (isLoading) {
    return <FlowSkeletonGrid count={6} />;
  }

  // EVOLVED: Fixed component preview rendering
  const renderFlowPreview = (flow: Flow) => {
    const components = flow.components
      .filter((c) => c.type === "COLOR")
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(0, 4); // FIXED: Only take first 4

    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {components.map((component) => (
          <div
            key={component.id}
            className="w-[115px] h-16 rounded-[9px] border flex items-center justify-center"
            style={{
              backgroundColor: getColor("Overlaying BG"),
              borderColor: getColor("Brd"),
            }}
          >
            {/* EVOLVED: Clean circular preview with working color pattern */}
            <div
              className="w-10 h-10 rounded-full"
              style={{
                backgroundColor: getColor(component.tokenId),
                border: `1px solid ${getColor("Brd")}`,
              }}
            />
          </div>
        ))}

        {[...Array(4 - components.length)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-[115px] h-16 rounded-[9px] border flex items-center justify-center"
            style={{
              backgroundColor: getColor("Overlaying BG"),
              borderColor: getColor("Brd"),
            }}
          />
        ))}
      </div>
    );
  };

  if (!stream) return null;

  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <div className="flex flex-wrap gap-8">
        {stream.flows.map((flow) => (
          <ContextMenu key={flow.id}>
            <ContextMenuTrigger>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <Card
                  onClick={() => onFlowSelect(flow.id)}
                  className="w-[291px] h-[247px] flex-shrink-0 border rounded-[15px] transition-all hover:border-white/20 cursor-pointer"
                  style={{
                    backgroundColor: getColor("Glass"),
                    borderColor: getColor("Brd"),
                  }}
                >
                  <CardContent className="p-6">
                    {renderFlowPreview(flow)}

                    <div className="pl-px space-y-2.5">
                      <h3
                        className="text-sm font-semibold"
                        style={{
                          color: getColor("Text Primary (Hd)"),
                          fontFamily: getFont("Text Primary"),
                        }}
                      >
                        {flow.name}
                      </h3>
                      <div
                        className="flex items-center gap-[3px] text-[11px]"
                        style={{
                          color: getColor("Text Secondary (Bd)"),
                          fontFamily: getFont("Text Secondary"),
                        }}
                      >
                        <span>{flow.components.length} components</span>
                        <span className="text-[6px]">•</span>
                        <span>
                          Updated{" "}
                          {new Date(flow.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ContextMenuTrigger>
            <ContextMenuContent
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              {stream.type === "CONFIG" && (
                <>
                  <ContextMenuItem
                    onClick={() => publishToXP(flow.id)}
                    disabled={isPublishing === flow.id}
                    style={{
                      color: getColor("Text Primary (Hd)"),
                      fontFamily: getFont("Text Primary"),
                    }}
                  >
                    {isPublishing === flow.id ? "Publishing..." : "Add to XP"}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem
                onClick={() => handleDuplicateFlow(flow.id, flow.name)}
                disabled={isDuplicating === flow.id}
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                {isDuplicating === flow.id
                  ? "Duplicating..."
                  : "Duplicate Flow"}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
};

export default StreamView;
