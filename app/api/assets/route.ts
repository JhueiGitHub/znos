// app/api/assets/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { AssetType, AssetCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as AssetType | null;
    const category = searchParams.get("category") as AssetCategory | null;

    const assets = await db.asset.findMany({
      where: {
        profileId: profile.id,
        ...(type && { type }),
        ...(category && { category }),
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("[ASSETS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, type, category, url, fileKey, mimeType, size } =
      await req.json();

    const asset = await db.asset.create({
      data: {
        name,
        description,
        type: type as AssetType,
        category: category as AssetCategory,
        url,
        fileKey,
        mimeType,
        size,
        profileId: profile.id,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("[ASSETS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
