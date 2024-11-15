// /app/apps/flow/components/StreamView.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { StreamWithFlows } from "@/app/types/flow";

interface StreamViewProps {
  streamId: string;
  onFlowSelect: (flowId: string) => void;
}

export const StreamView = ({ streamId, onFlowSelect }: StreamViewProps) => {
  const { data: stream, isLoading } = useQuery<StreamWithFlows>({
    queryKey: ["stream", streamId],
    queryFn: async () => {
      const response = await axios.get(`/api/streams/${streamId}`);
      console.log("[StreamView] Stream data:", response.data);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-[11px] text-[#cccccc]/70">
        Loading streams...
      </div>
    );
  }

  if (!stream?.flows?.length) {
    return (
      <div className="p-8 text-[11px] text-[#cccccc]/70">No flows found</div>
    );
  }

  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <div className="flex flex-wrap gap-8">
        {stream.flows.map((flow) => (
          <Card
            key={flow.id}
            onClick={() => onFlowSelect(flow.id)}
            className="w-[291px] h-[247px] flex-shrink-0 border border-white/[0.09] rounded-[15px] bg-transparent transition-all hover:border-white/20 cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {flow.components?.slice(0, 4).map((component) => (
                  <div
                    key={component.id}
                    className="w-[115px] h-16 rounded-[9px] border border-white/[0.09] flex items-center justify-center"
                  >
                    <span className="text-[#cccccc]/70 text-xs">
                      {component.name}
                    </span>
                  </div>
                ))}

                {/* Fill remaining slots if less than 4 components */}
                {Array.from({
                  length: Math.max(0, 4 - (flow.components?.length || 0)),
                }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-[115px] h-16 rounded-[9px] border border-white/[0.09]"
                  />
                ))}
              </div>

              <div className="pl-px space-y-2.5">
                <h3 className="text-sm font-semibold text-[#cccccc]">
                  {flow.name}
                </h3>
                <div className="flex items-center gap-[3px] text-[11px] text-[#cccccc]/70">
                  <span>{flow.components?.length || 0} components</span>
                  <span className="text-[6px]">•</span>
                  <span>
                    Updated {new Date(flow.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StreamView;
