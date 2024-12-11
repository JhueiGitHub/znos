import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: Request) {
  try {
    // PRESERVED: Original profile check
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // EVOLVED: Parse URL to get optional filter
    const { searchParams } = new URL(req.url);
    const sidebarOnly = searchParams.get("sidebar") === "true";

    // PRESERVED: Base query structure
    const stellarProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
      include: {
        rootFolder: {
          include: {
            // EVOLVED: Enhanced include to get full folder data
            children: {
              include: {
                files: true,
                children: {
                  include: {
                    files: true,
                  },
                },
              },
              // EVOLVED: Conditional filter for sidebar items
              ...(sidebarOnly && {
                where: {
                  inSidebar: true,
                },
                orderBy: {
                  sidebarOrder: "asc",
                },
              }),
            },
            files: true,
          },
        },
      },
    });

    // PRESERVED: Profile check
    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // PRESERVED: BigInt serialization
    const serializedProfile = {
      ...stellarProfile,
      driveCapacity: stellarProfile.driveCapacity.toString(),
    };

    return NextResponse.json(serializedProfile);
  } catch (error) {
    console.error("[STELLAR_FOLDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// EVOLVED: Add folder update endpoint
export async function PATCH(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { folderId, inSidebar, sidebarOrder } = body;

    const stellarProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    const updatedFolder = await db.stellarFolder.update({
      where: {
        id: folderId,
        stellarProfileId: stellarProfile.id, // Extra safety check
      },
      data: {
        inSidebar,
        ...(sidebarOrder !== undefined && { sidebarOrder }),
      },
      include: {
        files: true,
        children: true,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[STELLAR_FOLDERS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// EVOLVED: Add POST method for folder creation
export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, parentId } = body;

    const stellarProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Create the new folder
    const newFolder = await db.stellarFolder.create({
      data: {
        name,
        parentId: parentId || stellarProfile.rootFolderId,
        stellarProfileId: stellarProfile.id,
        inSidebar: false,
        sidebarOrder: null,
      },
      include: {
        children: true,
        files: true,
      },
    });

    return NextResponse.json(newFolder);
  } catch (error) {
    console.error("[STELLAR_FOLDERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
