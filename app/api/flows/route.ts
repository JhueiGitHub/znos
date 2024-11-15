// app/api/flows/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const flows = await db.flow.findMany({
      where: { profileId: profile.id },
      include: { components: true },
    });

    return NextResponse.json(flows);
  } catch (error) {
    console.error("[FLOWS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description } = await req.json();
    const flow = await db.flow.create({
      data: {
        name,
        description,
        profileId: profile.id,
        designSystemId: profile.designSystem?.id ?? "", // Assuming the profile has a design system
      },
    });

    return NextResponse.json(flow);
  } catch (error) {
    console.error("[FLOWS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
