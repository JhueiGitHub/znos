// app/api/stellar/profile/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if Stellar profile already exists
    const existingProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
    });

    if (existingProfile) {
      return new NextResponse("Stellar Profile already exists", {
        status: 400,
      });
    }

    // Create new Stellar profile
    const stellarProfile = await db.stellarProfile.create({
      data: {
        profileId: profile.id,
        name: profile.name,
        driveCapacity: 5368709120, // 5GB
        currentUsage: 0,
        settings: {
          create: {
            defaultView: "grid",
            sortBy: "name",
            showHidden: false,
          },
        },
      },
    });

    return NextResponse.json(stellarProfile);
  } catch (error) {
    console.error("[STELLAR_PROFILE_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stellarProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
      include: {
        settings: true,
        rootFolder: true,
      },
    });

    return NextResponse.json(stellarProfile);
  } catch (error) {
    console.error("[STELLAR_PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
