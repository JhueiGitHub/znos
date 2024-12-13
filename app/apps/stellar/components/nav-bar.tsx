// /root/app/apps/stellar/components/nav-bar.tsx
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface NavBarProps {
  currentFolderId?: string;
}

export const NavBar = ({ currentFolderId }: NavBarProps) => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="w-full h-12 flex items-center px-4 bg-[#010203]/30">
      {currentFolderId && (
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-white/5 transition"
        >
          <ChevronLeft className="w-4 h-4 text-[#626581]" />
        </button>
      )}
    </div>
  );
};
