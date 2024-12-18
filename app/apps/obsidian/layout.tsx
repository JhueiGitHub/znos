import "./globals.css";
import { FolderProvider } from "./contexts/folder-context";

export default function StellarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full overflow-hidden dark">
      <FolderProvider>{children}</FolderProvider>
    </div>
  );
}
