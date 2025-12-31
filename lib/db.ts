import { PrismaClient } from "@prisma/client";

// Export a single `db` binding. We will conditionally initialize it based on whether
// a DATABASE_URL is available so builds can run in environments without a DB.
let dbImpl: PrismaClient | unknown = null;

if (!process.env.DATABASE_URL) {
  // Minimal noop implementation of PrismaClient shape for build-time
  const noopModelHandler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      // Return sensible defaults per common Prisma methods
      return async (..._args: unknown[]): Promise<unknown> => {
        const method = String(prop);
        if (method === "findMany") return [];
        if (method === "findFirst" || method === "findUnique") return null;
        if (method === "create" || method === "update") return null;
        if (method === "delete") return null;
        if (method === "updateMany" || method === "deleteMany") return { count: 0 };
        // Default fallback
        return null;
      };
    },
  };

  dbImpl = new Proxy({}, {
    get(_target, prop) {
      const key = String(prop);
      if (key === "$queryRaw" || key === "$executeRaw") return async () => null;
      if (key === "$transaction") return async () => [];
      // Return a proxy per-model
      return new Proxy({}, noopModelHandler);
    },
  });
} else {
  // Prevent multiple instances of Prisma Client in development
  // https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  dbImpl =
    globalForPrisma.prisma ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    // dbImpl will be a PrismaClient when a DATABASE_URL is configured
    globalForPrisma.prisma = dbImpl as PrismaClient;
  }
}

export const db: PrismaClient = dbImpl as PrismaClient;
