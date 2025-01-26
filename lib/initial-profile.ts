import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";

// EVOLVED: Better type safety for note creation
type NoteCreateInput = {
  title: string;
  content: string;
  frontmatter: Record<string, any>;
  vaultId: string;
  folderId: string;
};

const createNote = async (tx: any, data: NoteCreateInput) => {
  return tx.note.create({
    data: {
      title: data.title,
      content: data.content,
      vaultId: data.vaultId,
      folderId: data.folderId,
      frontmatter: data.frontmatter,
    },
  });
};

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) {
    return redirectToSignIn();
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (profile) {
    return profile;
  }

  // Use Prisma transaction to ensure all operations complete together
  const newProfile = await db.$transaction(async (tx) => {
    // Profile creation stays the same...
    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    // Design system creation stays the same...
    const designSystem = await tx.designSystem.create({
      data: {
        name: "Zenith",
        profileId: profile.id,
        colorTokens: {
          createMany: {
            data: [
              { name: "Underlying BG", value: "#292929", opacity: 81 },
              { name: "Overlaying BG", value: "#010203", opacity: 69 },
              { name: "Brd", value: "#292929", opacity: 81 },
              { name: "Black", value: "#000000", opacity: 100 },
              { name: "Glass", value: "#000000", opacity: 30 },
              { name: "White", value: "#CCCCCC", opacity: 69 },
              { name: "Lilac Accent", value: "#7B6CBD", opacity: 100 },
              { name: "Teal Accent", value: "#003431", opacity: 100 },
              { name: "Text Primary (Hd)", value: "#ABC4C3", opacity: 100 },
              { name: "Text Secondary (Bd)", value: "#748393", opacity: 100 },
              // Base colors with undefined (100%) strength
              { name: "black", value: "#000000", opacity: 100 },
              { name: "night", value: "#010203", opacity: 100 },
              { name: "graphite", value: "#292929", opacity: 100 },
              { name: "smoke", value: "#CCCCCC", opacity: 100 },
              { name: "latte", value: "#4C4F69", opacity: 100 },
              // Color variants with strengths
              { name: "black-thick", value: "#000000", opacity: 81 },
              { name: "black-med", value: "#000000", opacity: 72 },
              { name: "black-thin", value: "#000000", opacity: 54 },
              { name: "black-glass", value: "#000000", opacity: 30 },
              { name: "night-thick", value: "#010203", opacity: 81 },
              { name: "night-med", value: "#010203", opacity: 72 },
              { name: "night-thin", value: "#010203", opacity: 54 },
              { name: "night-glass", value: "#010203", opacity: 30 },
              { name: "graphite-thick", value: "#292929", opacity: 81 },
              { name: "graphite-med", value: "#292929", opacity: 72 },
              { name: "graphite-thin", value: "#292929", opacity: 54 },
              { name: "graphite-glass", value: "#292929", opacity: 30 },
              { name: "smoke-thick", value: "#CCCCCC", opacity: 81 },
              { name: "smoke-med", value: "#CCCCCC", opacity: 72 },
              { name: "smoke-thin", value: "#CCCCCC", opacity: 54 },
              { name: "smoke-glass", value: "#CCCCCC", opacity: 30 },
              { name: "latte-thick", value: "#4C4F69", opacity: 81 },
              { name: "latte-med", value: "#4C4F69", opacity: 72 },
              { name: "latte-thin", value: "#4C4F69", opacity: 54 },
              { name: "latte-glass", value: "#4C4F69", opacity: 30 },
              { name: "latte-inner", value: "#1E202A", opacity: 100 },
              { name: "latte-outer", value: "#35374A", opacity: 100 },
            ],
          },
        },
        typographyTokens: {
          createMany: {
            data: [
              { name: "Text Primary", fontFamily: "Arial" },
              { name: "Text Secondary", fontFamily: "Inter" },
            ],
          },
        },
      },
    });

    // Stream creation stays the same...
    const stream = await tx.stream.create({
      data: {
        name: "Core",
        description: "Core design system stream",
        type: "CORE",
        profileId: profile.id,
      },
    });

    // Modified flow creation to include design system tokens as components
    await tx.flow.create({
      data: {
        name: "Zenith",
        description: "Core design system flow",
        type: "CORE",
        profileId: profile.id,
        streamId: stream.id,
        designSystemId: designSystem.id,
        components: {
          create: [
            // Map color tokens to components
            {
              name: "Underlying BG",
              type: "COLOR",
              value: "#292929",
              opacity: 81,
              order: 1,
            },
            {
              name: "Overlaying BG",
              type: "COLOR",
              value: "#010203",
              opacity: 69,
              order: 2,
            },
            {
              name: "Brd",
              type: "COLOR",
              value: "#292929",
              opacity: 81,
              order: 3,
            },
            {
              name: "Black",
              type: "COLOR",
              value: "#000000",
              opacity: 100,
              order: 4,
            },
            {
              name: "Glass",
              type: "COLOR",
              value: "#000000",
              opacity: 30,
              order: 5,
            },
            {
              name: "White",
              type: "COLOR",
              value: "#CCCCCC",
              opacity: 69,
              order: 6,
            },
            {
              name: "Lilac Accent",
              type: "COLOR",
              value: "#7B6CBD",
              opacity: 100,
              order: 7,
            },
            {
              name: "Teal Accent",
              type: "COLOR",
              value: "#003431",
              opacity: 100,
              order: 8,
            },
            {
              name: "Text Primary (Hd)",
              type: "COLOR",
              value: "#ABC4C3",
              opacity: 100,
              order: 9,
            },
            {
              name: "Text Secondary (Bd)",
              type: "COLOR",
              value: "#748393",
              opacity: 100,
              order: 10,
            },
            // Map typography tokens to components
            {
              name: "Text Primary",
              type: "TYPOGRAPHY",
              value: null,
              fontFamily: "Arial",
              order: 11,
            },
            {
              name: "Text Secondary",
              type: "TYPOGRAPHY",
              value: null,
              fontFamily: "Inter",
              order: 12,
            },
            // Keep the original media components
            { name: "Wallpaper", type: "VIDEO", value: null, order: 13 },
            { name: "Dock Icons", type: "IMAGE", value: null, order: 14 },
            { name: "Font Primary", type: "FONT", value: null, order: 15 },
            { name: "Font Secondary", type: "FONT", value: null, order: 16 },
          ],
        },
      },
    });

    const orionStream = await tx.stream.create({
      data: {
        name: "Orion",
        description: "OS Configuration",
        type: "CONFIG",
        appId: "orion",
        profileId: profile.id,
        flows: {
          create: {
            name: "Zenith",
            description: "Default OS Configuration",
            type: "CONFIG",
            profileId: profile.id,
            designSystemId: designSystem.id,
            components: {
              create: [
                {
                  name: "Wallpaper",
                  type: "WALLPAPER",
                  mode: "color",
                  tokenId: "black", // Using new token name
                  value: "/media/wallpaper.jpg",
                  order: 0,
                },
                {
                  name: "Finder",
                  type: "DOCK_ICON",
                  mode: "color", // Starts in color mode
                  tokenId: "graphite-med", // Initial fill color
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 1,
                },
                {
                  name: "Flow",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 2,
                },
                {
                  name: "Discord",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 3,
                },
                {
                  name: "Anki",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 4,
                },
                {
                  name: "Stellar",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 5,
                },
                {
                  name: "Terminal",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 6,
                },
                {
                  name: "Settings",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 7,
                },
                {
                  name: "GitHub",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  outlineMode: "color", // NEW
                  outlineTokenId: "latte", // NEW
                  order: 8,
                },
                {
                  name: "Cursor",
                  type: "CURSOR",
                  mode: "color",
                  tokenId: "smoke-med", // Inner color: #1e202a closest to our token is night
                  outlineMode: "color",
                  outlineTokenId: "latte-outer", // Outer color: #35374a closest to our token is latte
                  order: 9,
                },
              ],
            },
          },
        },
      },
    });

    // EVOLVED: Create stellar profile first
    const stellarProfile = await tx.stellarProfile.create({
      data: {
        profileId: profile.id,
        name: `${user.firstName}'s Drive`,
        driveCapacity: BigInt(1000000000),
        currentUsage: 0,
        settings: {
          create: {
            defaultView: "grid",
            sortBy: "name",
            showHidden: false,
          },
        },
      },
    });

    // EVOLVED: Create root folder with proper relation syntax
    const rootFolder = await tx.stellarFolder.create({
      data: {
        name: "Root",
        stellarProfileId: stellarProfile.id, // Direct ID reference
      },
    });

    // EVOLVED: Update profile with root relation using proper syntax
    await tx.stellarProfile.update({
      where: { id: stellarProfile.id },
      data: {
        rootFolder: {
          connect: { id: rootFolder.id },
        },
      },
    });

    // In initial-profile.ts within the transaction
    // In initial-profile.ts where folders are created
    const GRID_SPACING = 100; // Pixels between items
    const INITIAL_OFFSET = 50; // Initial padding from top-left

    const folders = [
      {
        name: "Desktop", // Add Desktop as first folder
        inSidebar: true,
        sidebarOrder: 0,
        position: { x: INITIAL_OFFSET, y: INITIAL_OFFSET },
        files: [
          // Add initial Welcome.txt file
          {
            name: "Welcome.txt",
            url: "/files/welcome.txt",
            size: 1024,
            mimeType: "text/plain",
            position: { x: INITIAL_OFFSET, y: INITIAL_OFFSET },
          },
        ],
      },
      {
        name: "Documents",
        inSidebar: true,
        sidebarOrder: 1, // Shift order for others
        position: { x: INITIAL_OFFSET + GRID_SPACING, y: INITIAL_OFFSET },
      },
      {
        name: "Downloads",
        inSidebar: true,
        sidebarOrder: 2,
        position: { x: INITIAL_OFFSET + GRID_SPACING * 2, y: INITIAL_OFFSET },
      },
      {
        name: "Pictures",
        inSidebar: true,
        sidebarOrder: 3,
        position: { x: INITIAL_OFFSET + GRID_SPACING * 3, y: INITIAL_OFFSET },
      },
    ];

    // Evolve the folder creation to handle files
    await Promise.all(
      folders.map(async (folder) => {
        const newFolder = await tx.stellarFolder.create({
          data: {
            name: folder.name,
            parentId: rootFolder.id,
            stellarProfileId: stellarProfile.id,
            inSidebar: folder.inSidebar,
            sidebarOrder: folder.sidebarOrder,
            position: folder.position,
            // EVOLVED: Add files if they exist
            files: folder.files
              ? {
                  create: folder.files,
                }
              : undefined,
          },
        });
        return newFolder;
      })
    );

    await tx.server.create({
      data: {
        profileId: profile.id,
        name: "Core",
        imageUrl: user.imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
          create: [{ profileId: profile.id, role: MemberRole.ADMIN }],
        },
      },
    });

    // EVOLVED: Create the main vault with proper structure
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

    // EVOLVED: Create Chapter 1 folder with proper connection
    const chapter1Folder = await tx.obsidianFolder.create({
      data: {
        name: "Chapter 1",
        vaultId: mainVault.id,
      },
    });

    // EVOLVED: Create Chapter 2 folder with proper connection
    const chapter2Folder = await tx.obsidianFolder.create({
      data: {
        name: "Chapter 2",
        vaultId: mainVault.id,
      },
    });

    // EVOLVED: Create notes with proper vault and folder connections
    const notes: NoteCreateInput[] = [
      {
        title: "Notes",
        content: "# Notes\n\nYour notes content here",
        frontmatter: { created: new Date().toISOString() },
        vaultId: mainVault.id,
        folderId: chapter1Folder.id,
      },
      {
        title: "Ideas",
        content: "# Ideas\n\nYour ideas content here",
        frontmatter: { created: new Date().toISOString() },
        vaultId: mainVault.id,
        folderId: chapter1Folder.id,
      },
      {
        title: "Research",
        content: "# Research\n\nYour research content here",
        frontmatter: { created: new Date().toISOString() },
        vaultId: mainVault.id,
        folderId: chapter2Folder.id,
      },
      {
        title: "Case Studies",
        content: "# Case Studies\n\nYour case studies content here",
        frontmatter: { created: new Date().toISOString() },
        vaultId: mainVault.id,
        folderId: chapter2Folder.id,
      },
    ];

    // Create all notes with proper error handling
    await Promise.all(notes.map((note) => createNote(tx, note)));

    return profile;
  });

  return newProfile;
};
