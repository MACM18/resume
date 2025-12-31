# 1. Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# 2. Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# 3. Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Install system deps, curl for healthchecks, and Prisma globally as ROOT
RUN apk add --no-cache curl openssl
RUN npm install -g prisma

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files and set ownership
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
# Standalone folder contains a minimal node_modules with prisma client
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Chain migrations and server start
# migrate deploy is the safe version for production (doesn't reset DB)
CMD ["sh", "-c", "prisma migrate deploy && node server.js"]