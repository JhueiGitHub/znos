// app/api/xp/publications/[publicationId]/import/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { FlowComponent, MediaItem, MediaType } from "@prisma/client";

interface FlowComponentWithMedia extends Omit<FlowComponent, 'mediaItem'> {
  mediaItem?: MediaItem | null;
}

export async function POST(
  req: Request,
  { params }: { params: { publicationId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // EVOLVED: Get publication with source profile data
    const publication = await db.designSystemPublication.findUnique({
      where: {
        id: params.publicationId,
      },
      include: {
        xpProfile: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!publication) {
      return new NextResponse("Publication not found", { status: 404 });
    }

    // EVOLVED: Get source flow with explicit logging
    console.log("Fetching source flow:", publication.designSystemId);
    const sourceFlow = await db.flow.findUnique({
      where: {
        id: publication.designSystemId,
      },
      include: {
        components: {
          include: {
            mediaItem: true
          }
        }
      }
    });

    if (!sourceFlow) {
      return new NextResponse("Source flow not found", { status: 404 });
    }

    console.log("Source flow components:", JSON.stringify(sourceFlow.components, null, 2));

    // PRESERVED: Get/create Orion stream
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

    // EVOLVED: Enhanced media mapping with explicit error handling
    const mediaMapping = new Map<string, string>();
    const components = sourceFlow.components;

    // EVOLVED: More robust media creation with fallback naming
    for (const component of components) {
      if (component.mode === "media" && component.value) {
        console.log("Processing media component:", component);
        
        try {
          // Extract name from URL or use fallback
          const urlParts = component.value.split("/");
          const fileName = urlParts[urlParts.length - 1] || "unknown-media";
          
          const newMedia = await db.mediaItem.create({
            data: {
              name: fileName,
              type: "IMAGE" as MediaType, // Default to IMAGE type
              url: component.value,
              profileId: profile.id,
            },
          });

          console.log("Created new media item:", newMedia);

          if (component.mediaId) {
            mediaMapping.set(component.mediaId, newMedia.id);
          }
        } catch (error) {
          console.error("Failed to create media item:", error);
          continue; // Skip this media item but continue with others
        }
      }
    }

    // EVOLVED: Create flow with complete component data
    const newFlow = await db.flow.create({
      data: {
        name: sourceFlow.name,
        description: sourceFlow.description,
        type: "CONFIG",
        profileId: profile.id,
        streamId: orionStream.id,
        designSystemId: sourceFlow.designSystemId,
        // Inside the flow creation, replace the component mapping section with:
components: {
  create: components.map((component) => {
    const baseComponent = {
      name: component.name,
      type: component.type,
      mode: component.mode,
      value: component.value,
      opacity: component.opacity,
      fontFamily: component.fontFamily,
      strokeWidth: component.strokeWidth,
      mappedTokenId: component.mappedTokenId,
      mediaUrl: component.mediaUrl,
      order: component.order,
      tokenId: component.tokenId,
      tokenValue: component.tokenValue,
      outlineMode: component.outlineMode,
      outlineValue: component.outlineValue,
      outlineTokenId: component.outlineTokenId,
    };

    // Only add mediaId if it exists and is mapped
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

    // PRESERVED: Update statistics
    await db.designSystemPublication.update({
      where: { id: params.publicationId },
      data: {
        downloads: { increment: 1 },
      },
    });

    await db.xPProfile.update({
      where: { id: publication.xpProfileId },
      data: {
        totalDownloads: { increment: 1 },
      },
    });

    return NextResponse.json(newFlow);
  } catch (error) {
    console.error("[PUBLICATION_IMPORT] Detailed error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}