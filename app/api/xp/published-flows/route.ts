// /api/xp/published-flows/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First get the user's XP profile ID
    const userXpProfile = await db.xPProfile.findUnique({
      where: {
        profileId: profile.id,
      },
    });

    if (!userXpProfile) {
      return NextResponse.json({});
    }

    // Get all publications by this user
    const publishedFlows = await db.designSystemPublication.findMany({
      where: {
        xpProfileId: userXpProfile.id,
        isPublished: true,
      },
      select: {
        id: true,
        designSystemId: true,
        version: true,
      },
    });

    // Create simple map of flowId -> publication data
    const publishedFlowsMap = publishedFlows.reduce(
      (acc, pub) => {
        acc[pub.designSystemId] = {
          publicationId: pub.id,
          version: pub.version,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    return NextResponse.json(publishedFlowsMap);
  } catch (error) {
    console.error("[PUBLISHED_FLOWS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
