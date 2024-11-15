import React from "react";
import Image from "next/image";
import localFont from "next/font/local";
import "../globals.css";

// Original functionality: Load ExemplarPro font
const exemplarPro = localFont({
  src: "../../public/fonts/ExemplarPro.otf",
  variable: "--font-exemplar-pro",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen flex flex-col ${exemplarPro.variable}`}>
      {/* Original functionality: Full-width background image */}
      <Image
        src="/media/authbg.png"
        alt="Authentication background"
        layout="fill"
        objectFit="cover"
        quality={100}
      />

      {/* New styling: Centered content with glass effect */}
      <div className="flex-grow flex flex-col items-center justify-center z-10">
        {/* Original functionality: Orion heading */}
        <h1
          className="text-6xl font-bold text-white/85 mb-8"
          style={{
            fontFamily: "ExemplarPro",
          }}
        >
          Orion
        </h1>

        {/* New styling: Glass card effect for sign-in/sign-up components */}
        <div
          className="w-full max-w-md"
          style={{
            fontFamily: "ExemplarPro",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
