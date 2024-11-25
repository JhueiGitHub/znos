// New API route for fetching all profiles
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profiles = await db.xPProfile.findMany({
      where: {
        creatorStatus: "ACTIVE"
      },
      include: {
        publishedDesignSystems: true
      }
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("[XP_PROFILES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}