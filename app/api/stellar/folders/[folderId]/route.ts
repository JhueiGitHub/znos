// /root/app/api/stellar/folders/[folderId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(
  req: Request,
  { params }: { params: { folderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    const folder = await db.stellarFolder.findUnique({
      where: {
        id: params.folderId,
        stellarProfileId: stellarProfile.id,
      },
      include: {
        files: true,
        children: {
          include: {
            files: true,
          },
        },
        parent: true,
      },
    });

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    const response = {
      ...stellarProfile,
      folder: {
        ...folder,
        children: folder.children.map((child) => ({
          ...child,
          position: child.position || { x: 0, y: 0 },
        })),
        files: folder.files.map((file) => ({
          ...file,
          position: file.position || { x: 0, y: 0 },
        })),
      },
      driveCapacity: stellarProfile.driveCapacity.toString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[FOLDER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
