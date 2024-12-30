// /root/app/apps/glory/components/Dashboard.tsx
"use client";

import { useStyles } from "@/app/hooks/useStyles";
import { useVideo } from "../context/VideoContext";

interface DashboardProps {
  onSeriesSelect: () => void;
}

export function Dashboard({ onSeriesSelect }: DashboardProps) {
  const { getColor } = useStyles();
  const { series, setCurrentSeries } = useVideo();

  const handleSeriesSelect = (series: any) => {
    setCurrentSeries(series);
    onSeriesSelect();
  };

  // Extract rating number from the full string
  const getRatingNumber = (rating: string) => {
    return rating.split("%")[0] + "%";
  };

  // Use the first series as the hero (The Glory)
  const heroSeries = series[0];

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {/* Hero Section - Full width with content */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(77deg,rgba(0,0,0,.8),transparent 65%),linear-gradient(0deg,rgba(0,0,0,.8) 0,transparent)",
            }}
          />
          <img
            src={heroSeries.thumbnail}
            alt={heroSeries.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 pt-[20vh] pl-[4%] max-w-[36%]">
          <h1 className="text-[3.6rem] font-bold text-white mb-6">
            {heroSeries.title}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[#46d369] font-bold">
              {heroSeries.rating}
            </span>
            <span className="border border-white/40 px-2 text-white/90">
              {heroSeries.maturityRating}
            </span>
            <span className="text-white/90">
              {heroSeries.episodeCount} Episodes
            </span>
          </div>
          <p className="text-white/90 text-xl mb-8">{heroSeries.description}</p>
          <button
            onClick={() => handleSeriesSelect(heroSeries)}
            className="px-8 py-3 text-xl font-semibold rounded bg-white hover:bg-white/90 text-black"
          >
            Watch Now
          </button>
        </div>
      </div>

      {/* Content Rows */}
      <div className="relative z-30 mt-[-20vh]">
        {/* Trending Now Row */}
        <div className="mb-[3vw] pl-[4%] pr-[4%]">
          <h2 className="text-[1.4vw] text-white/90 font-medium mb-2">
            Trending Now
          </h2>
          <div className="flex gap-4">
            {series.map((series) => (
              <div
                key={series.id}
                onClick={() => handleSeriesSelect(series)}
                className="relative cursor-pointer group"
                style={{ width: "400px" }}
              >
                <div className="aspect-video">
                  <img
                    src={series.thumbnail}
                    alt={series.title}
                    className="w-full h-full rounded-sm object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity duration-300 rounded-sm">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-lg font-bold">
                          {series.title}
                        </span>
                        <span className="text-[#46d369] font-bold">
                          {getRatingNumber(series.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Placeholder tiles - reduced number since cards are bigger */}
            {[...Array(2)].map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="relative"
                style={{ width: "400px" }}
              >
                <div className="aspect-video">
                  <img
                    src="/media/system/_empty_image.png"
                    alt=""
                    className="w-full h-full rounded-sm object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
