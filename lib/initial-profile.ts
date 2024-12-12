import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";

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
                  order: 1,
                },
                {
                  name: "Flow",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  order: 2,
                },
                {
                  name: "Discord",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  order: 3,
                },
                {
                  name: "Anki",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  order: 4,
                },
                {
                  name: "Stellar",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  order: 5,
                },
                {
                  name: "Terminal",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  order: 6,
                },
                {
                  name: "Settings",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  order: 7,
                },
                {
                  name: "GitHub",
                  type: "DOCK_ICON",
                  mode: "color",
                  tokenId: "graphite-med",
                  order: 8,
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
        name: "Documents",
        inSidebar: true,
        sidebarOrder: 0,
        position: { x: INITIAL_OFFSET, y: INITIAL_OFFSET },
      },
      {
        name: "Downloads",
        inSidebar: true,
        sidebarOrder: 1,
        position: { x: INITIAL_OFFSET + GRID_SPACING, y: INITIAL_OFFSET },
      },
      {
        name: "Pictures",
        inSidebar: true,
        sidebarOrder: 2,
        position: { x: INITIAL_OFFSET + GRID_SPACING * 2, y: INITIAL_OFFSET },
      },
    ];

    await Promise.all(
      folders.map((folder) =>
        tx.stellarFolder.create({
          data: {
            name: folder.name,
            parentId: rootFolder.id,
            stellarProfileId: stellarProfile.id,
            inSidebar: folder.inSidebar,
            sidebarOrder: folder.sidebarOrder,
            position: folder.position,
          },
        })
      )
    );

    // PRESERVED: Rest of the transaction remains the same...
    const osRootFolder = await tx.folder.create({
      data: {
        name: "Root",
        isRoot: true,
        profileId: profile.id,
      },
    });

    await tx.file.create({
      data: {
        name: "Welcome.txt",
        type: "text/plain",
        size: 23,
        content: "Welcome to StellarOS!",
        folderId: osRootFolder.id,
        profileId: profile.id,
      },
    });

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

    return profile;
  });

  return newProfile;
};
