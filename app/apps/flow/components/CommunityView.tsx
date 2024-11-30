// app/apps/flow/components/CommunityView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { Button } from "@/components/ui/button";
import { XPProfileView } from "@/app/components/xp/XPProfileView";
import { toast } from "sonner";
import { XPProfile } from "@/app/types/xp";
import { useState } from "react";
import { UploadedFlowsGrid } from "./UploadedFlowsGrid";
import { FlowSkeletonGrid } from "@/app/components/skeletons/FlowSkeletons";
import { PublicationView } from "./PublicationView";
import { User } from "lucide-react";
import { FlowHeader } from "./FlowHeader";
import "../../../globals.css";

interface CommunityViewProps {
  isFullscreen?: boolean;
}

type ViewState = "flows" | "profile" | "publication";

interface ViewStateData {
  type: ViewState;
  publicationId?: string;
}

export const CommunityView = ({ isFullscreen = false }: CommunityViewProps) => {
  const { getColor, getFont } = useStyles();
  const queryClient = useQueryClient();
  const [viewState, setViewState] = useState<ViewStateData>({ type: "flows" });

  const { data: profile, isLoading } = useQuery<XPProfile>({
    queryKey: ["xp-profile"],
    queryFn: async () => {
      const response = await axios.get("/api/xp/profile");
      return response.data;
    },
  });

  const { mutate: createXPProfile, isLoading: isCreating } = useMutation({
    mutationFn: async () => {
      const xpProfileData = {
        name: "New XP Creator",
        imageUrl: "/media/default-avatar.png",
        description: "A new creator on XP",
        stats: {
          totalDownloads: 0,
          totalEarned: 0,
          designSystemsPublished: 0,
        },
      };

      const response = await axios.post("/api/xp/profile", xpProfileData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["xp-profile"], data);
      toast.success("XP Profile created successfully!");
    },
    onError: () => {
      toast.error("Failed to create XP profile");
    },
  });

  const handlePublicationSelect = (publicationId: string) => {
    setViewState({ type: "publication", publicationId });
  };

  if (isLoading) {
    return <FlowSkeletonGrid count={9} />; // Show more items for community view
  }

  if (!profile) {
    return (
      <div className="flex-1 min-w-0 px-[33px] py-5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Button
            onClick={() => createXPProfile()}
            disabled={isCreating}
            className="px-6 py-3 text-sm"
            style={{
              backgroundColor: getColor("latte"),
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {isCreating ? "Creating..." : "Create XP Account"}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Handle publication view
  if (viewState.type === "publication" && viewState.publicationId) {
    return (
      <PublicationView
        publicationId={viewState.publicationId}
        onBack={() => setViewState({ type: "flows" })}
      />
    );
  }

  // Regular community view with header
  return (
    <div className="scrollbar-hide">
      {!isFullscreen && (
        <FlowHeader
          title="Community"
          subtitle="Discover Themes"
          onBack={null}
          currentView="community"
        />
      )}
      <div className="flex-1 min-w-0 px-[33px] py-5">
        {/* Header with view toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-2xl font-semibold"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {viewState.type === "flows"
              ? "Published Design Systems"
              : "Creator Profile"}
          </h1>
          <Button
            onClick={() =>
              setViewState({
                type: viewState.type === "flows" ? "profile" : "flows",
              })
            }
            className="gap-2 border-solid border-[0.6px] border-[#4C4F69]/70 hover:border-[#4C4F69] bg-red-500 bg-opacity-0 hover:bg-red-500 hover:bg-opacity-0"
            style={{
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {viewState.type === "flows" ? (
              <>
                <img src="/icns/_xp.png" alt="Community" className="w-4 h-4" />
                View Profile
              </>
            ) : (
              <>
                <img
                  src="/icns/_community.png"
                  alt="Flows"
                  className="w-4 h-4"
                />
                View Flows
              </>
            )}
          </Button>
        </div>

        {/* View content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewState.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {viewState.type === "flows" ? (
              <UploadedFlowsGrid
                profile={profile}
                onPublicationSelect={handlePublicationSelect}
              />
            ) : (
              <XPProfileView profile={profile} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityView;
