import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // EVOLVED: Extract parentId from request
    const { name, position, parentId } = await req.json();

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

    // EVOLVED: If parentId provided, verify parent folder exists and belongs to user
    if (parentId) {
      const parentFolder = await db.stellarFolder.findUnique({
        where: {
          id: parentId,
          stellarProfileId: stellarProfile.id,
        },
      });

      if (!parentFolder) {
        return new NextResponse("Parent folder not found", { status: 404 });
      }
    }

    // EVOLVED: Create folder with proper parent relationship
    const newFolder = await db.stellarFolder.create({
      data: {
        name,
        position: position || { x: 0, y: 0 },
        stellarProfileId: stellarProfile.id,
        // EVOLVED: Set parentId if provided, otherwise connect to root
        parentId: parentId || stellarProfile.rootFolder?.id,
      },
      include: {
        files: true,
        children: true,
        // EVOLVED: Include parent information
        parent: true,
      },
    });

    return NextResponse.json(newFolder);
  } catch (error) {
    console.error("[FOLDER_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PRESERVED: Original GET handler with hierarchical data
export async function GET(req: Request) {
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
        rootFolder: {
          include: {
            files: true,
            children: {
              include: {
                files: true,
                children: {
                  include: {
                    files: true,
                  },
                },
              },
              orderBy: {
                sidebarOrder: "asc",
              },
            },
          },
        },
      },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // PRESERVED: Debug logging
    console.log(
      "Root folder structure:",
      JSON.stringify(
        {
          rootFolderId: stellarProfile.rootFolder?.id,
          childrenCount: stellarProfile.rootFolder?.children?.length,
          filesCount: stellarProfile.rootFolder?.files?.length,
        },
        null,
        2
      )
    );

    const response = {
      ...stellarProfile,
      rootFolder: {
        ...stellarProfile.rootFolder,
        children: stellarProfile.rootFolder?.children?.map((child) => ({
          ...child,
          position: child.position || { x: 0, y: 0 },
        })),
        files: stellarProfile.rootFolder?.files?.map((file) => ({
          ...file,
          position: file.position || { x: 0, y: 0 },
        })),
      },
      driveCapacity: stellarProfile.driveCapacity.toString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STELLAR_FOLDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
