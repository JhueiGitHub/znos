// /root/app/apps/stellar/components/folders-area.tsx
"use client";

export const FoldersArea = () => {
  return (
    <div className="relative h-full flex-1 overflow-auto bg-[#010203]/30 p-4">
      <div className="grid grid-cols-4 gap-4 h-full">
        {/* We'll replace this later with actual folder components */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          />
        ))}
      </div>
    </div>
  );
};
