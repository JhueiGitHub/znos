// app/api/windows/[windowId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function PATCH(
  req: Request,
  { params }: { params: { windowId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { state, isOpen, order } = await req.json();

    const window = await db.window.update({
      where: {
        id: params.windowId,
        profileId: profile.id,
      },
      data: {
        state,
        isOpen,
        order,
      },
    });

    return NextResponse.json(window);
  } catch (error) {
    console.error("[WINDOW_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
