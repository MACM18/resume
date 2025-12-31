// Canonical CJS Prisma config with datasource provided via `fromEnvVar`
module.exports = {
  seed: {
    run: "npx tsx prisma/seed.ts",
  },
  datasources: {
    db: {
      url: { fromEnvVar: "DATABASE_URL" },
    },
  },
};
