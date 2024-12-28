// /app/api/obsidian/daily-notes/[date]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { format, parse } from "date-fns";

// Get daily note for a specific date
export async function GET(
  req: Request,
  { params }: { params: { date: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the vault first
    const vault = await db.vault.findFirst({
      where: {
        profileId: profile.id,
      },
    });

    if (!vault) {
      return new NextResponse("Vault not found", { status: 404 });
    }

    const date = parse(params.date, "yyyy-MM-dd", new Date());
    const formattedDate = format(date, "yyyy-MM-dd");

    // Try to find an existing daily note
    const dailyNote = await db.note.findFirst({
      where: {
        vaultId: vault.id,
        frontmatter: {
          path: ["date"],
          equals: formattedDate,
        },
        isDaily: true,
      },
    });

    if (!dailyNote) {
      // Create a new daily note if one doesn't exist
      const newNote = await db.note.create({
        data: {
          title: format(date, "MMMM do, yyyy"),
          content: `# ${format(date, "MMMM do, yyyy")}\n\n`,
          vaultId: vault.id,
          frontmatter: {
            date: formattedDate,
            type: "daily",
          },
          isDaily: true,
        },
      });
      return NextResponse.json(newNote);
    }

    return NextResponse.json(dailyNote);
  } catch (error) {
    console.error("[DAILY_NOTE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// /app/api/obsidian/daily-notes/route.ts
export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { date } = await req.json();

    // Get the vault first
    const vault = await db.vault.findFirst({
      where: {
        profileId: profile.id,
      },
    });

    if (!vault) {
      return new NextResponse("Vault not found", { status: 404 });
    }

    const parsedDate = parse(date, "yyyy-MM-dd", new Date());
    const formattedDate = format(parsedDate, "yyyy-MM-dd");

    // Create a new daily note
    const newNote = await db.note.create({
      data: {
        title: format(parsedDate, "MMMM do, yyyy"),
        content: `# ${format(parsedDate, "MMMM do, yyyy")}\n\n`,
        vaultId: vault.id,
        frontmatter: {
          date: formattedDate,
          type: "daily",
        },
        isDaily: true,
      },
    });

    return NextResponse.json(newNote);
  } catch (error) {
    console.error("[DAILY_NOTE_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
