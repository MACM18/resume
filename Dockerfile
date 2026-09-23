# 1. Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Use pnpm (project uses pnpm locally) to install dependencies deterministically
COPY package.json pnpm-lock.yaml ./
# Copy all Prisma-related config so postinstall scripts (prisma generate) can run in deps stage
COPY prisma ./prisma
# Copy only the config files that exist in the repository
# (No Prisma config files required for schema-based datasource)
# (prisma config files archived)
# Create bin dir to avoid warnings from packages attempting to write bin shims
RUN mkdir -p /app/node_modules/.bin
# Enable corepack and install with pnpm to respect pnpm-lock.yaml
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate && pnpm install --frozen-lockfile --ignore-scripts

# 2. Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars for Next.js image optimization config
# These must be set during build for remotePatterns to work correctly
ARG STORAGE_MAIN_DOMAIN
ARG STORAGE_PUBLIC_URL
ARG STORAGE_ENDPOINT
ARG STORAGE_BUCKET
ARG STORAGE_FOLDER
ENV STORAGE_MAIN_DOMAIN=$STORAGE_MAIN_DOMAIN
ENV STORAGE_PUBLIC_URL=$STORAGE_PUBLIC_URL
ENV STORAGE_ENDPOINT=$STORAGE_ENDPOINT
ENV STORAGE_BUCKET=$STORAGE_BUCKET
ENV STORAGE_FOLDER=$STORAGE_FOLDER

# Next.js collects telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Ensure pnpm is available in the builder stage and then generate Prisma client and build
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm exec prisma generate
RUN pnpm run build

# Pre-compile the migration script to plain JS so the runner can execute it directly with node
RUN pnpm exec tsc scripts/migrate-storage-urls.ts --target es2022 --module commonjs --moduleResolution node --outDir dist-scripts --skipLibCheck

# 3. Production Runner
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from builder
# We use the 'standalone' folder which is much smaller
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
# (Do not include Prisma runtime config; runtime uses schema-based datasource)
# Archived configs are kept in the repo but not copied into the image
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy production node_modules (including the Prisma CLI) from the deps stage
# so we can run migrations in the runtime container without running npm install
# during the image build, which avoids the earlier install errors.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/dist-scripts ./dist-scripts
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Execute migrations on deployment before starting server
ENTRYPOINT ["./docker-entrypoint.sh"]

# Note: server.js is created by next build when using standalone output
CMD ["node", "server.js"]