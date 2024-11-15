// app/api/flows/[flowId]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { Flow, FlowComponent } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const flow = await db.flow.findUnique({
      where: { id: params.flowId, profileId: profile.id },
      include: {
        components: true,
        stream: true, // Add this to get the stream type
      },
    });

    if (!flow) {
      return new NextResponse("Flow not found", { status: 404 });
    }

    return NextResponse.json(flow);
  } catch (error: unknown) {
    console.error("[FLOW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { components } = await req.json();

    const updatedFlow = await db.flow.update({
      where: {
        id: params.flowId,
        profileId: profile.id,
      },
      data: {
        components: {
          deleteMany: {},
          createMany: {
            data: components.map((component: any) => {
              const baseComponent = {
                type: component.type,
                name: component.name,
              };

              if (component.type === "color") {
                return {
                  ...baseComponent,
                  value: component.value,
                  opacity: component.opacity
                    ? parseInt(component.opacity as string, 10)
                    : null,
                };
              } else if (component.type === "typography") {
                return {
                  ...baseComponent,
                  fontFamily: component.fontFamily,
                  value: component.fontFamily, // Use fontFamily as value for typography components
                };
              }

              return baseComponent;
            }),
          },
        },
      },
      include: {
        components: true,
      },
    });

    return NextResponse.json(updatedFlow);
  } catch (error) {
    console.error("[FLOW_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.flow.delete({
      where: { id: params.flowId, profileId: profile.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("[FLOW_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
