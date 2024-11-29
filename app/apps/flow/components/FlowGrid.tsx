// components/FlowGrid.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { FlowSkeletonGrid } from "@/app/components/skeletons/FlowSkeletons";
import { motion } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";

interface Stream {
  id: string;
  name: string;
  description: string;
  type: "CORE" | "CONFIG" | "CUSTOM";
  flows: Flow[];
  createdAt: Date;
  updatedAt: Date;
}

interface Flow {
  id: string;
  name: string;
  description: string;
  type: "CORE" | "CONFIG" | "CUSTOM";
  components: FlowComponent[];
}

interface FlowComponent {
  id: string;
  name: string;
  type: string;
  value: string | null;
  mediaUrl?: string;
}

export const FlowGrid = ({
  onStreamSelect,
}: {
  onStreamSelect: (streamId: string) => void;
}) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getColor, getFont } = useStyles();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/streams");
        setStreams(response.data);
      } catch (error) {
        console.error("Failed to fetch streams:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();
  }, []);

  // PRESERVED: Loading state with skeleton grid
  if (isLoading) {
    return <FlowSkeletonGrid count={6} />;
  }

  // EVOLVED: Preview rendering for stream contents
  const renderStreamPreview = (stream: Stream) => {
    // Get up to 4 components from the first flow for preview
    const previewComponents = stream.flows[0]?.components.slice(0, 4) || [];
    const emptySlots = 4 - previewComponents.length;

    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {previewComponents.map((component) => (
          <div
            key={component.id}
            className="w-[115px] h-16 rounded-[9px] border border-white/[0.09] flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: getColor("Overlaying BG") }}
          >
            {component.value ? (
              <img
                src={component.value}
                alt={component.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-xs"
                style={{ color: getColor("Text Secondary (Bd)") }}
              >
                {component.name}
              </span>
            )}
          </div>
        ))}

        {/* PRESERVED: Empty slot rendering */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-[115px] h-16 rounded-[9px] border border-white/[0.09] flex items-center justify-center"
            style={{ backgroundColor: getColor("Overlaying BG") }}
          />
        ))}
      </div>
    );
  };

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
              style={{ backgroundColor: getColor("Glass") }}
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
                      {stream.flows.length}{" "}
                      {stream.flows.length === 1 ? "flow" : "flows"}
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
