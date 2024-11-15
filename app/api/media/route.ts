// app/api/media/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { MediaType } from "@prisma/client";

// Type guard for MediaType
function isValidMediaType(type: string): type is MediaType {
  return ["IMAGE", "VIDEO", "FONT"].includes(type);
}

export async function POST(req: Request) {
  try {
    // 1. Get current profile
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const { name, type, url } = body;

    // 3. Validate required fields
    if (!name || !type || !url) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 4. Validate media type
    if (!isValidMediaType(type)) {
      return new NextResponse("Invalid media type", { status: 400 });
    }

    // 5. Create media item with validated data
    const mediaItem = await db.mediaItem.create({
      data: {
        name,
        type,
        url,
        profileId: profile.id, // Using profileId as per schema
      },
    });

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error("[MEDIA_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // 1. Get current profile
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Get all media items for profile
    const mediaItems = await db.mediaItem.findMany({
      where: {
        profileId: profile.id, // Using profileId as per schema
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error("[MEDIA_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add single item operations
export async function DELETE(req: Request) {
  try {
    // 1. Get current profile
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Get mediaId from URL
    const url = new URL(req.url);
    const mediaId = url.searchParams.get("id");

    if (!mediaId) {
      return new NextResponse("Media ID required", { status: 400 });
    }

    // 3. Delete media item (only if owned by profile)
    await db.mediaItem.delete({
      where: {
        id: mediaId,
        profileId: profile.id, // Ensure ownership
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEDIA_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
