// app/components/AssetCard.tsx

import Image from "next/image";
import { Asset } from "@prisma/client"; // Import the Asset type

// Define the props type for AssetCard
interface AssetCardProps {
  asset: Asset; // Use the Asset type from Prisma
}

const AssetCard = ({ asset }: AssetCardProps) => {
  // Add type annotation here
  return (
    <div className="border rounded-lg p-2">
      {asset.type === "IMAGE" && (
        <Image
          src={asset.url}
          alt={asset.name}
          width={200}
          height={200}
          objectFit="cover"
        />
      )}
      {asset.type === "VIDEO" && (
        <video src={asset.url} width={200} height={200} />
      )}
      {asset.type === "FONT" && (
        <div style={{ fontFamily: asset.name }}>{asset.name}</div>
      )}
      <p className="mt-2 text-sm">{asset.name}</p>
    </div>
  );
};

export default AssetCard;
