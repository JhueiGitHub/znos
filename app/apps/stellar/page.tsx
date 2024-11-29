import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useStyles } from "@/app/hooks/useStyles";
import { Button } from "@/components/ui/button";
import { StellarView } from "./components/StellarView";
import { StellarSidebar } from "./components/StellarSidebar";
import { StellarToolbar } from "./components/StellarToolbar";

export default function StellarApp() {
  const { getColor, getFont } = useStyles();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Query stellar profile status using same pattern as XP
  const { data: stellarProfile, isLoading } = useQuery({
    queryKey: ["stellar-profile"],
    queryFn: async () => {
      const response = await axios.get("/api/stellar/profile");
      return response.data;
    },
  });

  // Initialize stellar account using same pattern as XP
  const { mutate: createStellarAccount } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/stellar/profile");
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["stellar-profile"], data);
      setIsCreating(false);
    },
    onError: () => {
      setIsCreating(false);
    },
  });

  if (isLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          color: getColor("Text Secondary (Bd)"),
          fontFamily: getFont("Text Secondary"),
        }}
      >
        Loading...
      </div>
    );
  }

  // Account creation screen
  if (!stellarProfile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Button
            onClick={() => {
              setIsCreating(true);
              createStellarAccount();
            }}
            disabled={isCreating}
            className="px-6 py-3 text-sm"
            style={{
              backgroundColor: getColor("Lilac Accent"),
              color: getColor("Text Primary (Hd)"),
              fontFamily: getFont("Text Primary"),
            }}
          >
            {isCreating ? "Creating..." : "Create Stellar Account"}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main Finder Interface
  return (
    <div className="h-screen flex flex-col bg-black/80">
      <StellarToolbar />
      <div className="flex-1 flex">
        <StellarSidebar />
        <StellarView />
      </div>
    </div>
  );
}
