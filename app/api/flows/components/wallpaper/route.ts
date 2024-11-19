// /api/flows/components/wallpaper/route.ts
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

// /api/flows/components/wallpaper/route.ts
export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First get the Orion stream
    const stream = await db.stream.findFirst({
      where: {
        appId: "orion",
        profileId: profile.id,
        type: "CONFIG",
      },
      include: {
        flows: {
          where: {
            name: "Zenith", // Get the Zenith flow
          },
          include: {
            components: {
              where: {
                type: "WALLPAPER",
              },
            },
          },
        },
      },
    });

    if (!stream?.flows[0]?.components[0]) {
      return new NextResponse("Wallpaper component not found", { status: 404 });
    }

    const wallpaperComponent = stream.flows[0].components[0];
    console.log("Returning wallpaper from Zenith flow:", wallpaperComponent);

    return NextResponse.json(wallpaperComponent);
  } catch (error) {
    console.error("[WALLPAPER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
