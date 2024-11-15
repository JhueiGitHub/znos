import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ColorToken, TypographyToken } from "@prisma/client";

export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const designSystem = await db.designSystem.findUnique({
      where: {
        profileId: profile.id,
      },
      include: {
        colorTokens: true,
        typographyTokens: true,
      },
    });

    return NextResponse.json(designSystem);
  } catch (error: unknown) {
    console.log("[DESIGN_SYSTEM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, colorTokens, typographyTokens } = await req.json() as {
      name: string;
      colorTokens: Partial<ColorToken>[];
      typographyTokens: Partial<TypographyToken>[];
    };

    const updatedDesignSystem = await db.designSystem.update({
      where: {
        profileId: profile.id,
      },
      data: {
        name,
        colorTokens: {
          deleteMany: {},
          createMany: {
            data: colorTokens.map(({ id, designSystemId, createdAt, updatedAt, ...rest }) => ({
              ...rest,
              opacity: rest.opacity ? parseInt(rest.opacity.toString(), 10) : null,
            } as ColorToken)),
          },
        },
        typographyTokens: {
          deleteMany: {},
          createMany: {
            data: typographyTokens.map(({ id, designSystemId, createdAt, updatedAt, ...rest }) => rest as TypographyToken),
          },
        },
      },
      include: {
        colorTokens: true,
        typographyTokens: true,
      },
    });

    return NextResponse.json(updatedDesignSystem);
  } catch (error: unknown) {
    console.log("[DESIGN_SYSTEM_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
