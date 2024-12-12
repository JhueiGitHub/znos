import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, url, size, mimeType, folderId, position } = await req.json();

    if (!name || !url) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

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

    // EVOLVED: Include position in file creation
    const stellarFile = await db.stellarFile.create({
      data: {
        name,
        url,
        size,
        mimeType,
        stellarFolderId: folderId || stellarProfile.rootFolderId,
        position: position || { x: 0, y: 0 },
      },
    });

    return NextResponse.json(stellarFile);
  } catch (error) {
    console.error("[STELLAR_FILES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// EVOLVED: Add position update endpoint
export async function PATCH(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileId, position } = await req.json();

    const updatedFile = await db.stellarFile.update({
      where: { id: fileId },
      data: { position },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("[STELLAR_FILES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
