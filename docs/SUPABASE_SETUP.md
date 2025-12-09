# Supabase Setup Guide for `resume` Project

This document lists everything you need to recreate your Supabase project for this app: database schema, storage buckets, RLS policies, edge functions, and environment variables.

## Overview

- Auth: Supabase Auth (Email/Password + optional OAuth). Session is used client-side only (anon key in browser).
- Data: Postgres tables with RLS per-user and per-domain.
- Storage: Public buckets for images and PDFs.
- Functions: Edge function for resume PDF generation (name used in code: `generate-features`).

## Environment Variables

Provide values in `.env.local` for Next.js and in your secret manager for scripts/functions.

- `NEXT_PUBLIC_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your anon key
- For service-role scripts/functions:
  - `SUPABASE_URL`: same as above
  - `SUPABASE_SERVICE_ROLE_KEY`: service role key (never used in app runtime)

Update `lib/supabase.ts` to read from env vars instead of hardcoded values.

## Storage Buckets

Create the following public buckets:

- `profile-images`
- `background-images`
- `project-images`
- `favicons` (public)
- `resumes` (can be public or use signed URLs; code supports signed fallback)

Helper script available: `scripts/create-favicons-bucket.js` (requires service role).

## Database Schema

Create these tables. Use UUIDs for `id` and `user_id` where applicable.

### 1. `profiles`

Represents a public profile per domain.

- `id` uuid primary key (same as auth `user.id` for owners)
- `user_id` uuid (owner)
- `domain` text unique
- `theme` jsonb (stores CSS variables/colors)
- `avatar_url` text
- `background_image_url` text
- `favicon_url` text
- `contact_numbers` jsonb[] or text[] (per your migration)
- `active_resume_role` text
- `home_page_data` jsonb (title, highlights)
- `about_page_data` jsonb (bio, icon)
- `social_links` jsonb[] (label, url)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

RLS:

- Enable RLS.
- Policy: owners (`auth.uid() = user_id`) can `select`, `insert`, `update`, `delete`.
- Policy: public can `select` WHERE `domain` IS NOT NULL (for public pages).
- Unique index on `domain`.

### 2. `projects`

Portfolio projects.

- `id` uuid primary key
- `user_id` uuid
- `domain` text (to scope public view)
- `title` text
- `short_description` text
- `long_description` text
- `image_url` text
- `published` boolean default false
- `featured` boolean default false
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

RLS:

- Enable RLS.
- Owners can full CRUD (`auth.uid() = user_id`).
- Public `select` WHERE `published = true` AND domain matches requested host.

### 3. `resumes`

Logical resumes (metadata) that point to uploaded PDFs.

- `id` uuid primary key
- `user_id` uuid
- `domain` text
- `role_title` text
- `summary` text
- `skills` jsonb[]
- `uploaded_resume_id` uuid nullable (FK to `uploaded_resumes.id`)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

RLS:

- Enable RLS.
- Owners full CRUD.
- Public `select` allowed for active resume via profile domain.

### 4. `uploaded_resumes`

Uploaded PDF files metadata.

- `id` uuid primary key
- `user_id` uuid
- `file_url` text (public or signed URL target)
- `file_name` text
- `file_size` int
- `created_at` timestamptz default now()

RLS:

- Enable RLS.
- Owners full CRUD.
- No public access; app resolves signed or public URL when needed.

### 5. `work_experiences`

Work history entries with month precision.

- `id` uuid primary key
- `user_id` uuid
- `domain` text
- `company` text
- `title` text
- `location` text
- `start_month` date (use first of month)
- `end_month` date nullable
- `is_current` boolean default false
- `visible` boolean default true
- `highlights` text[] or jsonb[]
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

Indexes & Constraints:

- Partial unique index to ensure only one `is_current = true` per `domain`:
  - `create unique index uniq_current_work_per_domain on work_experiences(domain) where is_current;`

RLS:

- Enable RLS.
- Owners full CRUD.
- Public `select` WHERE `visible = true` AND domain matches.

## Row Level Security (RLS) Patterns

Use these common policies on owner-scoped tables:

- `create policy "Owner read" on <table> for select using (auth.uid() = user_id);`
- `create policy "Owner write" on <table> for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`
  Public-read tables (`profiles`, `projects`, `work_experiences`):
- `create policy "Public read by domain" on <table> for select using (domain is not null and visible conditions as applicable);`

## Edge Functions

- `generate-features`: Invoked from `components/admin/ProjectForm.tsx` to analyze project descriptions and propose features. Implement as a Deno function under Supabase Edge Functions. It should accept `{ long_description: string }` and return a JSON array of suggested feature strings.

Optional (if implemented earlier): a function to generate resume PDFs using provided profile + work history.

## Image Domains

Update `next.config.ts` with your new Supabase storage hostname. Example shows `dxahjapyammwtsdmoeah.supabase.co` — replace with your project.

## Seed & Usage Conventions

- All storage paths use `${userId}/...` under their respective buckets.
- Domain-scoped reads: public pages resolve by `profiles.domain` (hostname).
- React Query keys used across app: `['theme', hostname]`, `['currentUserProfile']`, `['projects']`, `['user-projects']`, `['uploaded-resumes']`, etc.

## Verification Checklist

- Auth enabled; users can sign up and log in.
- Buckets created with public access (except `resumes` if you prefer signed-only).
- All five tables exist with RLS enabled and policies set.
- Unique index for current work per domain created.
- Edge function `generate-features` deployed.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set.
- `next.config.ts` `images.remotePatterns` includes your Supabase host.

## Helpful SQL Snippets

Enable RLS on all tables:

```sql
alter table profiles enable row level security;
alter table projects enable row level security;
alter table resumes enable row level security;
alter table uploaded_resumes enable row level security;
alter table work_experiences enable row level security;
```

Example owner policies:

```sql
create policy "Owner read" on projects for select using (auth.uid() = user_id);
create policy "Owner write" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Public read by domain (adjust conditions per table):

```sql
create policy "Public projects" on projects for select using (published = true);
create policy "Public profiles" on profiles for select using (domain is not null);
create policy "Public work" on work_experiences for select using (visible = true);
```

## CLI Commands (examples)

```bash
# Buckets
supabase storage create-bucket profile-images --public
supabase storage create-bucket background-images --public
supabase storage create-bucket project-images --public
supabase storage create-bucket favicons --public
supabase storage create-bucket resumes --public

# Index for current work
psql "$SUPABASE_DB_URL" -c "create unique index if not exists uniq_current_work_per_domain on work_experiences(domain) where is_current;"
```

If you want, I can replace `lib/supabase.ts` with env-based config and add SQL files to generate the full schema and RLS in one go.
