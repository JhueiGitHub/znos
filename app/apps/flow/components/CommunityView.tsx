// app/apps/flow/components/CommunityView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useStyles } from "@os/hooks/useStyles";
import { Button } from "@/components/ui/button";
import { XPProfileView } from "@/app/components/xp/XPProfileView";
import { toast } from "sonner";
import { XPProfile } from "@/app/types/xp";

export const CommunityView = () => {
  const { getColor, getFont } = useStyles();
  const queryClient = useQueryClient();
  
  // Query current user's XP profile
  const { data: profile, isLoading } = useQuery<XPProfile>({
    queryKey: ["xp-profile"],
    queryFn: async () => {
      const response = await axios.get("/api/xp/profile");
      return response.data;
    }
  });

  // XP account creation
  const { mutate: createXPProfile, isLoading: isCreating } = useMutation({
    mutationFn: async () => {
      const xpProfileData = {
        name: "New XP Creator",
        imageUrl: "/media/default-avatar.png", 
        description: "A new creator on XP",
        stats: {
          totalDownloads: 0,
          totalEarned: 0,
          designSystemsPublished: 0
        }
      };
      
      console.log("Creating XP Profile:", xpProfileData);
      const response = await axios.post("/api/xp/profile", xpProfileData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["xp-profile"], data);
      toast.success("XP Profile created successfully!");
    },
    onError: () => {
      toast.error("Failed to create XP profile");
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 px-[33px] py-5 flex items-center justify-center">
        <span
          style={{
            color: getColor("Text Secondary (Bd)"),
            fontFamily: getFont("Text Secondary"),
          }}
        >
          Loading...
        </span>
      </div>
    );
  }

  // Show XP Profile if exists
  if (profile) {
    return (
      <div className="flex-1 min-w-0 px-[33px] py-5">
        <XPProfileView profile={profile} />
      </div>
    );
  }

  // Show creation button if no profile exists
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
            backgroundColor: getColor("Lilac Accent"),
            color: getColor("Text Primary (Hd)"),
            fontFamily: getFont("Text Primary"),
          }}
        >
          {isCreating ? "Creating..." : "Create XP Account"}
        </Button>
      </motion.div>
    </div>
  );
};

export default CommunityView;