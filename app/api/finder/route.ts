import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, type, parentId } = await req.json();

    if (type === "folder") {
      const newFolder = await db.folder.create({
        data: {
          name,
          profileId: profile.id,
          parentId: parentId || null,
          isRoot: parentId ? false : true,
        },
        include: {
          subfolders: true,
          files: true,
        },
      });
      return NextResponse.json(newFolder);
    } else if (type === "file") {
      let folder;
      if (parentId) {
        folder = await db.folder.findUnique({ where: { id: parentId } });
      } else {
        folder = await db.folder.findFirst({
          where: { profileId: profile.id, isRoot: true },
        });
      }

      if (!folder) {
        return new NextResponse("Folder not found", { status: 404 });
      }

      const newFile = await db.file.create({
        data: {
          name,
          type: "text/plain", // Default type, adjust as needed
          size: 0,
          content: "",
          profileId: profile.id,
          folderId: folder.id,
        },
      });
      return NextResponse.json(newFile);
    } else {
      return new NextResponse("Invalid item type", { status: 400 });
    }
  } catch (error) {
    console.error("[FINDER_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
