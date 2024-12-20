// app/api/obsidian/vaults/[vaultId]/folders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(
  req: Request,
  { params }: { params: { vaultId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Log the request details
    console.log("Getting folders for vault:", params.vaultId);

    const vault = await db.vault.findUnique({
      where: {
        id: params.vaultId,
        profileId: profile.id,
      },
      include: {
        folders: {
          include: {
            notes: {
              select: {
                id: true,
                title: true,
              },
            },
            children: {
              include: {
                notes: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        notes: {
          where: {
            folderId: null,
          },
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!vault) {
      console.log("Vault not found:", params.vaultId);
      return new NextResponse("Vault not found", { status: 404 });
    }

    // Log the raw data
    console.log("Raw vault data:", JSON.stringify(vault, null, 2));

    // Transform into tree structure
    const transformFolder = (folder: any) => ({
      id: folder.id,
      name: folder.name,
      isSelectable: true,
      children: [
        ...folder.children.map(transformFolder),
        ...folder.notes.map((note: any) => ({
          id: note.id,
          name: `${note.title}.md`,
          isSelectable: true,
        })),
      ],
    });

    // Create the tree structure exactly as the component expects
    const treeData = [{
      id: vault.id,
      name: vault.name,
      isSelectable: true,
      children: [
        ...vault.folders
          .filter(folder => !folder.parentId)
          .map(transformFolder),
        ...vault.notes.map(note => ({
          id: note.id,
          name: `${note.title}.md`,
          isSelectable: true,
        })),
      ],
    }];

    // Log the transformed data
    console.log("Transformed tree data:", JSON.stringify(treeData, null, 2));

    return NextResponse.json(treeData);
  } catch (error) {
    console.error("[VAULT_FOLDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}