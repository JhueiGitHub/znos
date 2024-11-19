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

    // First get the profile's design system
    const designSystem = await db.designSystem.findUnique({
      where: {
        profileId: profile.id
      }
    });

    if (!designSystem) {
      return new NextResponse(
        "Design system not found",
        { status: 404 }
      );
    }

    // Get the Orion app's config flow with components
    const existingConfig = await db.appConfig.findFirst({
      where: {
        appId: "orion",
        profileId: profile.id
      },
      include: {
        flow: {
          include: {
            components: true
          }
        }
      }
    });

    // If no config exists, create default one
    if (!existingConfig) {
      // First create the flow
      const flow = await db.flow.create({
        data: {
          name: "Orion Config",
          type: FlowType.CONFIG,
          profileId: profile.id,
          designSystemId: designSystem.id,
        }
      });

      // Then create the wallpaper component
      await db.flowComponent.create({
        data: {
          name: "Wallpaper",
          type: "WALLPAPER",
          mode: "color",
          tokenId: "Black",
          order: 0,
          flowId: flow.id,
        }
      });

      // Finally create the app config
      const newConfig = await db.appConfig.create({
        data: {
          appId: "orion",
          profileId: profile.id,
          flowId: flow.id,
        },
        include: {
          flow: {
            include: {
              components: true
            }
          }
        }
      });

      return NextResponse.json(newConfig satisfies ConfigWithFlow);
    }

    return NextResponse.json(existingConfig satisfies ConfigWithFlow);
  } catch (error) {
    console.error("[ORION_CONFIG_GET]", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch config",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}