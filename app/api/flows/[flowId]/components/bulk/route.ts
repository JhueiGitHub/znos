// app/api/flows/[flowId]/components/bulk/route.ts
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { componentIds, updates } = await req.json();

    // Verify all components belong to the flow and user
    const components = await db.flowComponent.findMany({
      where: {
        id: { in: componentIds },
        flowId: params.flowId,
        flow: {
          profileId: profile.id,
        },
      },
    });

    if (components.length !== componentIds.length) {
      return new NextResponse("One or more components not found", {
        status: 404,
      });
    }

    // Perform bulk update in a transaction
    const updatedComponents = await db.$transaction(
      componentIds.map((id: string) =>
        db.flowComponent.update({
          where: { id },
          data: {
            mode: updates.mode,
            value: updates.value,
            tokenId: updates.tokenId,
            mediaId: updates.mediaId,
            mediaUrl: updates.mediaUrl,
            outlineMode: updates.outlineMode,
            outlineValue: updates.outlineValue,
            outlineTokenId: updates.outlineTokenId,
          },
        })
      )
    );

    return NextResponse.json(updatedComponents);
  } catch (error) {
    console.error("[FLOW_COMPONENTS_BULK_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
