// /app/apps/drift/layout.tsx
// APP-SPECIFIC LAYOUT - Standard Zenithos pattern

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Drift Racer - Zenithos Arcade',
  description: 'High-speed drift racing game built with ThreeJS',
};

export default function DriftGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full overflow-hidden">
      {children}
    </div>
  );
}
