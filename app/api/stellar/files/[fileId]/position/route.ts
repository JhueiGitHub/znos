// app/api/stellar/files/[fileId]/position/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function PATCH(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { position } = await req.json();

    // Get profile and stellar profile
    const stellarProfile = await db.stellarProfile.findUnique({
      where: { profileId: profile.id },
      include: { rootFolder: true },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Update file position
    const updatedFile = await db.stellarFile.update({
      where: {
        id: params.fileId,
        stellarFolder: {
          stellarProfileId: stellarProfile.id, // Ensure file belongs to user
        },
      },
      data: { position },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("[FILE_POSITION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
