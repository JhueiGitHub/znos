// /app/api/flows/[flowId]/components/[componentId]/route.ts
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

    console.log("Received updates:", updates);

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
        // Fill properties
        mode: updates.mode,
        value: updates.value,
        tokenId: updates.tokenId,
        mediaId: updates.mediaId,
        mediaUrl: updates.mediaUrl,

        // Outline properties
        outlineMode: updates.outlineMode,
        outlineValue: updates.outlineValue,
        outlineTokenId: updates.outlineTokenId,
      },
    });

    // After updating the component
    if (component.type === "CURSOR") {
      // Get the active flow config
      const activeConfig = await db.appConfig.findFirst({
        where: {
          appId: "orion",
          profileId: profile.id,
        },
      });

      // If this component's flow is the active flow, update timestamps
      if (activeConfig && activeConfig.flowId === flowId) {
        await db.appConfig.update({
          where: {
            id: activeConfig.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });
      }
    }

    console.log("Updated component:", updatedComponent);

    return NextResponse.json(updatedComponent);
  } catch (error) {
    console.error("[FLOW_COMPONENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
