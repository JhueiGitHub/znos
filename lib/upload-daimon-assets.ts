// lib/upload-daimon-assets.ts
import { createReadStream } from "fs";
import { uploadFiles } from "@/lib/upload";
import path from "path";
import { db } from "@/lib/db";
import { MediaType } from "@prisma/client";
import { appDefinitions } from "@/app/types/AppTypes";

// Get dock apps from appDefinitions
const DOCK_APPS = appDefinitions
  .filter((app) => app.dockPosition !== undefined)
  .sort((a, b) => (a.dockPosition || 0) - (b.dockPosition || 0));

interface DaimonAsset {
  path: string;
  name: string;
  type: MediaType;
}

const DAIMON_ASSETS: DaimonAsset[] = [
  {
    path: "/media/daimon/siamese.mp4",
    name: "Daimon Wallpaper",
    type: MediaType.VIDEO,
  },
  ...DOCK_APPS.map((app) => ({
    path: `/media/daimon/icons/${app.id}.png`,
    name: `${app.name} Icon`,
    type: MediaType.IMAGE,
  })),
];

export async function uploadDaimonAssets() {
  console.log("🚀 Starting Daimon asset upload...");

  const mediaItems: {
    wallpaper: string;
    icons: string[];
  } = {
    wallpaper: "",
    icons: [],
  };

  for (const asset of DAIMON_ASSETS) {
    try {
      // Create readable stream from public file
      const filePath = path.join(process.cwd(), "public", asset.path);
      const fileStream = createReadStream(filePath);

      // Upload to UploadCare via UploadThing
      const [uploadedFile] = await uploadFiles([fileStream]);

      // Create MediaItem in database
      const mediaItem = await db.mediaItem.create({
        data: {
          name: asset.name,
          type: asset.type,
          url: uploadedFile.url,
          profileId: "orion-official",
        },
      });

      // Store reference based on asset type
      if (asset.path.includes("siamese.mp4")) {
        mediaItems.wallpaper = mediaItem.id;
      } else {
        mediaItems.icons.push(mediaItem.id);
      }

      console.log(`✅ Uploaded ${asset.name} to UploadCare`);
    } catch (error) {
      console.error(`❌ Failed to upload ${asset.name}:`, error);
      throw error;
    }
  }

  console.log("🎉 Daimon asset upload complete!");
  return mediaItems;
}
