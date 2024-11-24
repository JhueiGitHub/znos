import axios from "axios";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { useCallback, useEffect } from "react";
import { useState } from "react";

// Replace the existing MacOSIconsContent with this version:
const MacOSIconsContent: React.FC<{
  onSelect: (
    url: string,
    metadata: { credit: string; uploadedBy: string }
  ) => Promise<void>;
}> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [icons, setIcons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchIcons = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery) {
        setIcons([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('https://api.macosicons.com/api/v1/search', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'apikey': 'ec7a2a6c2497225fa802fd0615b7ca3d57276c200f68f2536dd1c03e764baa62'
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 20
          })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (Array.isArray(data.icons)) {
          setIcons(data.icons);
        } else {
          console.error('Invalid response structure:', data);
          setIcons([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setIcons([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query) {
      searchIcons(query);
    }
  }, [query, searchIcons]);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 bg-white/[0.05] rounded-md px-3 py-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search macOS icons..."
          className="bg-transparent text-sm text-white/80 placeholder:text-white/30 outline-none flex-1 w-full"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="col-span-4 py-8 text-center text-white/50">
            Loading...
          </div>
        ) : icons.length === 0 ? (
          <div className="col-span-4 py-8 text-center text-white/50">
            {query ? "No icons found" : "Type to search icons"}
          </div>
        ) : (
          icons.map((icon) => (
            <motion.div
              key={icon.id}
              whileHover={{ scale: 1.05 }}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer border border-white/[0.09] p-2 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
              onClick={() =>
                onSelect(icon.url, {
                  credit: icon.author,
                  uploadedBy: icon.source
                })
              }
            >
              <div className="relative w-full h-full">
                <img
                  src={icon.url}
                  alt={icon.name}
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/50 to-transparent">
                  <span className="text-[10px] text-white/80 pb-1">
                    {icon.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};