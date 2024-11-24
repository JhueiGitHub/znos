// app/api/flows/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { FlowType } from "@prisma/client";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const flows = await db.flow.findMany({
      where: { profileId: profile.id },
      include: { components: true },
    });

    return NextResponse.json(flows);
  } catch (error) {
    console.error("[FLOWS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, streamId, type } = await req.json();

    if (!name?.trim()) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!streamId) {
      return new NextResponse("Stream ID is required", { status: 400 });
    }

    if (!type || !Object.values(FlowType).includes(type)) {
      return new NextResponse("Invalid flow type", { status: 400 });
    }

    // Verify stream ownership and get design system ID
    const stream = await db.stream.findUnique({
      where: {
        id: streamId,
        profileId: profile.id,
      },
      include: {
        flows: {
          select: {
            designSystemId: true,
          },
          take: 1,
        },
      },
    });

    if (!stream) {
      return new NextResponse("Stream not found", { status: 404 });
    }

    // Use the same design system as other flows in the stream
    const designSystemId = stream.flows[0]?.designSystemId;

    if (!designSystemId) {
      return new NextResponse("Design system not found", { status: 404 });
    }

    const flow = await db.flow.create({
      data: {
        name,
        description,
        type,
        profileId: profile.id,
        streamId,
        designSystemId,
      },
      include: {
        components: true,
      },
    });

    return NextResponse.json(flow);
  } catch (error) {
    console.error("[FLOWS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
