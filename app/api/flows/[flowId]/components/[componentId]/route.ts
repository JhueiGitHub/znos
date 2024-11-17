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

    // Simplified flow check - only verify ownership
    const component = await db.flowComponent.findUnique({
      where: {
        id: componentId,
        flowId: flowId,
        flow: {
          profileId: profile.id,
        },
      },
    });

    if (!component) {
      return new NextResponse("Component not found", { status: 404 });
    }

    const updatedComponent = await db.flowComponent.update({
      where: {
        id: componentId,
      },
      data: {
        ...(updates.mode && { mode: updates.mode }),
        ...(updates.value && { value: updates.value }),
        ...(updates.tokenId && { tokenId: updates.tokenId }),
        ...(updates.mediaId && { mediaId: updates.mediaId }),
        ...(updates.icon && { value: updates.icon }),
      },
    });

    return NextResponse.json(updatedComponent);
  } catch (error) {
    console.error("[FLOW_COMPONENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
