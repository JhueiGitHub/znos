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

    // EVOLVED: Get folder with complete hierarchy
    const folderWithPath = await db.stellarFolder.findUnique({
      where: {
        id: params.folderId,
        stellarProfileId: stellarProfile.id, // Security: Ensure folder belongs to user
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

    // EVOLVED: Recursively get the path to root
    const getFolderPath = async (
      folderId: string,
      path: any[] = []
    ): Promise<any[]> => {
      const folder = await db.stellarFolder.findUnique({
        where: {
          id: folderId,
          stellarProfileId: stellarProfile.id, // Security: Ensure each path folder belongs to user
        },
        include: { parent: true },
      });

      if (!folder) return path;

      path.unshift({ id: folder.id, name: folder.name });

      if (folder.parentId && folder.parentId !== stellarProfile.rootFolderId) {
        return getFolderPath(folder.parentId, path);
      }

      return path;
    };

    // EVOLVED: Get complete path to current folder
    const folderPath = await getFolderPath(params.folderId);

    // EVOLVED: Add root folder to beginning of path
    const fullPath = [
      { id: stellarProfile.rootFolderId, name: "Root" },
      ...folderPath,
    ];

    // EVOLVED: Build enhanced response with complete context
    const response = {
      ...stellarProfile,
      folder: {
        ...folderWithPath,
        path: fullPath,
        // EVOLVED: Ensure all children have positions
        children: folderWithPath.children.map((child) => ({
          ...child,
          position: child.position || { x: 0, y: 0 },
        })),
        // EVOLVED: Ensure all files have positions
        files: folderWithPath.files.map((file) => ({
          ...file,
          position: file.position || { x: 0, y: 0 },
        })),
      },
      driveCapacity: stellarProfile.driveCapacity.toString(),
    };

    // EVOLVED: Add debug logging for path tracking
    console.log("Folder path:", JSON.stringify(fullPath, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("[FOLDER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// EVOLVED: Add PATCH handler for folder updates
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
        stellarProfileId: stellarProfile.id, // Security: Ensure folder belongs to user
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
