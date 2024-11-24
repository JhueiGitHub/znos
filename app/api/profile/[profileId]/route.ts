// app/api/profile/[profileId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const body = await req.json();

    const profile = await db.profile.update({
      where: {
        id: params.profileId,
      },
      data: {
        hasSeenIntro: body.hasSeenIntro,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.log("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}