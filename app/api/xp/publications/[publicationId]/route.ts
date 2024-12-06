// app/api/xp/publications/[publicationId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(
  req: Request,
  { params }: { params: { publicationId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // EVOLVED: Include flow and its components
    const publication = await db.designSystemPublication.findUnique({
      where: {
        id: params.publicationId,
      },
      include: {
        xpProfile: {
          select: {
            id: true,
            displayName: true,
            customImageUrl: true,
            isVerified: true,
          },
        },
      },
    });

    if (!publication) {
      return new NextResponse("Publication not found", { status: 404 });
    }

    // EVOLVED: Get complete flow data including all components
    const flow = await db.flow.findUnique({
      where: {
        id: publication.designSystemId,
      },
      include: {
        components: {
          include: {
            mediaItem: true, // Include media information
          },
        },
      },
    });

    // EVOLVED: Find wallpaper component and extract proper video URL
    const wallpaperComponent = flow?.components.find(
      (c) => c.type === "WALLPAPER" && c.mode === "media"
    );

    // EVOLVED: Enhance publication with proper wallpaper data
    const enhancedPublication = {
      ...publication,
      previewData: {
        wallpaper: wallpaperComponent
          ? {
              mode: wallpaperComponent.mode,
              value: wallpaperComponent.value,
              mediaItem: wallpaperComponent.mediaItem,
            }
          : undefined,
      },
    };

    return NextResponse.json(enhancedPublication);
  } catch (error) {
    console.error("[PUBLICATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH: Update publication stats (downloads, etc)
export async function PATCH(
  req: Request,
  { params }: { params: { publicationId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { type } = await req.json();

    if (!type) {
      return new NextResponse("Stat type required", { status: 400 });
    }

    const publication = await db.designSystemPublication.findUnique({
      where: {
        id: params.publicationId,
      },
      include: {
        xpProfile: true,
      },
    });

    if (!publication) {
      return new NextResponse("Publication not found", { status: 404 });
    }

    let updates = {};

    switch (type) {
      case "download":
        updates = {
          downloads: {
            increment: 1,
          },
        };
        // Update creator's total downloads
        await db.xPProfile.update({
          where: {
            id: publication.xpProfileId,
          },
          data: {
            totalDownloads: {
              increment: 1,
            },
          },
        });
        break;
      // Add other stat types as needed
    }

    const updatedPublication = await db.designSystemPublication.update({
      where: {
        id: params.publicationId,
      },
      data: updates,
    });

    return NextResponse.json(updatedPublication);
  } catch (error) {
    console.error("[PUBLICATION_STATS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
