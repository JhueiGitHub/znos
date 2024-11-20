// app/api/apps/orion/config/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { Flow, FlowType, FlowComponent, AppConfig } from "@prisma/client";

interface ConfigWithFlow extends AppConfig {
  flow: Flow & {
    components: FlowComponent[];
  };
}

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

    // Get the Orion app's config flow with components
    const existingConfig = await db.appConfig.findFirst({
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

    if (!existingConfig) {
      return new NextResponse("Config not found", { status: 404 });
    }

    // Return both design system and config data
    return NextResponse.json({
      designSystem,
      config: existingConfig,
    });
  } catch (error) {
    console.error("[ORION_CONFIG_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}
