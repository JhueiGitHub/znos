import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the stellar profile with its root folder and nested children
    const stellarProfile = await db.stellarProfile.findUnique({
      where: {
        profileId: profile.id,
      },
      include: {
        rootFolder: {
          include: {
            children: true,
            files: true,
          },
        },
      },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Transform the BigInt to string before sending
    const serializedProfile = {
      ...stellarProfile,
      driveCapacity: stellarProfile.driveCapacity.toString(),
    };

    return NextResponse.json(serializedProfile);
  } catch (error) {
    console.error("[STELLAR_FOLDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
