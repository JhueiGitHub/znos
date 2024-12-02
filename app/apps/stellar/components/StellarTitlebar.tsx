"use client";

import React from "react";
import { useStyles } from "@/app/hooks/useStyles";

export function StellarTitlebar() {
  const { getColor } = useStyles();

  return (
    <div className="h-8 bg-[#010203]/80 flex items-center border-b border-white/10">
      {/* Window controls */}
      <div className="absolute left-3 top-3 flex gap-1.5">
        <div className="w-[8.40px] h-[8.40px] rounded-full bg-[#ff5f57]" />
        <div className="w-[8.40px] h-[8.40px] rounded-full bg-[#febc2e]" />
        <div className="w-[8.40px] h-[8.40px] rounded-full bg-[#28c840]" />
      </div>

      {/* App title - centered */}
      <div className="flex-1 text-center text-sm text-white/90">Stellar</div>
    </div>
  );
}
