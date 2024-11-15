// app/api/apps/[appId]/streams/route.ts
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { appId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const streams = await db.stream.findMany({
      where: {
        id: params.appId, // Changed from appId to id since we're passing the stream ID
        profileId: profile.id,
        type: "CONFIG", // Changed from CORE to CONFIG
      },
      include: {
        flows: {
          include: {
            components: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    console.log("[APP_STREAMS_GET] streamId:", params.appId);
    console.log("[APP_STREAMS_GET] streams:", JSON.stringify(streams, null, 2));

    return NextResponse.json(streams);
  } catch (error) {
    console.error("[APP_STREAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
