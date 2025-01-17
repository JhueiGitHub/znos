// app/api/flows/[flowId]/duplicate/route.ts
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { OrionFlowComponent } from "@/app/apps/flow/components/editors/orion-flow-types";

export async function POST(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the original flow with components
    const originalFlow = await db.flow.findUnique({
      where: {
        id: params.flowId,
        profileId: profile.id,
      },
      include: {
        components: true,
      },
    });

    if (!originalFlow) {
      return new NextResponse("Flow not found", { status: 404 });
    }

    // Create new flow with duplicated components
    const newFlow = await db.flow.create({
      data: {
        name: `${originalFlow.name} (Copy)`,
        description: originalFlow.description,
        type: originalFlow.type,
        profileId: profile.id,
        streamId: originalFlow.streamId,
        designSystemId: originalFlow.designSystemId,
        appId: originalFlow.appId,
        components: {
          create: originalFlow.components.map((component) => ({
            name: component.name,
            type: component.type,
            mode: component.mode,
            value: component.value,
            opacity: component.opacity,
            fontFamily: component.fontFamily,
            strokeWidth: component.strokeWidth,
            mappedTokenId: component.mappedTokenId,
            mediaId: component.mediaId,
            mediaUrl: component.mediaUrl,
            tokenId: component.tokenId,
            tokenValue: component.tokenValue,
            // Add outline-related fields
            outlineMode: component.outlineMode,
            outlineValue: component.outlineValue,
            outlineTokenId: component.outlineTokenId,
            // Ensure order is maintained
            order: component.order,
          })),
        },
      },
      include: {
        components: {
          orderBy: {
            order: 'asc'
          }
        },
      },
    });

    return NextResponse.json(newFlow);
  } catch (error) {
    console.error("[FLOW_DUPLICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}