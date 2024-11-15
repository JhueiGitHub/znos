// components/AssetUploader.tsx
import { useState } from "react";
import { UploadDropzone } from "../utils/uploadthing";
import { AssetType } from "@prisma/client";

interface AssetUploaderProps {
  assetType: AssetType;
  onUploadComplete: (res: any) => void;
}

const AssetUploader: React.FC<AssetUploaderProps> = ({
  assetType,
  onUploadComplete,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/fonts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Font upload failed");
      }

      const data = await response.json();
      onUploadComplete(data);
    } catch (error) {
      console.error("Font upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (assetType === AssetType.FONT) {
    return (
      <input
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFontUpload}
        disabled={isUploading}
      />
    );
  }

  return (
    <UploadDropzone
      endpoint={
        assetType === AssetType.IMAGE ? "imageUploader" : "videoUploader"
      }
      onClientUploadComplete={onUploadComplete}
      onUploadError={(error: Error) => {
        console.error("Upload error:", error);
      }}
    />
  );
};

export default AssetUploader;
