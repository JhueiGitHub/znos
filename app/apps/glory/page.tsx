// /root/app/apps/glory/page.tsx
"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("./App"), { ssr: false });

export default function GloryPage() {
  return <App />;
}
