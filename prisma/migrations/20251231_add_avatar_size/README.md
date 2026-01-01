# Migration: add_avatar_size

This migration adds an optional `avatar_size` integer column to the `profiles` table. It represents the avatar container size in pixels (e.g., 320).

Files included:

- migration.sql — SQL to add the column and set a sensible default for existing rows.

When to run:

- In development: run `npm run db:migrate -- --name add_avatar_size` (or `npx prisma migrate dev --name add_avatar_size`).
- In production: after pushing the migration files to the repo, run `npx prisma migrate deploy` on your deployment environment.

Notes:

- After applying the migration, run `npx prisma generate` (or `npm run db:generate`) to ensure the Prisma client picks up the new schema.
- The migration included here sets existing rows to a default of `320` if the column was previously null.
