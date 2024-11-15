// app/api/flows/initial/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const flows = await db.flow.findMany({
      where: {
        profileId: profile.id,
      },
      include: {
        designSystem: {
          include: {
            colorTokens: true,
            typographyTokens: true,
          },
        },
        components: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ flows });
  } catch (error) {
    console.error("[FLOWS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
