"use client";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(
  req: Request,
  { params }: { params: { folderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, position } = await req.json();

    const parentFolder = await db.stellarFolder.findUnique({
      where: {
        id: params.folderId,
      },
    });

    if (!parentFolder) {
      return new NextResponse("Parent folder not found", { status: 404 });
    }

    const newFolder = await db.stellarFolder.create({
      data: {
        name,
        position,
        parent: {
          connect: { id: params.folderId },
        },
        stellarProfile: {
          connect: {
            id: parentFolder.stellarProfileId,
          },
        },
      },
      include: {
        files: true,
        children: true,
      },
    });

    return NextResponse.json(newFolder);
  } catch (error) {
    console.error("[FOLDER_CHILDREN_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
