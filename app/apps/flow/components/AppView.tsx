import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useStyles } from "@os/hooks/useStyles";
import { StreamWithFlows } from "@/app/types/flow";
import { useAppStore } from "@/app/store/appStore";
import { AppSkeletonGrid } from "@/app/components/skeletons/AppSkeletons";

interface AppViewProps {
  appId: string;
  onStreamSelect: (streamId: string) => void;
}

export const AppView = ({ appId, onStreamSelect }: AppViewProps) => {
  const { getColor, getFont } = useStyles();
  const { orionConfig, activeOSFlowId } = useAppStore();

  const { data: streams = [], isLoading } = useQuery<StreamWithFlows[]>({
    queryKey: ["app-streams", appId],
    queryFn: async () => {
      const response = await axios.get(`/api/apps/${appId}/streams`);
      return response.data;
    },
  });

  // EVOLVED: Match StreamView's preview rendering exactly
  const renderStreamPreview = (stream: StreamWithFlows) => {
    // EVOLVED: Take first 4 flows only
    const previewFlows = stream.flows.slice(0, 4);

    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {previewFlows.map((flow) => (
          <div
            key={flow.id}
            className="w-[115px] h-16 rounded-[9px] border flex items-center justify-center px-3"
            style={{
              backgroundColor: getColor("Overlaying BG"),
              borderColor: getColor("Brd"),
            }}
          >
            <span
              className="text-xs text-center line-clamp-2"
              style={{
                color: getColor("Text Primary (Hd)"),
                fontFamily: getFont("Text Primary"),
              }}
            >
              {flow.name}
            </span>
          </div>
        ))}

        {/* Fill remaining slots to match StreamView pattern */}
        {[...Array(4 - previewFlows.length)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-[115px] h-16 rounded-[9px] border"
            style={{
              backgroundColor: getColor("Overlaying BG"),
              borderColor: getColor("Brd"),
            }}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <AppSkeletonGrid count={3} />;
  }

  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <div className="flex flex-wrap gap-8">
        {streams.map((stream) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card
              onClick={() => onStreamSelect(stream.id)}
              className="w-[291px] h-[247px] flex-shrink-0 border rounded-[15px] transition-all hover:border-white/20 cursor-pointer"
              style={{
                backgroundColor: getColor("Glass"),
                borderColor: getColor("Brd"),
              }}
            >
              <CardContent className="p-6">
                {renderStreamPreview(stream)}

                <div className="pl-px space-y-2.5">
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      color: getColor("Text Primary (Hd)"),
                      fontFamily: getFont("Text Primary"),
                    }}
                  >
                    {stream.name}
                  </h3>
                  <div
                    className="flex items-center gap-[3px] text-[11px]"
                    style={{
                      color: getColor("Text Secondary (Bd)"),
                      fontFamily: getFont("Text Secondary"),
                    }}
                  >
                    <span>
                      {stream.flows[0]?.components.length || 0} components
                    </span>
                    <span className="text-[6px]">•</span>
                    <span>
                      Updated {new Date(stream.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
