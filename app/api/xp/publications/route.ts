// app/api/xp/publications/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const publications = await db.designSystemPublication.findMany({
      where: {
        isPublished: true,
      },
      include: {
        xpProfile: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return NextResponse.json(publications);
  } catch (error) {
    console.error("[PUBLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const xpProfile = await db.xPProfile.findUnique({
      where: { profileId: profile.id },
    });

    if (!xpProfile) {
      return new NextResponse("XP Profile required", { status: 404 });
    }

    const { flowId } = await req.json();
    if (!flowId) {
      return new NextResponse("Flow ID required", { status: 400 });
    }

    // Get flow with all needed relations
    // in /api/xp/publications/route.ts, in the POST handler
    const flow = await db.flow.findUnique({
      where: {
        id: flowId,
        profileId: profile.id,
      },
      include: {
        stream: true,
        components: {
          include: {
            mediaItem: true,
          },
        },
      },
    });

    if (!flow) {
      return new NextResponse("Flow not found", { status: 404 });
    }

    // Verify it's an Orion config flow
    if (
      !flow.stream ||
      flow.stream.type !== "CONFIG" ||
      flow.stream.appId !== "orion"
    ) {
      return new NextResponse("Only Orion config flows can be published", {
        status: 400,
      });
    }

    // Check for existing publication
    const existing = await db.designSystemPublication.findFirst({
      where: {
        designSystemId: flowId,
        xpProfileId: xpProfile.id,
      },
    });

    if (existing) {
      return new NextResponse("Flow already published", { status: 400 });
    }

    // Create publication
    const publication = await db.designSystemPublication.create({
      data: {
        name: flow.name,
        description: flow.description || undefined,
        xpProfileId: xpProfile.id,
        designSystemId: flowId,
        version: "1.0.0",
        previewImageUrl: flow.components.find((c) => c.type === "WALLPAPER")
          ?.value,
        price: 0,
        isPublished: true,
        publishedAt: new Date(),
        downloads: 0,
        likes: 0,
      },
      include: {
        xpProfile: true,
      },
    });

    // Update profile stats
    await db.xPProfile.update({
      where: { id: xpProfile.id },
      data: {
        designSystemsPublished: { increment: 1 },
      },
    });

    return NextResponse.json(publication);
  } catch (error) {
    console.error("[PUBLICATION_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
