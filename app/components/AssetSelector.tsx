// Update AssetSelector.tsx
import { useState, useEffect } from "react";
import { currentProfile } from "@/lib/current-profile";
import { Asset, AssetType, AssetCategory } from "@prisma/client";

interface AssetSelectorProps {
  assetType: AssetType;
  category: AssetCategory;
  onSelect: (url: string) => void;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  assetType,
  category,
  onSelect,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      const profile = await currentProfile();
      if (!profile) {
        console.error("No profile found");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/assets?type=${assetType}&category=${category}&profileId=${profile.id}`
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
  }, [assetType, category]);

  if (isLoading) return <div>Loading assets...</div>;

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select an asset</option>
      {assets.map((asset) => (
        <option key={asset.id} value={asset.url}>
          {asset.name}
        </option>
      ))}
    </select>
  );
};

export default AssetSelector;
