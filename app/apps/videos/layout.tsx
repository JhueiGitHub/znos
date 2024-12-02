// app/apps/videos/layout.tsx
export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#010203]">
      {children}
    </div>
  );
}
