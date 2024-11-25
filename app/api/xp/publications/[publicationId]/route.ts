// app/api/xp/publications/[publicationId]/stats/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

// PATCH: Update publication stats (downloads, etc)
export async function PATCH(
  req: Request,
  { params }: { params: { publicationId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { type } = await req.json();
    
    if (!type) {
      return new NextResponse("Stat type required", { status: 400 });
    }

    const publication = await db.designSystemPublication.findUnique({
      where: {
        id: params.publicationId
      },
      include: {
        xpProfile: true
      }
    });

    if (!publication) {
      return new NextResponse("Publication not found", { status: 404 });
    }

    let updates = {};

    switch (type) {
      case "download":
        updates = {
          downloads: {
            increment: 1
          }
        };
        // Update creator's total downloads
        await db.xPProfile.update({
          where: {
            id: publication.xpProfileId
          },
          data: {
            totalDownloads: {
              increment: 1
            }
          }
        });
        break;
      // Add other stat types as needed
    }

    const updatedPublication = await db.designSystemPublication.update({
      where: {
        id: params.publicationId
      },
      data: updates
    });

    return NextResponse.json(updatedPublication);

  } catch (error) {
    console.error("[PUBLICATION_STATS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}