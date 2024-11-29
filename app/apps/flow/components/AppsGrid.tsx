// /app/apps/flow/components/AppsGrid.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useStyles } from "@os/hooks/useStyles";
import { useAppStore } from "@/app/store/appStore";
import { AppSkeletonGrid } from "@/app/components/skeletons/AppSkeletons";
import { appDefinitions } from "@/app/types/AppTypes";

interface App {
  id: string;
  name: string;
  updatedAt: string;
}

interface AppsGridProps {
  onAppSelect: (appId: string) => void;
}

export const AppsGrid = ({ onAppSelect }: AppsGridProps) => {
  const { getColor, getFont } = useStyles();
  const orionConfig = useAppStore((state) => state.orionConfig);
  const findAppIcon = orionConfig?.dockIcons?.[0]; // Finder is first icon

  const { data: apps = [], isLoading } = useQuery<App[]>({
    queryKey: ["apps"],
    queryFn: async () => {
      const response = await axios.get("/api/apps");
      return response.data;
    },
  });

  if (isLoading) {
    return <AppSkeletonGrid count={1} />;
  }

  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <div className="flex flex-wrap gap-8">
        {apps.map((app: App) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card
              onClick={() => onAppSelect(app.id)}
              className="w-[240px] h-[247px] flex-shrink-0 border border-white/[0.09] rounded-[15px] transition-all hover:border-white/20 cursor-pointer"
              style={{
                backgroundColor: getColor("Glass"),
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  {/* EVOLVED: Use exact same pattern as floating dock */}
                  <div
                    className="mb-6 flex items-center justify-center w-[120px] h-[120px] rounded-md"
                    style={{
                      backgroundColor:
                        findAppIcon?.mode === "color"
                          ? getColor(findAppIcon.tokenId || "Graphite")
                          : undefined,
                    }}
                  >
                    {findAppIcon?.mode === "media" && (
                      <img
                        src={findAppIcon.value || undefined}
                        alt="Finder"
                        className="w-full h-full object-contain"
                      />
                    )}
                    {!findAppIcon?.value && !findAppIcon?.tokenId && (
                      <div
                        className="w-full h-full rounded-md"
                        style={{ backgroundColor: getColor("Graphite") }}
                      />
                    )}
                  </div>

                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{
                      color: getColor("Text Primary (Hd)"),
                      fontFamily: getFont("Text Primary"),
                    }}
                  >
                    {app.name}
                  </h3>
                  <div
                    className="flex items-center gap-[3px] text-[11px]"
                    style={{
                      color: getColor("Text Secondary (Bd)"),
                      fontFamily: getFont("Text Secondary"),
                    }}
                  >
                    <span>OS Configuration</span>
                    <span className="text-[6px]">•</span>
                    <span>
                      Updated {new Date(app.updatedAt).toLocaleDateString()}
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
