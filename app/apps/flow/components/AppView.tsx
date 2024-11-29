// /app/apps/flow/components/AppView.tsx
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

  // EVOLVED: Direct access to global dock state
  const { orionConfig, activeOSFlowId } = useAppStore();

  const { data: streams = [], isLoading } = useQuery<StreamWithFlows[]>({
    queryKey: ["app-streams", appId],
    queryFn: async () => {
      const response = await axios.get(`/api/apps/${appId}/streams`);
      return response.data;
    },
  });

  const renderStreamPreview = (stream: StreamWithFlows) => {
    const latestFlow = stream.flows[0];
    if (!latestFlow?.components) return null;

    // EVOLVED: Simple wallpaper check
    const wallpaper =
      latestFlow.id === activeOSFlowId && orionConfig?.wallpaper
        ? orionConfig.wallpaper
        : latestFlow.components.find((c) => c.type === "WALLPAPER");

    // EVOLVED: Simple dock icon source selection
    const dockIcons =
      latestFlow.id === activeOSFlowId && orionConfig?.dockIcons
        ? orionConfig.dockIcons
        : latestFlow.components
            .filter((c) => c.type === "DOCK_ICON")
            .sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Wallpaper with clean conditional */}
        <div className="col-span-2 w-full h-24 rounded-[9px] overflow-hidden border border-white/[0.09]">
          <div
            className="w-full h-full"
            style={{
              backgroundColor:
                wallpaper?.mode === "color"
                  ? getColor(wallpaper.tokenId || "Black")
                  : undefined,
              backgroundImage:
                wallpaper?.mode === "media" && wallpaper.value
                  ? `url(${wallpaper.value})`
                  : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.7,
            }}
          />
        </div>

        {/* Clean dock icon rendering */}
        {dockIcons.slice(0, 4).map((icon) => (
          <div
            key={icon.id}
            className="aspect-square rounded-[9px] border border-white/[0.09] flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: getColor("Overlaying BG"),
            }}
          >
            {icon.mode === "color" ? (
              <div
                className="w-8 h-8 rounded-md"
                style={{
                  backgroundColor: getColor(icon.tokenId || "Graphite"),
                }}
              />
            ) : (
              <img
                src={icon.value || "/icns/_dock.png"}
                alt="Dock icon"
                className="w-8 h-8 object-contain opacity-70"
              />
            )}
          </div>
        ))}

        {/* Fill remaining slots */}
        {[...Array(Math.max(0, 4 - dockIcons.length))].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-[9px] border border-white/[0.09] flex items-center justify-center"
            style={{
              backgroundColor: getColor("Overlaying BG"),
            }}
          >
            <div
              className="w-8 h-8 rounded-md"
              style={{
                backgroundColor: getColor("Graphite"),
                opacity: 0.3,
              }}
            />
          </div>
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
