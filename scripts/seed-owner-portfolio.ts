import { PrismaClient } from "@prisma/client";
import { seedOwnerPortfolio } from "../lib/portfolio-seeder";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { ownerUserId: true } });
  if (!settings?.ownerUserId) {
    throw new Error("Cannot seed portfolio: SiteSettings.id=1 has no configured owner. Run the single-owner setup first.");
  }

  const result = await prisma.$transaction((tx) => seedOwnerPortfolio(tx, settings.ownerUserId), { timeout: 60_000 });
  console.log(`Portfolio seed complete for owner ${settings.ownerUserId}.`);
  console.log(`Projects created: ${result.createdProjects}; existing projects matched and safely filled: ${result.matchedProjects}.`);
  console.log("Existing titles, images, links, featured status, publication status, and profile copy were preserved.");
}

main()
  .catch((error) => {
    console.error("Portfolio seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
