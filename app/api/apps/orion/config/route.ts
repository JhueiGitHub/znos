import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the design system
    const designSystem = await db.designSystem.findUnique({
      where: {
        profileId: profile.id,
      },
    });

    if (!designSystem) {
      return new NextResponse("Design system not found", { status: 404 });
    }

    // First check for active flow configuration
    const activeConfig = await db.appConfig.findFirst({
      where: {
        appId: "orion",
        profileId: profile.id,
      },
      include: {
        flow: {
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

    // If we have an active flow config, return that
    if (activeConfig?.flow) {
      return NextResponse.json({
        designSystem,
        flow: activeConfig.flow,
      });
    }

    // Otherwise fall back to getting the first flow from the Orion stream
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

    // If this is our first time, set this as the active flow
    if (stream.flows[0]) {
      await db.appConfig.create({
        data: {
          appId: "orion",
          profileId: profile.id,
          flowId: stream.flows[0].id,
        },
      });
    }

    return NextResponse.json({
      designSystem,
      flow: stream.flows[0],
    });
  } catch (error) {
    console.error("[ORION_CONFIG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
