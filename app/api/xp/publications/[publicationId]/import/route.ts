// app/api/xp/publications/[publicationId]/import/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { FlowComponentWithMedia } from "@/app/types/prisma";

export async function POST(
  req: Request,
  { params }: { params: { publicationId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Get the publication
    const publication = await db.designSystemPublication.findUnique({
      where: {
        id: params.publicationId,
      },
    });

    if (!publication) {
      return new NextResponse("Publication not found", { status: 404 });
    }

    // 2. Get the source flow with everything we need
    const sourceFlow = await db.flow.findUnique({
      where: {
        id: publication.designSystemId,
      },
      include: {
        components: {
          include: {
            mediaItem: true,
          },
        },
      },
    });

    if (!sourceFlow) {
      return new NextResponse("Source flow not found", { status: 404 });
    }

    // 3. Get/create Orion stream for the importing user
    let orionStream = await db.stream.findFirst({
      where: {
        profileId: profile.id,
        appId: "orion",
        type: "CONFIG",
      },
    });

    if (!orionStream) {
      orionStream = await db.stream.create({
        data: {
          name: "Orion",
          description: "OS Configuration",
          type: "CONFIG",
          appId: "orion",
          profileId: profile.id,
        },
      });
    }

    // 4. Create media copies with safe typing
    const mediaMapping = new Map<string, string>();
    const components =
      sourceFlow.components as unknown as FlowComponentWithMedia[];

    for (const component of components) {
      if (
        component.mediaItem &&
        component.mediaItem.name &&
        component.mediaItem.type &&
        component.mediaItem.url
      ) {
        // Create new media item for the importing user
        const newMedia = await db.mediaItem.create({
          data: {
            name: component.mediaItem.name,
            type: component.mediaItem.type,
            url: component.mediaItem.url,
            profileId: profile.id,
          },
        });

        if (component.mediaId) {
          mediaMapping.set(component.mediaId, newMedia.id);
        }
      }
    }

    // 5. Create the new flow with proper media references
    const newFlow = await db.flow.create({
      data: {
        name: sourceFlow.name,
        description: sourceFlow.description,
        type: "CONFIG",
        profileId: profile.id,
        streamId: orionStream.id,
        designSystemId: sourceFlow.designSystemId,
        components: {
          create: components.map((component) => {
            const baseComponent = {
              name: component.name,
              type: component.type,
              mode: component.mode,
              value: component.value,
              opacity: component.opacity,
              strokeWidth: component.strokeWidth,
              order: component.order,
              mediaUrl: component.mediaUrl,
            };

            // Only add mediaId if we have a mapping for it
            if (component.mediaId && mediaMapping.has(component.mediaId)) {
              return {
                ...baseComponent,
                mediaId: mediaMapping.get(component.mediaId),
              };
            }

            return baseComponent;
          }),
        },
      },
      include: {
        components: {
          include: {
            mediaItem: true,
          },
        },
      },
    });

    // 6. Update stats
    await db.designSystemPublication.update({
      where: { id: params.publicationId },
      data: {
        downloads: { increment: 1 },
      },
    });

    // 7. Update creator stats
    await db.xPProfile.update({
      where: { id: publication.xpProfileId },
      data: {
        totalDownloads: { increment: 1 },
      },
    });

    return NextResponse.json(newFlow);
  } catch (error) {
    console.error("[PUBLICATION_IMPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
