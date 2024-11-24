// prisma/seed/daimon.ts
import { PrismaClient } from "@prisma/client";
import { uploadDaimonAssets } from "@/lib/upload-daimon-assets";
import { appDefinitions } from "@/app/types/AppTypes";

const prisma = new PrismaClient();
const ORION_PROFILE_ID = "orion-official";

async function createOrionProfile() {
  return await prisma.profile.upsert({
    where: { id: ORION_PROFILE_ID },
    update: {},
    create: {
      id: ORION_PROFILE_ID,
      userId: "orion-official",
      name: "Orion",
      imageUrl: "/icns/_orion.png",
      email: "themes@orion.os",
      designSystem: {
        create: {
          name: "Orion Default",
        },
      },
    },
  });
}

async function createDaimonFlow(mediaItems: {
  wallpaper: string;
  icons: string[];
}) {
  // Create OS stream for Orion if it doesn't exist
  const stream = await prisma.stream.upsert({
    where: {
      appId_profileId: {
        appId: "orion",
        profileId: ORION_PROFILE_ID,
      },
    },
    update: {},
    create: {
      name: "OS",
      type: "CONFIG",
      appId: "orion",
      profileId: ORION_PROFILE_ID,
    },
  });

  // Get design system ID
  const designSystem = await prisma.designSystem.findFirst({
    where: { profileId: ORION_PROFILE_ID },
  });

  if (!designSystem) throw new Error("Design system not found");

  // Create Daimon flow
  const daimonFlow = await prisma.flow.create({
    data: {
      name: "Daimon",
      type: "CONFIG",
      profileId: ORION_PROFILE_ID,
      streamId: stream.id,
      designSystemId: designSystem.id,
      components: {
        create: [
          // Wallpaper component
          {
            name: "Wallpaper",
            type: "WALLPAPER",
            mode: "media",
            mediaId: mediaItems.wallpaper,
            order: 0,
          },
          // Dock icon components
          ...appDefinitions
            .filter((app) => app.dockPosition !== undefined)
            .sort((a, b) => (a.dockPosition || 0) - (b.dockPosition || 0))
            .map((app, index) => ({
              name: app.name,
              type: "DOCK_ICON",
              mode: "media",
              mediaId: mediaItems.icons[index],
              order: index + 1,
            })),
        ],
      },
    },
    include: {
      components: true,
    },
  });

  console.log(
    "✅ Created Daimon flow with components:",
    daimonFlow.components.map((c) => `${c.name} (${c.type})`).join(", ")
  );

  return daimonFlow;
}

export async function seedDaimon() {
  console.log("🌱 Starting Daimon theme seeding...");

  // Ensure Orion profile exists
  await createOrionProfile();
  console.log("✅ Orion profile ready");

  // Upload assets and get media references
  const mediaItems = await uploadDaimonAssets();
  console.log("✅ Media assets uploaded");

  // Create flow with components
  const flow = await createDaimonFlow(mediaItems);
  console.log("✅ Daimon flow created");

  return flow;
}
