"use client";

import { useStyles } from "@/app/hooks/useStyles";
import { useVideo } from "../context/VideoContext";

interface DashboardProps {
  onContentSelect: () => void;
}

export function Dashboard({ onContentSelect }: DashboardProps) {
  const { getColor } = useStyles();
  const { categories, setCurrentContent, setCurrentEpisode } = useVideo();

  const handleContentSelect = (content: any) => {
    setCurrentContent(content);
    if (content.type === "series") {
      setCurrentEpisode(content.episodes[0]);
    }
    onContentSelect();
  };

  const getRatingNumber = (rating: string) => {
    return rating.split("%")[0] + "%";
  };

  const heroContent = categories[0].content[0];

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
            src={heroContent.thumbnail}
            alt={heroContent.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 pt-[20vh] pl-[4%] max-w-[36%]">
          <h1 className="text-[3.6rem] font-bold text-white mb-6">
            {heroContent.title}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[#46d369] font-bold">
              {heroContent.rating}
            </span>
            <span className="border border-white/40 px-2 text-white/90">
              {heroContent.maturityRating}
            </span>
            <span className="text-white/90">
              {heroContent.type === "series"
                ? `${heroContent.episodeCount} Episodes`
                : heroContent.duration}
            </span>
          </div>
          <p className="text-white/90 text-xl mb-8">
            {heroContent.description}
          </p>
          <button
            onClick={() => handleContentSelect(heroContent)}
            className="px-8 py-3 text-xl font-semibold rounded bg-white hover:bg-white/90 text-black"
          >
            Watch Now
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="relative z-30 mt-[-20vh]">
        {categories.map((category) => (
          <div key={category.id} className="mb-[3vw]">
            <h2 className="text-[1.4vw] text-white/90 font-medium mb-2 pl-[4%]">
              {category.name}
            </h2>
            <div className="relative">
              <div className="flex overflow-x-auto gap-4 px-[4%] no-scrollbar scroll-smooth">
                {category.content.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleContentSelect(item)}
                    className="relative flex-none cursor-pointer"
                    style={{ width: "400px" }}
                  >
                    <div className="aspect-video overflow-hidden rounded-sm">
                      <div className="relative w-full h-full transform transition-transform duration-300 hover:scale-105">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity duration-300 rounded-sm">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-white text-lg font-bold">
                                {item.title}
                              </span>
                              <span className="text-[#46d369] font-bold">
                                {getRatingNumber(item.rating)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
