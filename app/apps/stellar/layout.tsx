import "./globals.css";

export default function StellarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full w-full overflow-hidden dark">{children}</div>;
}
