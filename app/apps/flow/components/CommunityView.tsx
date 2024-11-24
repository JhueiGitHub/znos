// app/apps/flow/components/CommunityView.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { StreamWithFlows } from "@/app/types/flow";
import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";

interface CommunityProfile {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  streams: StreamWithFlows[];
}

interface CreatorCardProps {
  profile: CommunityProfile;
  onSelect: (profileId: string) => void;
}

const CreatorCard = ({ profile, onSelect }: CreatorCardProps) => {
  const { getColor, getFont } = useStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <Card
        onClick={() => onSelect(profile.id)}
        className="w-[291px] h-[247px] flex-shrink-0 border rounded-[15px] transition-all hover:border-white/20 cursor-pointer overflow-hidden"
        style={{
          backgroundColor: getColor("Glass"),
          borderColor: getColor("Brd"),
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full border overflow-hidden flex items-center justify-center"
              style={{ borderColor: getColor("Brd") }}
            >
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-semibold mb-1 truncate"
                style={{
                  color: getColor("Text Primary (Hd)"),
                  fontFamily: getFont("Text Primary"),
                }}
              >
                {profile.name}
              </h3>
              <p
                className="text-sm truncate"
                style={{
                  color: getColor("Text Secondary (Bd)"),
                  fontFamily: getFont("Text Secondary"),
                }}
              >
                {profile.description}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {profile.streams.map((stream) => (
              <div
                key={stream.id}
                className="flex items-center gap-2 p-2 rounded-md border"
                style={{
                  backgroundColor: getColor("Overlaying BG"),
                  borderColor: getColor("Brd"),
                }}
              >
                <div
                  className="w-8 h-8 rounded-md border overflow-hidden flex items-center justify-center"
                  style={{ borderColor: getColor("Brd") }}
                >
                  <img
                    src={
                      stream.appId === "orion"
                        ? "/icns/_orion.png"
                        : "/icns/_flow.png"
                    }
                    alt={stream.name}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-sm font-medium truncate"
                    style={{
                      color: getColor("Text Primary (Hd)"),
                      fontFamily: getFont("Text Primary"),
                    }}
                  >
                    {stream.name}
                  </h4>
                  <p
                    className="text-xs truncate"
                    style={{
                      color: getColor("Text Secondary (Bd)"),
                      fontFamily: getFont("Text Secondary"),
                    }}
                  >
                    {stream.flows.length}{" "}
                    {stream.flows.length === 1 ? "flow" : "flows"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const CommunityView = () => {
  const { getColor, getFont } = useStyles();

  const { data: profiles, isLoading } = useQuery<CommunityProfile[]>({
    queryKey: ["community-profiles"],
    queryFn: async () => {
      const response = await axios.get("/api/community/profiles");
      return response.data;
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
        Loading creators...
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 px-[33px] py-5">
      <div className="flex flex-wrap gap-8">
        {profiles?.map((profile) => (
          <CreatorCard
            key={profile.id}
            profile={profile}
            onSelect={(profileId) => {
              // TODO: Navigate to creator's streams when implemented
              console.log("Selected creator:", profileId);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunityView;
