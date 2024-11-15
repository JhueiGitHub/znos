// app/api/flows/[flowId]/components/[componentId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function PATCH(
  req: Request,
  { params }: { params: { flowId: string; componentId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const component = await db.flowComponent.update({
      where: {
        id: params.componentId,
        flowId: params.flowId,
      },
      data: body,
    });

    return NextResponse.json(component);
  } catch (error) {
    console.error("[COMPONENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
