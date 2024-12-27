// app/api/windows/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const windows = await db.window.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(windows);
  } catch (error) {
    console.error("[WINDOWS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { appId, state, isOpen, order } = await req.json();

    const window = await db.window.create({
      data: {
        profileId: profile.id,
        appId,
        state,
        isOpen,
        order,
      },
    });

    return NextResponse.json(window);
  } catch (error) {
    console.error("[WINDOWS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
