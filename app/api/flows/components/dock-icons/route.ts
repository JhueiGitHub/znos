// 2. NEW: /api/flows/components/dock-icons/route.ts
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

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
                type: "DOCK_ICON",
              },
              orderBy: {
                order: "asc", // Ensure icons are ordered correctly
              },
            },
          },
        },
      },
    });

    if (!stream?.flows[0]?.components.length) {
      return new NextResponse("Dock icon components not found", {
        status: 404,
      });
    }

    const dockIconComponents = stream.flows[0].components;
    console.log("Returning dock icons from Zenith flow:", dockIconComponents);

    return NextResponse.json(dockIconComponents);
  } catch (error) {
    console.error("[DOCK_ICONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
