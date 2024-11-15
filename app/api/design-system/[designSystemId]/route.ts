import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { designSystemId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, colorTokens, typographyTokens } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedDesignSystem = await db.designSystem.update({
      where: {
        id: params.designSystemId,
        profileId: profile.id,
      },
      data: {
        name,
        colorTokens: {
          deleteMany: {},
          createMany: {
            data: colorTokens.map((token: any) => ({
              ...token,
              opacity: token.opacity ? parseInt(token.opacity.toString(), 10) : null,
            })),
          },
        },
        typographyTokens: {
          deleteMany: {},
          createMany: {
            data: typographyTokens,
          },
        },
      },
      include: {
        colorTokens: true,
        typographyTokens: true,
      },
    });

    return NextResponse.json(updatedDesignSystem);
  } catch (error) {
    console.log("[DESIGN_SYSTEM_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
