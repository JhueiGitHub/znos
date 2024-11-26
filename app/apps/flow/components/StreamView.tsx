// app/apps/flow/components/StreamView.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { StreamWithFlows } from "@/app/types/flow";
import { useStyles } from "@os/hooks/useStyles";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

interface StreamViewProps {
  streamId: string;
  onFlowSelect: (flowId: string) => void;
  isCommunity?: boolean; // Made optional with default false
}

export const StreamView = ({
  streamId,
  onFlowSelect,
  isCommunity = false,
}: StreamViewProps) => {
  const { getColor, getFont } = useStyles();
  const queryClient = useQueryClient();
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  const { data: stream, isLoading } = useQuery<StreamWithFlows>({
    queryKey: ["stream", streamId],
    queryFn: async () => {
      const response = await axios.get(`/api/streams/${streamId}`);
      console.log("[StreamView] Stream data:", response.data);
      return response.data;
    },
  });

  const handleDuplicateFlow = async (flowId: string, flowName: string) => {
    setIsDuplicating(flowId);
    try {
      const response = await axios.post(`/api/flows/${flowId}/duplicate`);
      queryClient.invalidateQueries(["stream", streamId]);
      toast.success(`Successfully duplicated "${flowName}"`);
    } catch (error) {
      console.error("Failed to duplicate flow:", error);
      toast.error(`Failed to duplicate "${flowName}"`);
    } finally {
      setIsDuplicating(null);
    }
  };

  // NEW: Publish to XP mutation
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
    return (
      <div
        className="p-8 text-[11px]"
        style={{
          color: getColor("Text Secondary (Bd)"),
          fontFamily: getFont("Text Secondary"),
        }}
      >
        Loading streams...
      </div>
    );
  }

  if (!stream?.flows?.length) {
    return (
      <div
        className="p-8 text-[11px]"
        style={{
          color: getColor("Text Secondary (Bd)"),
          fontFamily: getFont("Text Secondary"),
        }}
      >
        No flows found
      </div>
    );
  }

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
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {flow.components?.slice(0, 4).map((component) => (
                        <div
                          key={component.id}
                          className="w-[115px] h-16 rounded-[9px] border flex items-center justify-center"
                          style={{
                            borderColor: getColor("Brd"),
                            backgroundColor: getColor("Overlaying BG"),
                          }}
                        >
                          <span
                            className="text-xs"
                            style={{
                              color: getColor("Text Secondary (Bd)"),
                              fontFamily: getFont("Text Secondary"),
                            }}
                          >
                            {component.name}
                          </span>
                        </div>
                      ))}

                      {Array.from({
                        length: Math.max(0, 4 - (flow.components?.length || 0)),
                      }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="w-[115px] h-16 rounded-[9px] border"
                          style={{
                            borderColor: getColor("Brd"),
                            backgroundColor: getColor("Overlaying BG"),
                          }}
                        />
                      ))}
                    </div>

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
                        <span>{flow.components?.length || 0} components</span>
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
              {/* NEW: Show Add to XP option only for Orion config flows */}
              {stream?.type === "CONFIG" && stream?.appId === "orion" && (
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
