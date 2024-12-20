// app/apps/obsidian/[noteId]/page.tsx
import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface NotePageProps {
  params: {
    noteId: string;
  };
}

const NotePage = async ({ params }: NotePageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/");
  }

  // If no noteId provided, get the first note from the user's vault
  if (!params.noteId) {
    const firstNote = await db.note.findFirst({
      where: {
        vault: {
          profileId: profile.id,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (firstNote) {
      redirect(`/apps/obsidian/${firstNote.id}`);
    }
  }

  // Verify the note exists and belongs to the user
  const note = await db.note.findUnique({
    where: {
      id: params.noteId,
      vault: {
        profileId: profile.id,
      },
    },
  });

  if (!note) {
    redirect("/apps/obsidian");
  }

  return null; // Client component handles the rendering
};

export default NotePage;
