// app/api/streams/[streamId]/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// GET specific stream
export async function GET(
  req: Request,
  { params }: { params: { streamId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stream = await db.stream.findUnique({
      where: {
        id: params.streamId,
        profileId: profile.id, // Security: ensure stream belongs to user
      },
      include: {
        flows: {
          include: {
            components: true,
          },
        },
      },
    });

    if (!stream) {
      return new NextResponse("Stream not found", { status: 404 });
    }

    return NextResponse.json(stream);
  } catch (error) {
    console.error("[STREAM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH (update) stream
export async function PATCH(
  req: Request,
  { params }: { params: { streamId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description } = await req.json();

    // Validate input
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const stream = await db.stream.update({
      where: {
        id: params.streamId,
        profileId: profile.id, // Security: ensure stream belongs to user
      },
      data: {
        name,
        description,
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
    console.error("[STREAM_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE stream
export async function DELETE(
  req: Request,
  { params }: { params: { streamId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Prevent deletion of core stream
    const stream = await db.stream.findUnique({
      where: { id: params.streamId },
    });

    if (stream?.type === "CORE") {
      return new NextResponse("Cannot delete core stream", { status: 400 });
    }

    await db.stream.delete({
      where: {
        id: params.streamId,
        profileId: profile.id, // Security: ensure stream belongs to user
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STREAM_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
