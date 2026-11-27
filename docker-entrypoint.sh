#!/bin/sh
set -e

# Run migrations if DATABASE_URL is provided and not explicitly skipped
if [ "$SKIP_DB_MIGRATIONS" != "true" ] && [ -n "$DATABASE_URL" ]; then
  echo "==> Deploying Prisma schema migrations..."
  ./node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma

  echo "==> Running storage URL migration..."
  if [ -f "dist-scripts/scripts/migrate-storage-urls.js" ]; then
    node dist-scripts/scripts/migrate-storage-urls.js || true
  elif [ -f "scripts/migrate-storage-urls.ts" ]; then
    ./node_modules/.bin/tsx scripts/migrate-storage-urls.ts || true
  fi

  echo "==> Seeding missing portfolio content for the configured owner..."
  if [ -f "dist-scripts/scripts/seed-owner-portfolio.js" ]; then
    node dist-scripts/scripts/seed-owner-portfolio.js
  elif [ -f "scripts/seed-owner-portfolio.ts" ]; then
    ./node_modules/.bin/tsx scripts/seed-owner-portfolio.ts
  else
    echo "ERROR: owner portfolio seeder is missing from the application image." >&2
    exit 1
  fi
else
  if [ "$SKIP_DB_MIGRATIONS" = "true" ]; then
    echo "==> SKIP_DB_MIGRATIONS is true; skipping database migrations."
  else
    echo "==> DATABASE_URL is not set; skipping database migrations."
  fi
fi

exec "$@"
