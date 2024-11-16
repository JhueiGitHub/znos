import "./globals.css";

export const metadata = {
  title: "Figma Clone",
  description:
    "A minimalist Figma clone using fabric.js and Liveblocks for realtime collaboration",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className="h-full w-full overflow-hidden">{children}</body>
  </html>
);

export default RootLayout;
