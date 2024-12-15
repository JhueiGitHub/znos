import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

// EVOLVED: Get only sidebar folders
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
        rootFolder: true,
      },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Get all sidebar folders with their immediate children
    const sidebarFolders = await db.stellarFolder.findMany({
      where: {
        stellarProfileId: stellarProfile.id,
        inSidebar: true,
      },
      include: {
        children: {
          include: {
            files: true,
          },
        },
        files: true,
      },
      orderBy: {
        sidebarOrder: "asc",
      },
    });

    return NextResponse.json(sidebarFolders);
  } catch (error) {
    console.error("[SIDEBAR_FOLDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// EVOLVED: Add folder to sidebar
export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { folderId } = await req.json();

    const stellarProfile = await db.stellarProfile.findUnique({
      where: { profileId: profile.id },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Get current highest sidebarOrder
    const lastSidebarFolder = await db.stellarFolder.findFirst({
      where: {
        stellarProfileId: stellarProfile.id,
        inSidebar: true,
      },
      orderBy: {
        sidebarOrder: "desc",
      },
    });

    const newOrder = lastSidebarFolder
      ? (lastSidebarFolder.sidebarOrder || 0) + 1
      : 0;

    // Update folder to be in sidebar
    const updatedFolder = await db.stellarFolder.update({
      where: {
        id: folderId,
        stellarProfileId: stellarProfile.id, // Security: Ensure folder belongs to user
      },
      data: {
        inSidebar: true,
        sidebarOrder: newOrder,
      },
      include: {
        children: true,
        files: true,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[SIDEBAR_FOLDER_ADD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// EVOLVED: Delete folder from sidebar (doesn't delete the folder, just removes from sidebar)
export async function DELETE(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { folderId } = await req.json();

    const stellarProfile = await db.stellarProfile.findUnique({
      where: { profileId: profile.id },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Remove folder from sidebar
    const updatedFolder = await db.stellarFolder.update({
      where: {
        id: folderId,
        stellarProfileId: stellarProfile.id, // Security: Ensure folder belongs to user
      },
      data: {
        inSidebar: false,
        sidebarOrder: null,
      },
    });

    // Reorder remaining sidebar folders
    await db.$transaction(async (tx) => {
      const sidebarFolders = await tx.stellarFolder.findMany({
        where: {
          stellarProfileId: stellarProfile.id,
          inSidebar: true,
        },
        orderBy: {
          sidebarOrder: "asc",
        },
      });

      // Update orders to be sequential
      for (let i = 0; i < sidebarFolders.length; i++) {
        await tx.stellarFolder.update({
          where: { id: sidebarFolders[i].id },
          data: { sidebarOrder: i },
        });
      }
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[SIDEBAR_FOLDER_REMOVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
