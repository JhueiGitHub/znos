// /root/app/apps/monopoly/page.tsx
"use client";

import dynamic from "next/dynamic";

const SetupPage = dynamic(() => import("./App"), { ssr: false });

export default function MonopolyPage() {
  return <SetupPage />;
}
