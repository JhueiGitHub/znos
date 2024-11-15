// /app/apps/flow/components/AppsGrid.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { StreamWithFlows } from "@/app/types/flow";

interface AppsGridProps {
  onAppSelect: (streamId: string) => void;
}

export const AppsGrid = ({ onAppSelect }: AppsGridProps) => {
  const { getColor, getFont } = useStyles();

  const { data: streams = [], isLoading } = useQuery<StreamWithFlows[]>({
    queryKey: ["apps"],
    queryFn: async () => {
      const response = await axios.get("/api/apps");
      return response.data;
    },
  });

  const renderStreamPreview = useCallback(
    (stream: StreamWithFlows) => {
      const latestFlow = stream.flows[0];
      if (!latestFlow?.components) return null;

      return (
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {latestFlow.components
            .sort((a, b) => a.order - b.order)
            .slice(0, 4)
            .map((component) => (
              <div
                key={component.id}
                className="w-[115px] h-16 rounded-[9px] border border-white/[0.09] flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: getColor("Overlaying BG"),
                }}
              >
                {component.type === "WALLPAPER" ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${component.value})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.7,
                    }}
                  />
                ) : component.type === "DOCK_ICON" ? (
                  <img
                    src={component.value || ""}
                    alt={component.name}
                    className="w-8 h-8 object-contain opacity-70"
                  />
                ) : (
                  <span
                    className="text-xs"
                    style={{
                      color: getColor("Text Secondary (Bd)"),
                      fontFamily: getFont("Text Secondary"),
                    }}
                  >
                    {component.name}
                  </span>
                )}
              </div>
            ))}
        </motion.div>
      );
    },
    [getColor, getFont]
  );

  if (isLoading) {
    return (
      <div
        className="p-8 text-[11px]"
        style={{
          color: getColor("Text Secondary (Bd)"),
          fontFamily: getFont("Text Primary"),
        }}
      >
        Loading apps...
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
              onClick={() => onAppSelect(stream.id)}
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
