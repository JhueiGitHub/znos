// app/api/xp/profile/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { CreatorStatus, CreatorTier } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Get current profile with proper error handling
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if XP profile already exists
    const existingXPProfile = await db.xPProfile.findUnique({
      where: {
        profileId: profile.id
      }
    });

    if (existingXPProfile) {
      return new NextResponse("XP Profile already exists", { status: 400 });
    }

    // Create new XP profile with default values
    const xpProfile = await db.xPProfile.create({
      data: {
        profileId: profile.id,
        displayName: profile.name,
        customImageUrl: profile.imageUrl,
        bio: "A new creator on XP",
        creatorTier: "STARTER",
        creatorStatus: "ACTIVE",
        isVerified: false,
        totalDownloads: 0,
        totalEarned: 0,
        designSystemsPublished: 0,
        followersCount: 0,
        followingCount: 0
      }
    });

    return NextResponse.json(xpProfile);
  } catch (error) {
    console.error("[XP_PROFILE_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const xpProfile = await db.xPProfile.findUnique({
      where: {
        profileId: profile.id
      }
    });

    return NextResponse.json(xpProfile);
  } catch (error) {
    console.error("[XP_PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}