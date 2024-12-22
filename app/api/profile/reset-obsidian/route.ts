// app/api/profile/reset-obsidian/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.$transaction(async (tx) => {
      // First, delete all existing obsidian data for this user
      await tx.note.deleteMany({
        where: {
          vault: {
            profileId: profile.id,
          },
        },
      });

      await tx.obsidianFolder.deleteMany({
        where: {
          vault: {
            profileId: profile.id,
          },
        },
      });

      await tx.vault.deleteMany({
        where: {
          profileId: profile.id,
        },
      });

      // Now recreate the default structure
      const mainVault = await tx.vault.create({
        data: {
          name: "My Notebook",
          profileId: profile.id,
          settings: {
            theme: "zenith",
            enableBacklinks: true,
            enableTags: true,
            enableAliases: true,
          },
        },
      });

      const chapter1Folder = await tx.obsidianFolder.create({
        data: {
          name: "Chapter 1",
          vaultId: mainVault.id,
        },
      });

      const chapter2Folder = await tx.obsidianFolder.create({
        data: {
          name: "Chapter 2",
          vaultId: mainVault.id,
        },
      });

      // Create the default notes
      const notes = [
        {
          title: "Notes",
          content: "# Notes\n\nYour notes content here",
          vaultId: mainVault.id,
          folderId: chapter1Folder.id,
          frontmatter: { created: new Date().toISOString() },
        },
        {
          title: "Ideas",
          content: "# Ideas\n\nYour ideas content here",
          vaultId: mainVault.id,
          folderId: chapter1Folder.id,
          frontmatter: { created: new Date().toISOString() },
        },
        {
          title: "Research",
          content: "# Research\n\nYour research content here",
          vaultId: mainVault.id,
          folderId: chapter2Folder.id,
          frontmatter: { created: new Date().toISOString() },
        },
        {
          title: "Case Studies",
          content: "# Case Studies\n\nYour case studies content here",
          vaultId: mainVault.id,
          folderId: chapter2Folder.id,
          frontmatter: { created: new Date().toISOString() },
        },
      ];

      await Promise.all(
        notes.map((note) =>
          tx.note.create({
            data: note,
          })
        )
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESET_OBSIDIAN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
