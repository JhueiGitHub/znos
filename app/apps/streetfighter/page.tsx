// /root/app/apps/streetfighter/page.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled to prevent canvas rendering issues on server
const StreetFighterApp = dynamic(() => import("./App"), { ssr: false });

export default function StreetFighterPage() {
  return <StreetFighterApp />;
}
