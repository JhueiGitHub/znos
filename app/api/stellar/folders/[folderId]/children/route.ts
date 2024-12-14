// /root/app/api/stellar/folders/[folderId]/children/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(
  req: Request,
  { params }: { params: { folderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, position } = await req.json();

    // Verify parent folder and profile ownership
    const parentFolder = await db.stellarFolder.findUnique({
      where: {
        id: params.folderId,
      },
      include: {
        stellarProfile: true,
      },
    });

    if (!parentFolder) {
      return new NextResponse("Parent folder not found", { status: 404 });
    }

    if (parentFolder.stellarProfile.profileId !== profile.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create the new folder as a child of the parent
    const newFolder = await db.stellarFolder.create({
      data: {
        name,
        position,
        stellarProfileId: parentFolder.stellarProfileId,
        parentId: params.folderId,
      },
      include: {
        files: true,
        children: true,
      },
    });

    return NextResponse.json(newFolder);
  } catch (error) {
    console.error("[FOLDER_CHILDREN_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
