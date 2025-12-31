# 1. Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Use pnpm (project uses pnpm locally) to install dependencies deterministically
COPY package.json pnpm-lock.yaml ./
# Copy all Prisma-related config so postinstall scripts (prisma generate) can run in deps stage
COPY prisma ./prisma
COPY prisma.config.js prisma.config.cjs prisma.config.mjs prisma.config.ts ./
# Create bin dir to avoid warnings from packages attempting to write bin shims
RUN mkdir -p /app/node_modules/.bin
# Enable corepack and install with pnpm to respect pnpm-lock.yaml
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile

# 2. Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


# Next.js collects telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Ensure pnpm is available in the builder stage and then generate Prisma client and build
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm exec prisma generate
RUN pnpm run build

# 3. Production Runner
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
RUN npm install prisma

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from builder
# We use the 'standalone' folder which is much smaller
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Note: server.js is created by next build when using standalone output
CMD ["node", "server.js"]