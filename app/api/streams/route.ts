// app/api/streams/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { StreamType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") || "streams";

    const streams = await db.stream.findMany({
      where: {
        profileId: profile.id,
        type: section === "apps" ? "CONFIG" : "CORE",
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
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(streams);
  } catch (error) {
    console.error("[STREAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, type, appId } = await req.json();

    // Validate input
    if (!name?.trim()) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!type || !Object.values(StreamType).includes(type)) {
      return new NextResponse("Invalid stream type", { status: 400 });
    }

    let designSystem = await db.designSystem.findUnique({
      where: { profileId: profile.id },
    });

    // Create design system if it doesn't exist
    if (!designSystem) {
      designSystem = await db.designSystem.create({
        data: {
          name: "Default",
          profileId: profile.id,
        },
      });
    }

    const stream = await db.stream.create({
      data: {
        name,
        description,
        type,
        appId,
        profileId: profile.id,
        flows: {
          create: {
            name: "Main",
            type: type === "CONFIG" ? "CONFIG" : "CORE",
            profileId: profile.id,
            designSystemId: designSystem.id,
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

    return NextResponse.json(stream);
  } catch (error) {
    console.error("[STREAMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
