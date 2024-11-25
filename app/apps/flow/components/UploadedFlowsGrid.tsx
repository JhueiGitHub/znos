// app/apps/flow/components/UploadedFlowsGrid.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { Card, CardContent } from "@/components/ui/card";
import { XPProfile } from "@/app/types/xp";

interface UploadedFlowsGridProps {
  profile: XPProfile;
  onPublicationSelect: (publicationId: string) => void;
}

interface Publication {
  id: string;
  name: string;
  description: string;
  previewImageUrl?: string;
  downloads: number;
  price: number;
}

export const UploadedFlowsGrid = ({
  profile,
  onPublicationSelect,
}: UploadedFlowsGridProps) => {
  const { getColor, getFont } = useStyles();

  const { data: publications, isLoading } = useQuery({
    queryKey: ["published-flows", profile.id],
    queryFn: async () => {
      const response = await axios.get("/api/xp/publications");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div
        className="text-sm"
        style={{ color: getColor("Text Secondary (Bd)") }}
      >
        Loading publications...
      </div>
    );
  }

  if (!publications?.length) {
    return (
      <div
        className="text-center p-8 border rounded-lg"
        style={{
          borderColor: getColor("Brd"),
          backgroundColor: getColor("Glass"),
          color: getColor("Text Secondary (Bd)"),
        }}
      >
        <p>No design systems published yet</p>
        <p className="text-sm mt-2">
          Right-click an Orion flow to publish it to XP
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {publications.map((pub: Publication, index: number) => (
        <motion.div
          key={pub.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onPublicationSelect(pub.id)}
        >
          <Card
            className="h-[200px] cursor-pointer hover:border-white/20 transition-colors relative group overflow-hidden"
            style={{
              backgroundColor: getColor("Glass"),
              borderColor: getColor("Brd"),
            }}
          >
            <CardContent className="p-6 relative z-10">
              {/* Preview Image with Gradient Overlay */}
              {pub.previewImageUrl && (
                <div
                  className="absolute inset-0 z-0 opacity-30 group-hover:opacity-40 transition-opacity"
                  style={{
                    backgroundImage: `url(${pub.previewImageUrl || "/media/_emptyimage.png"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />

              <div className="relative z-10">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{
                    color: getColor("Text Primary (Hd)"),
                    fontFamily: getFont("Text Primary"),
                  }}
                >
                  {pub.name}
                </h3>
                <p
                  className="text-sm line-clamp-2"
                  style={{
                    color: getColor("Text Secondary (Bd)"),
                    fontFamily: getFont("Text Secondary"),
                  }}
                >
                  {pub.description || "//TO-DO Implement Descriptions"}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className="text-sm"
                    style={{ color: getColor("Text Secondary (Bd)") }}
                  >
                    <span className="font-medium">{pub.downloads}</span>{" "}
                    downloads
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: getColor("Text Secondary (Bd)") }}
                  >
                    <span className="font-medium">${pub.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
