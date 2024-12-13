// app/api/stellar/folders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // EVOLVED: Enhanced query to ensure we get ALL necessary data
    const stellarProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
      include: {
        rootFolder: {
          include: {
            // Get root folder
            files: true,
            // Get children folders with their files
            children: {
              include: {
                files: true,
                // Also include grandchildren for deeper nesting
                children: {
                  include: {
                    files: true,
                  },
                },
              },
              orderBy: {
                // Order folders consistently
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

    // EVOLVED: Add logging for debugging
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

    // EVOLVED: Enhanced response with position verification
    const response = {
      ...stellarProfile,
      rootFolder: {
        ...stellarProfile.rootFolder,
        // Ensure all positions have valid coordinates
        children: stellarProfile.rootFolder?.children?.map((child) => ({
          ...child,
          position: child.position || { x: 0, y: 0 },
        })),
        files: stellarProfile.rootFolder?.files?.map((file) => ({
          ...file,
          position: file.position || { x: 0, y: 0 },
        })),
      },
      // Convert BigInt to String
      driveCapacity: stellarProfile.driveCapacity.toString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STELLAR_FOLDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, position, parentId } = await req.json();

    const stellarProfile = await db.stellarProfile.findUnique({
      where: { profileId: profile.id },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    const newFolder = await db.stellarFolder.create({
      data: {
        name,
        position,
        stellarProfileId: stellarProfile.id,
        parentId: parentId || stellarProfile.rootFolderId,
      },
      include: {
        files: true,
        children: true,
      },
    });

    return NextResponse.json(newFolder);
  } catch (error) {
    console.error("[FOLDER_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
