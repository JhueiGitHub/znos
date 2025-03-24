// layout.tsx
import "./globals.css";
import React from "react";

export default function StellarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full overflow-hidden">{children}</div>;
}
