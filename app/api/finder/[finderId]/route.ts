import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(
  req: Request,
  { params }: { params: { finderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { finderId } = params;

    let folder;
    if (finderId === "root") {
      folder = await db.folder.findFirst({
        where: {
          profileId: profile.id,
          isRoot: true,
        },
        include: {
          subfolders: true,
          files: true,
        },
      });
    } else {
      folder = await db.folder.findUnique({
        where: {
          id: finderId,
          profileId: profile.id,
        },
        include: {
          subfolders: true,
          files: true,
        },
      });
    }

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("[FINDER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { finderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { finderId } = params;
    const { name, type } = await req.json();

    if (type === "folder") {
      const updatedFolder = await db.folder.update({
        where: {
          id: finderId,
          profileId: profile.id,
        },
        data: { name },
      });
      return NextResponse.json(updatedFolder);
    } else if (type === "file") {
      const updatedFile = await db.file.update({
        where: {
          id: finderId,
          profileId: profile.id,
        },
        data: { name },
      });
      return NextResponse.json(updatedFile);
    } else {
      return new NextResponse("Invalid item type", { status: 400 });
    }
  } catch (error) {
    console.error("[FINDER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { finderId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { finderId } = params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "folder") {
      await db.folder.delete({
        where: {
          id: finderId,
          profileId: profile.id,
        },
      });
    } else if (type === "file") {
      await db.file.delete({
        where: {
          id: finderId,
          profileId: profile.id,
        },
      });
    } else {
      return new NextResponse("Invalid item type", { status: 400 });
    }

    return new NextResponse("Item deleted", { status: 200 });
  } catch (error) {
    console.error("[FINDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
