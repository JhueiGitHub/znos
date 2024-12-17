// /root/app/apps/stellar/[folderId]/page.tsx
"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../App"), { ssr: false });

export default function StellarFolderPage({
  params,
}: {
  params: { folderId: string };
}) {
  return <App initialFolderId={params.folderId} />;
}
