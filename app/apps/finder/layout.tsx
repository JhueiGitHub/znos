import "./globals.css";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className="h-full w-full overflow-hidden">{children}</body>
  </html>
);

export default RootLayout;
