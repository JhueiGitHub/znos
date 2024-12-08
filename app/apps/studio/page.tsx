// /root/app/apps/studio/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useStyles } from "@/app/hooks/useStyles";

// PRESERVED: Original dynamic import pattern for OS apps
const StudioApp = dynamic(() => import("./App"), { ssr: false });

// EVOLVED: Studio app root with styling context
export default function StudioPage() {
  const { getColor } = useStyles();

  return (
    <div className="h-full w-full flex flex-col">
      <StudioApp />
    </div>
  );
}
