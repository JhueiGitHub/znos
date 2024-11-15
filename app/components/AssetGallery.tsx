// Update AssetGallery.tsx
import { useState, useEffect } from "react";
import { currentProfile } from "@/lib/current-profile";
import AssetCard from "./AssetCard";
import { Asset, AssetType, AssetCategory } from "@prisma/client";

interface AssetGalleryProps {
  assetType: AssetType;
  category: AssetCategory;
  profileId: string;
}

const AssetGallery: React.FC<AssetGalleryProps> = ({ assetType, category, profileId }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/assets?type=${assetType}&category=${category}&profileId=${profileId}`
        );
        if (!response.ok) throw new Error("Failed to fetch assets");
        const data: Asset[] = await response.json();
        setAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [assetType, category, profileId]);

  if (isLoading) return <div>Loading assets...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
};

export default AssetGallery;
