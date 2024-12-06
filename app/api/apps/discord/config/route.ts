// app/api/apps/discord/config/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const designSystem = await db.designSystem.findUnique({
      where: {
        profileId: profile.id,
      },
    });

    if (!designSystem) {
      return new NextResponse("Design system not found", { status: 404 });
    }

    const stream = await db.stream.findFirst({
      where: {
        appId: "discord",
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

    return NextResponse.json({
      designSystem,
      flow: stream.flows[0], // Main flow containing components
    });
  } catch (error) {
    console.error("[DISCORD_CONFIG_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}
