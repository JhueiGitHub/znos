// app/api/obsidian/notes/[noteId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const note = await db.note.findUnique({
      where: {
        id: params.noteId,
        vault: {
          profileId: profile.id,
        },
      },
    });

    if (!note) {
      return new NextResponse("Note not found", { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();

    const note = await db.note.update({
      where: {
        id: params.noteId,
        vault: {
          profileId: profile.id,
        },
      },
      data: {
        content,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
