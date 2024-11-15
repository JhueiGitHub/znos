// app/api/apps/route.ts
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

// app/api/apps/route.ts
export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Query app-specific streams
    const apps = await db.stream.findMany({
      where: {
        type: "CONFIG", // Changed from CORE to CONFIG
        profileId: profile.id,
        appId: "orion", // Initially just query Orion
      },
      include: {
        flows: {
          include: {
            components: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
      },
    });

    // If Orion app stream doesn't exist, create it
    if (!apps.find((app) => app.appId === "orion")) {
      let designSystem = await db.designSystem.findUnique({
        where: {
          profileId: profile.id,
        },
      });

      if (!designSystem) {
        designSystem = await db.designSystem.create({
          data: {
            name: "Default",
            profileId: profile.id,
          },
        });
      }

      // Create Orion stream with initial config
      const orionStream = await db.stream.create({
        data: {
          name: "Orion",
          description: "OS Configuration",
          type: "CONFIG", // Changed from CORE to CONFIG
          appId: "orion",
          profileId: profile.id,
          flows: {
            create: {
              name: "Zenith",
              description: "Default OS Configuration",
              type: "CONFIG",
              profileId: profile.id,
              designSystemId: designSystem.id,
              components: {
                create: [
                  {
                    name: "Wallpaper",
                    type: "WALLPAPER",
                    value: "/media/wallpaper.jpg",
                    order: 0,
                  },
                  {
                    name: "Finder",
                    type: "DOCK_ICON",
                    value: "/icns/_finder.png",
                    order: 1,
                  },
                  {
                    name: "Flow",
                    type: "DOCK_ICON",
                    value: "/icns/_flow.png",
                    order: 2,
                  },
                  {
                    name: "Discord",
                    type: "DOCK_ICON",
                    value: "/icns/_discord.png",
                    order: 3,
                  },
                ],
              },
            },
          },
        },
        include: {
          flows: {
            include: {
              components: true,
            },
          },
        },
      });

      apps.push(orionStream);
    }

    return NextResponse.json(apps);
  } catch (error) {
    console.error("[APPS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
