// app/api/fonts/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { AssetType, AssetCategory } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/\s/g, "-");
    const filepath = path.join(process.cwd(), "public/fonts", filename);

    await writeFile(filepath, buffer);

    let category: AssetCategory;
    switch (file.type) {
      case "font/ttf":
        category = AssetCategory.TTF;
        break;
      case "font/otf":
        category = AssetCategory.OTF;
        break;
      case "font/woff":
        category = AssetCategory.WOFF;
        break;
      case "font/woff2":
        category = AssetCategory.WOFF2;
        break;
      default:
        return new NextResponse("Unsupported font type", { status: 400 });
    }

    const asset = await db.asset.create({
      data: {
        name: file.name,
        url: `/fonts/${filename}`,
        type: AssetType.FONT,
        category,
        fileKey: filename,
        mimeType: file.type,
        size: file.size,
        profileId: profile.id,
      },
    });

    return NextResponse.json({ assetId: asset.id });
  } catch (error) {
    console.error("Error uploading font:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
