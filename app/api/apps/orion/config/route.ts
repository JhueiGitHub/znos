// app/api/apps/orion/config/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First get the profile's design system - IMPORTANT TO KEEP
    const designSystem = await db.designSystem.findUnique({
      where: {
        profileId: profile.id,
      },
    });

    if (!designSystem) {
      return new NextResponse("Design system not found", { status: 404 });
    }

    // Get the Orion stream and its flows directly
    const stream = await db.stream.findFirst({
      where: {
        appId: "orion",
        profileId: profile.id,
      },
      include: {
        flows: {
          include: {
            components: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!stream) {
      return new NextResponse("Stream not found", { status: 404 });
    }

    // Return both design system and stream data
    return NextResponse.json({
      designSystem,
      flow: stream.flows[0], // The main flow containing components
    });
  } catch (error) {
    console.error("[ORION_CONFIG_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}
