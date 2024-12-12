// app/api/stellar/folders/[folderId]/position/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function PATCH(
  req: Request,
  { params }: { params: { folderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { position } = await req.json();

    const stellarProfile = await db.stellarProfile.findUnique({
      where: { profileId: profile.id },
    });

    if (!stellarProfile) {
      return new NextResponse("Stellar Profile not found", { status: 404 });
    }

    // Update folder position
    const updatedFolder = await db.stellarFolder.update({
      where: {
        id: params.folderId,
        stellarProfileId: stellarProfile.id, // Ensure folder belongs to user
      },
      data: { position },
      include: {
        files: true,
        children: true,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[FOLDER_POSITION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
