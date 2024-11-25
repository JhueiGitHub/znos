// app/api/xp/publications/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

// POST: Publish a design system to XP
export async function POST(req: Request) {
  try {
    // Get current profile
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get XP profile
    const xpProfile = await db.xPProfile.findUnique({
      where: {
        profileId: profile.id
      }
    });

    if (!xpProfile) {
      return new NextResponse("XP Profile not found", { status: 404 });
    }

    // Get flow ID from request
    const { flowId } = await req.json();
    if (!flowId) {
      return new NextResponse("Flow ID is required", { status: 400 });
    }

    // Verify flow exists and belongs to user
    const flow = await db.flow.findUnique({
      where: {
        id: flowId,
        profileId: profile.id
      },
      include: {
        stream: true,
        components: true,
      }
    });

    if (!flow) {
      return new NextResponse("Flow not found", { status: 404 });
    }

    // Verify it's an Orion config flow
    if (!flow?.stream || flow.stream.type !== "CONFIG" || flow.stream.appId !== "orion") {
        return new NextResponse("Only Orion config flows can be published", { status: 400 });
      }
  

    // Check if already published
    const existingPublication = await db.designSystemPublication.findFirst({
      where: {
        designSystemId: flowId,
        xpProfileId: xpProfile.id
      }
    });

    if (existingPublication) {
      return new NextResponse("Flow already published", { status: 400 });
    }

    // Create publication
    const publication = await db.designSystemPublication.create({
      data: {
        name: flow.name,
        description: flow.description || undefined,
        xpProfileId: xpProfile.id,
        designSystemId: flowId,
        isPublished: true,
        publishedAt: new Date(),
        // Optional preview image from flow components
        previewImageUrl: flow.components.find(c => c.type === "WALLPAPER")?.value || undefined
      }
    });

    // Update XP profile stats
    await db.xPProfile.update({
      where: {
        id: xpProfile.id
      },
      data: {
        designSystemsPublished: {
          increment: 1
        }
      }
    });

    return NextResponse.json(publication);

  } catch (error) {
    console.error("[PUBLICATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET: Fetch published design systems
export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get URL params
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    // Base query
    const baseQuery = {
      where: {
        isPublished: true,
        ...(creatorId && {
          xpProfile: {
            id: creatorId
          }
        })
      },
      include: {
        xpProfile: {
          select: {
            id: true,
            displayName: true,
            customImageUrl: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        publishedAt: "desc" as const
      }
    };

    // Fetch publications
    const publications = await db.designSystemPublication.findMany(baseQuery);

    // Enhance with additional data
    const enhancedPublications = await Promise.all(
      publications.map(async (pub) => {
        // Get preview data from original flow
        const flow = await db.flow.findUnique({
          where: {
            id: pub.designSystemId
          },
          include: {
            components: true
          }
        });

        return {
          ...pub,
          previewData: {
            wallpaper: flow?.components.find(c => c.type === "WALLPAPER")?.value,
            dockIcons: flow?.components.filter(c => c.type === "DOCK_ICON")
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(c => ({
                id: c.id,
                value: c.value,
                mode: c.mode
              }))
          }
        };
      })
    );

    return NextResponse.json(enhancedPublications);

  } catch (error) {
    console.error("[PUBLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE: Remove a publication
export async function DELETE(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publicationId = searchParams.get("id");

    if (!publicationId) {
      return new NextResponse("Publication ID required", { status: 400 });
    }

    // Verify ownership
    const publication = await db.designSystemPublication.findUnique({
      where: {
        id: publicationId
      },
      include: {
        xpProfile: true
      }
    });

    if (!publication || publication.xpProfile.profileId !== profile.id) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Delete publication
    await db.designSystemPublication.delete({
      where: {
        id: publicationId
      }
    });

    // Update XP profile stats
    await db.xPProfile.update({
      where: {
        profileId: profile.id
      },
      data: {
        designSystemsPublished: {
          decrement: 1
        }
      }
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("[PUBLICATION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}