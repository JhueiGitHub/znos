// src/app/layout.tsx
import "./globals.css";
import React from "react";
import OTPWrapper from "@/app/components/custom-otp-input";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Orion",
  description: "The Age Of Architects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="h-screen w-screen bg-black overflow-hidden">
          <OTPWrapper>
            {children}
            <Analytics />
          </OTPWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
