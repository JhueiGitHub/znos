import "./globals.css";
import React from "react";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className="h-full w-full overflow-hidden bg-[#010203]">
      {children}
    </body>
  </html>
);

export default RootLayout;
