// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { seedDaimon } from "./seed/daimon";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  await seedDaimon();

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
