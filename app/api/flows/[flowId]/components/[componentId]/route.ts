// /api/flows/[flowId]/components/[componentId]/route.ts
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { flowId: string; componentId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { flowId, componentId } = params;
    const updates = await req.json();

    // Verify flow ownership and type
    const flow = await db.flow.findFirst({
      where: {
        id: flowId,
        profileId: profile.id,
        type: "CONFIG", // Ensure it's a CONFIG type flow
        appId: "orion", // Ensure it's the Orion app
      },
    });

    if (!flow) {
      return new NextResponse("Flow not found", { status: 404 });
    }

    // Handle different component types
    const component = await db.flowComponent.update({
      where: {
        id: componentId,
        flowId: flowId,
      },
      data: {
        // For wallpaper
        ...(updates.mode && { mode: updates.mode }),
        ...(updates.value && { value: updates.value }),
        ...(updates.tokenId && { tokenId: updates.tokenId }),
        ...(updates.mediaId && { mediaId: updates.mediaId }),
        // For dock icons
        ...(updates.icon && { value: updates.icon }),
      },
    });

    return NextResponse.json(component);
  } catch (error) {
    console.error("[FLOW_COMPONENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
