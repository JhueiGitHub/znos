// app/api/community/profiles/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const communityProfiles = await db.profile.findMany({
      where: {
        id: {
          in: ["orion-official"], // For now, just Orion
        },
      },
      include: {
        streams: {
          include: {
            flows: true,
          },
        },
      },
    });

    // Transform and enhance the profiles
    const enhancedProfiles = communityProfiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      imageUrl: profile.imageUrl,
      description:
        profile.id === "orion-official"
          ? "Official OS themes and configurations"
          : profile.email,
      streams: profile.streams,
    }));

    return NextResponse.json(enhancedProfiles);
  } catch (error) {
    console.error("[COMMUNITY_PROFILES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
