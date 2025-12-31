// ESM Prisma config — export plain object (use fromEnvVar to declare env dependency)
export default {
  seed: {
    run: "npx tsx prisma/seed.ts",
  },
  datasources: {
    db: {
      url: { fromEnvVar: "DATABASE_URL" },
    },
  },
};
