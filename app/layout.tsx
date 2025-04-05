// app/layout.tsx
import "./globals.css";
import React from "react";
import { Toaster } from "sonner";
import OTPWrapper from "@/app/components/custom-otp-input";
import { ClerkProvider } from "@clerk/nextjs";
import { DesignSystemProvider } from "./contexts/DesignSystemContext";
import QueryProvider from "@/app/components/providers/query-provider";
import { SocketProvider } from "./apps/discord/components/providers/socket-provider";
import { Analytics } from "@vercel/analytics/react";
import { ReduxProvider } from "@/redux/provider";
import "./styles/fonts.css";

export const metadata = {
  title: "Orion",
  description: "A web-based operating system built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <head>
        <link
          rel="preload"
          href="/fonts/ExemplarPro.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <html lang="en" className="overflow-hidden">
        <SocketProvider>
          <QueryProvider>
            <ReduxProvider>
              <DesignSystemProvider>
                <body className="h-screen w-screen bg-black overflow-hidden">
                  <OTPWrapper>
                    {children}
                    <Analytics />
                  </OTPWrapper>
                  <Toaster
                    position="bottom-right"
                    theme="dark"
                    className="!bg-transparent"
                    toastOptions={{
                      unstyled: true,
                      classNames: {
                        toast:
                          "bg-[#010203]/80 backdrop-blur-md border border-white/10 text-white rounded-lg p-4 shadow-lg",
                        title: "font-medium text-sm",
                        description: "text-sm text-white/70",
                        actionButton:
                          "bg-white/10 text-white text-sm px-3 py-1 rounded-md hover:bg-white/20 transition-colors",
                        cancelButton:
                          "text-white/50 text-sm px-3 py-1 rounded-md hover:bg-white/10 transition-colors",
                      },
                    }}
                  />
                </body>
              </DesignSystemProvider>
            </ReduxProvider>
          </QueryProvider>
        </SocketProvider>
      </html>
    </ClerkProvider>
  );
}
