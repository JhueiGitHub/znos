import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useSpring } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { FlowSkeletonGrid } from "@/app/components/skeletons/FlowSkeletons";
import { useEffect, useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import "./globals.css";
import XPGlowCard from "./XPGlowCard";
import MysticalGlowCard from "./XPGlowCard";

// PRESERVED: Original interfaces with enhanced ColorComponent
interface ColorComponent {
  id: string;
  name: string;
  type: "COLOR";
  tokenId: string;
  value: string;
  order: number;
}

// PRESERVED: Rest of interfaces
interface Flow {
  id: string;
  name: string;
  description: string | null;
  components: ColorComponent[];
  updatedAt: string;
  // Add new field
  isPublished?: boolean;
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
  const [renamingFlowId, setRenamingFlowId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // PRESERVED: Original query
  const { data: stream, isLoading } = useQuery<Stream>({
    queryKey: ["stream", streamId],
    queryFn: async () => {
      const response = await axios.get(`/api/streams/${streamId}`);
      console.log("Stream API response:", response.data);
      console.log(
        "First flow components:",
        response.data?.flows[0]?.components
      );
      return response.data;
    },
  });

  const { data: publishedFlowsMap = {} } = useQuery({
    queryKey: ["published-flows"],
    queryFn: async () => {
      const response = await axios.get("/api/xp/published-flows");
      return response.data;
    },
  });

  // PRESERVED: Original handlers
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

  // PRESERVED: XP mutation
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
      queryClient.invalidateQueries(["published-flows"]); // Add this
      toast.success("Design system published to XP successfully!");
    },
    onError: () => {
      toast.error("Failed to publish design system");
    },
    onSettled: () => {
      setIsPublishing(null);
    },
  });

  // Add rename mutation
  const { mutate: renameFlow } = useMutation({
    mutationFn: async ({ flowId, name }: { flowId: string; name: string }) => {
      const response = await axios.patch(`/api/flows/${flowId}`, { name });
      return response.data;
    },
    onSuccess: (updatedFlow) => {
      // Update the cache directly instead of invalidating
      queryClient.setQueryData(["stream", streamId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          flows: oldData.flows.map((flow: any) =>
            flow.id === updatedFlow.id
              ? { ...flow, name: updatedFlow.name }
              : flow
          ),
        };
      });
      toast.success("Flow renamed successfully");
      setRenamingFlowId(null);
    },
    onError: () => {
      toast.error("Failed to rename flow");
      setRenamingFlowId(null);
    },
  });

  // Focus input when renaming starts
  useEffect(() => {
    if (renamingFlowId && nameInputRef.current) {
      nameInputRef.current.focus();
      // This will select all text immediately
      nameInputRef.current.select();
    }
  }, [renamingFlowId]);

  // Handle rename start
  const handleRenameStart = (flowId: string) => {
    setRenamingFlowId(flowId);
  };

  // Handle rename submit
  const handleRenameSubmit = (flowId: string, newName: string) => {
    if (newName.trim()) {
      renameFlow({ flowId, name: newName });
    } else {
      setRenamingFlowId(null);
    }
  };

  if (isLoading) {
    return <FlowSkeletonGrid count={6} />;
  }

  // EVOLVED: Component preview rendering with logging
  const renderFlowPreview = (flow: Flow) => {
    console.log("Flow being rendered:", flow);
    console.log("Flow components:", flow.components);

    const colorComponents = flow.components
      .filter((c) => c.type === "COLOR")
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(0, 4);

    console.log("Filtered color components:", colorComponents);

    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {colorComponents.map((component) => {
          console.log("Rendering component:", component);
          console.log("Using color token:", component.tokenId);

          return (
            <div
              key={component.id}
              className="w-[115px] h-16 rounded-[9px] border flex items-center justify-center"
              style={{
                backgroundColor: getColor("Overlaying BG"),
                borderColor: getColor("Brd"),
              }}
            >
              <div
                className="w-10 h-10 rounded-full"
                style={{
                  backgroundColor: getColor(component.tokenId),
                  border: `1px solid ${getColor("Brd")}`,
                  opacity: 1, // Making sure it's visible
                }}
              />
            </div>
          );
        })}

        {[...Array(4 - colorComponents.length)].map((_, i) => (
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

  // PRESERVED: Original render
  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <motion.div
        ref={scrollRef}
        className="flex flex-wrap gap-8 max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-hide"
        style={{
          backgroundColor: getColor("Glass"),
          scrollBehavior: "smooth",
        }}
      >
        {stream.flows.map((flow) => (
          <ContextMenu key={flow.id}>
            <ContextMenuTrigger>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <MysticalGlowCard
                  isAddedToXP={Boolean(publishedFlowsMap[flow.id])}
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
                        {renamingFlowId === flow.id ? (
                          <input
                            ref={nameInputRef}
                            defaultValue={flow.name}
                            className="text-sm font-semibold w-full px-2 py-1 rounded outline-none"
                            style={{
                              backgroundColor: "rgba(76, 79, 105, 0.3)",
                              color: getColor("Text Primary (Hd)"),
                              fontFamily: getFont("Text Primary"),
                            }}
                            onBlur={(e) =>
                              handleRenameSubmit(flow.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleRenameSubmit(
                                  flow.id,
                                  e.currentTarget.value
                                );
                              } else if (e.key === "Escape") {
                                setRenamingFlowId(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h3
                            className="text-sm font-semibold"
                            style={{
                              color: getColor("Text Primary (Hd)"),
                              fontFamily: getFont("Text Primary"),
                            }}
                          >
                            {flow.name}
                          </h3>
                        )}
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
                </MysticalGlowCard>
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
                  <ContextMenuItem
                    onClick={() => handleRenameStart(flow.id)}
                    style={{
                      color: getColor("Text Primary (Hd)"),
                      fontFamily: getFont("Text Primary"),
                    }}
                  >
                    Rename
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
      </motion.div>
    </div>
  );
};

export default StreamView;
