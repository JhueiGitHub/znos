"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Folder as FolderIcon } from "lucide-react";
import { useStyles } from "@/app/hooks/useStyles";
import localFont from "next/font/local";

// Original functionality: Load ExemplarPro font
const exemplarPro = localFont({
  src: "../../../../public/fonts/SFProTextSemibold.ttf",
});

interface StellarFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

interface StellarFolder {
  id: string;
  name: string;
  children: StellarFolder[];
  files: StellarFile[];
}

interface StellarProfile {
  id: string;
  name: string;
  driveCapacity: bigint;
  currentUsage: number;
  rootFolder: StellarFolder;
}

export const FoldersArea = () => {
  const [profile, setProfile] = useState<StellarProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getColor, getFont } = useStyles();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/stellar/folders");
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []);

  // PRESERVED: Loading state with skeleton grid
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 h-full p-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const rootFolder = profile?.rootFolder;
  if (!rootFolder) return null;

  // EVOLVED: Safely access folder.children and folder.files properties
  return (
    <div className="relative h-full flex-1 overflow-auto bg-[#010203]/30 p-4">
      <div className="flex gap-[1px]">
        {rootFolder.children.map((folder) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card
              className="w-[128px] h-[128px] border border-white/[0.00] rounded-[19px] transition-all hover:border-white/[0.15] cursor-pointer"
              style={{ backgroundColor: getColor("Glass") }}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center gap-[6px]">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                  <img
                    src="/apps/stellar/icns/system/_folder.png"
                    alt="Community"
                    className="w-[128px] h-[128px] object-contain"
                  />
                </div>

                <div className="text-center">
                  <h3
                    className="text-[13px] font-semibold truncate max-w-[150px] text-[#626581ca]"
                    style={exemplarPro.style}
                  >
                    {folder.name}
                  </h3>
                  <p
                    className="text-xs mt-1 hidden"
                    style={{
                      color: getColor("Text Secondary (Bd)"),
                      fontFamily: getFont("Text Secondary"),
                    }}
                  >
                    {(folder.children || []).length} folders,{" "}
                    {(folder.files || []).length} files
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
