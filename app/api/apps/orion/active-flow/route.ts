// /app/api/apps/orion/active-flow/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orionConfig = await db.appConfig.findFirst({
      where: {
        appId: "orion",
        profileId: profile.id,
      },
      include: {
        flow: {
          include: {
            components: true,
          },
        },
      },
    });

    return NextResponse.json(orionConfig);
  } catch (error) {
    console.error("[ACTIVE_FLOW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const profile = await currentProfile();
    const { flowId } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedConfig = await db.appConfig.upsert({
      where: {
        appId_profileId: {
          appId: "orion",
          profileId: profile.id,
        },
      },
      update: {
        flowId,
      },
      create: {
        appId: "orion",
        profileId: profile.id,
        flowId,
      },
      include: {
        flow: {
          include: {
            components: true,
          },
        },
      },
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("[ACTIVE_FLOW_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
