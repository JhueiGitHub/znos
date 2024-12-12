// app/api/stellar/files/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, url, size, mimeType, folderId } = await req.json();

    if (!name || !url) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get stellar profile
    const stellarProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
      include: {
        rootFolder: true,
      },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Create the stellar file entry
    const stellarFile = await db.stellarFile.create({
      data: {
        name,
        url,
        size,
        mimeType,
        stellarFolderId: folderId || stellarProfile.rootFolderId,
      },
    });

    return NextResponse.json(stellarFile);
  } catch (error) {
    console.error("[STELLAR_FILES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
