// /root/app/api/stellar/folders/[folderId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

// app/api/stellar/folders/[folderId]/route.ts - Update GET handler
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

    // Get the folder and its full path
    const folderWithPath = await db.stellarFolder.findUnique({
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

    if (!folderWithPath) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    // Recursively get the path
    const getFolderPath = async (
      folderId: string,
      path: any[] = []
    ): Promise<any[]> => {
      const folder = await db.stellarFolder.findUnique({
        where: { id: folderId },
        include: { parent: true },
      });

      if (!folder) return path;

      path.unshift({ id: folder.id, name: folder.name });

      if (folder.parentId && folder.parentId !== stellarProfile.rootFolderId) {
        return getFolderPath(folder.parentId, path);
      }

      return path;
    };

    const folderPath = await getFolderPath(params.folderId);

    // Add root folder to the beginning of the path
    const fullPath = [
      { id: stellarProfile.rootFolderId, name: "Root" },
      ...folderPath,
    ];

    const response = {
      ...stellarProfile,
      folder: {
        ...folderWithPath,
        path: fullPath,
        children: folderWithPath.children.map((child) => ({
          ...child,
          position: child.position || { x: 0, y: 0 },
        })),
        files: folderWithPath.files.map((file) => ({
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

export async function PATCH(
  req: Request,
  { params }: { params: { folderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    const stellarProfile = await db.stellarProfile.findUnique({
      where: { profileId: profile.id },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    const updatedFolder = await db.stellarFolder.update({
      where: {
        id: params.folderId,
        stellarProfileId: stellarProfile.id,
      },
      data: { name },
      include: {
        files: true,
        children: true,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[FOLDER_RENAME_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
