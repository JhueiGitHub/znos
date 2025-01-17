// app/api/xp/publications/by-flow/[flowId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function DELETE(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find and delete the publication for this flow
    const deletedPublication = await db.designSystemPublication.deleteMany({
      where: {
        designSystemId: params.flowId,
        xpProfile: {
          profileId: profile.id // Ensure ownership
        }
      }
    });

    // Update XP profile stats
    if (deletedPublication.count > 0) {
      await db.xPProfile.update({
        where: {
          profileId: profile.id
        },
        data: {
          designSystemsPublished: {
            decrement: 1
          }
        }
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PUBLICATION_DELETE_BY_FLOW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}