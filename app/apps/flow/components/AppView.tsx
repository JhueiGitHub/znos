// /app/apps/flow/components/AppView.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useStyles } from "@os/hooks/useStyles";
import { StreamWithFlows } from "@/app/types/flow";
import { useEffect } from "react";

interface AppViewProps {
  appId: string;
  onStreamSelect: (streamId: string) => void;
}

export const AppView = ({ appId, onStreamSelect }: AppViewProps) => {
  const { getColor, getFont } = useStyles();

  const { data: streams = [], isLoading } = useQuery<StreamWithFlows[]>({
    queryKey: ["app-streams", appId],
    queryFn: async () => {
      console.log("[AppView] Fetching streams for appId:", appId);
      const response = await axios.get(`/api/apps/${appId}/streams`);
      console.log("[AppView] Received streams:", response.data);
      return response.data;
    },
  });

  useEffect(() => {
    console.log("[AppView] Current streams:", streams);
  }, [streams]);

  const renderStreamPreview = (stream: StreamWithFlows) => {
    const latestFlow = stream.flows[0];
    if (!latestFlow?.components) return null;

    const componentsByType = latestFlow.components.reduce(
      (acc, component) => {
        if (!acc[component.type]) {
          acc[component.type] = [];
        }
        acc[component.type].push(component);
        return acc;
      },
      {} as Record<string, typeof latestFlow.components>
    );

    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {componentsByType["WALLPAPER"]?.[0] && (
          <div className="col-span-2 w-full h-24 rounded-[9px] overflow-hidden border border-white/[0.09]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${componentsByType["WALLPAPER"][0].value})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.7,
              }}
            />
          </div>
        )}

        {componentsByType["DOCK_ICON"]?.map((icon) => (
          <div
            key={icon.id}
            className="aspect-square rounded-[9px] border border-white/[0.09] flex items-center justify-center"
            style={{
              backgroundColor: getColor("Overlaying BG"),
            }}
          >
            <img
              src={icon.value || ""}
              alt={icon.name}
              className="w-8 h-8 object-contain opacity-70"
            />
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className="p-8 text-[11px]"
        style={{
          color: getColor("Text Secondary (Bd)"),
          fontFamily: getFont("Text Primary"),
        }}
      >
        Loading streams...
      </div>
    );
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
              className="w-[291px] h-[247px] flex-shrink-0 border border-white/[0.09] rounded-[15px] transition-all hover:border-white/20 cursor-pointer"
              style={{
                backgroundColor: getColor("Glass"),
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
