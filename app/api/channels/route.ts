// PRESERVED: Original channel creation API route core logic
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// EVOLVED: Enhanced error handling and serverId validation
export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();

    // EVOLVED: More robust URL parameter extraction
    const url = new URL(req.url);
    const serverId = url.searchParams.get("serverId");

    // EVOLVED: Enhanced validation with specific error messages
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      console.error("Missing serverId in request:", url.toString());
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    // EVOLVED: First verify server exists and user has permissions
    const serverCheck = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
    });

    if (!serverCheck) {
      console.error(`Server ${serverId} not found or user lacks permission`);
      return new NextResponse("Server not found or insufficient permissions", {
        status: 403,
      });
    }

    // PRESERVED: Original channel creation logic with enhanced error handling
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
      include: {
        channels: true, // Include channels in response
      },
    });

    // EVOLVED: Enhanced success response
    return NextResponse.json({
      server,
      message: "Channel created successfully",
    });
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
