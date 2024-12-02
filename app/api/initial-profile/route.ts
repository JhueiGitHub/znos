import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (profile) {
      const server = await db.server.findFirst({
        where: {
          members: {
            some: {
              profileId: profile.id,
            },
          },
        },
      });

      return NextResponse.json({ profile, server });
    }

    const newProfile = await db.profile.create({
      data: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return NextResponse.json({ profile: newProfile, server: null });
  } catch (error) {
    console.log("[INITIAL_PROFILE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
