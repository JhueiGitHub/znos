// /root/app/apps/glory/components/Dashboard.tsx
"use client";

import { useStyles } from "@/app/hooks/useStyles";

interface DashboardProps {
  onSeriesSelect: () => void;
}

export function Dashboard({ onSeriesSelect }: DashboardProps) {
  const { getColor } = useStyles();

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {/* Hero Section - Full width with content */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          {/* Left-aligned content image */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(77deg,rgba(0,0,0,.8),transparent 65%),linear-gradient(0deg,rgba(0,0,0,.8) 0,transparent)",
            }}
          />
          <img
            src="/apps/glory/hero-bg.png"
            alt="The Glory"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 pt-[20vh] pl-[4%] max-w-[36%]">
          <h1 className="text-[3.6rem] font-bold text-white mb-6">The Glory</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[#46d369] font-bold">
              97% Google User Review
            </span>
            <span className="border border-white/40 px-2 text-white/90">
              18+
            </span>
            <span className="text-white/90">16 Episodes</span>
          </div>
          <p className="text-white/90 text-xl mb-8">
            A woman puts a carefully crafted revenge plan in motion after
            suffering traumatic abuse in high school.
          </p>
          <button
            onClick={onSeriesSelect}
            className="px-8 py-3 text-xl font-semibold rounded bg-white hover:bg-white/90 text-black"
          >
            Watch Now
          </button>
        </div>
      </div>

      {/* Content Rows */}
      <div className="relative z-30 mt-[-20vh]">
        {/* Trending Now Row */}
        <div className="mb-[3vw] pl-[4%]">
          <h2 className="text-[1.4vw] text-white/90 font-medium mb-2">
            Trending Now
          </h2>
          <div className="flex gap-2 overflow-x-hidden">
            <div
              onClick={onSeriesSelect}
              className="relative min-w-[16%] cursor-pointer"
            >
              <img
                src="/apps/glory/hero-bg.png"
                alt="The Glory"
                className="w-full rounded-sm hover:scale-105 transition duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black">
                <div className="flex justify-between items-center">
                  <span className="text-white">The Glory</span>
                  <span className="text-[#46d369]">97% Match</span>
                </div>
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative min-w-[16%]">
                <img
                  src="/media/system/_empty_image.png"
                  alt=""
                  className="w-full rounded-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
