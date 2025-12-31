// Export a plain object to avoid requiring the `prisma` package at parse time
export default {
  datasources: {
    db: {
      url: { fromEnvVar: "DATABASE_URL" },
    },
  },
  seed: {
    run: "npx tsx prisma/seed.ts",
  },
};
