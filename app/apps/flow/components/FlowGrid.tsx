import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

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
}

export const FlowGrid = ({
  onStreamSelect,
}: {
  onStreamSelect: (streamId: string) => void;
}) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div className="p-8 text-[#cccccc]/70">Loading streams...</div>;
  }

  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <div className="flex flex-wrap gap-8">
        {streams.map((stream) => (
          <Card
            key={stream.id}
            onClick={() => onStreamSelect(stream.id)}
            className="w-[291px] h-[247px] flex-shrink-0 border border-white/[0.09] rounded-[15px] bg-transparent transition-all hover:border-white/20 cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {stream.flows[0]?.components.slice(0, 4).map((component, i) => (
                  <div
                    key={component.id}
                    className="w-[115px] h-16 rounded-[9px] border border-white/[0.09] flex items-center justify-center"
                  >
                    <span className="text-[#cccccc]/70 text-xs">
                      {component.value ? component.name : "Empty"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pl-px space-y-2.5">
                <h3 className="text-sm font-semibold text-[#cccccc]">
                  {stream.name}
                </h3>
                <div className="flex items-center gap-[3px] text-[11px] text-[#cccccc]/70">
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
        ))}
      </div>
    </div>
  );
};
