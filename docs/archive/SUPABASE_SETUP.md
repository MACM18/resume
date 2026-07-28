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

Represents a public profile per domain. Each authenticated user has exactly one profile.

- `id` uuid primary key (auto-generated)
- `user_id` uuid unique not null (references auth.users.id - the owner)
- `domain` text unique (nullable until claimed)
- `full_name` text
- `tagline` text
- `theme` jsonb (stores CSS variables/colors)
- `avatar_url` text
- `background_image_url` text
- `favicon_url` text
- `contact_numbers` jsonb (array of contact number objects)
- `active_resume_role` text
- `home_page_data` jsonb (socialLinks, experienceHighlights, etc.)
- `about_page_data` jsonb (story, skills, callToAction)
- `social_links` jsonb
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

RLS:

- Enable RLS.
- Policy: owners (`auth.uid() = user_id`) can `select`, `insert`, `update`, `delete`.
- Policy: public can `select` WHERE `domain` IS NOT NULL (for public pages).
- Unique index on `user_id` (one profile per user).
- Unique index on `domain`.

### 2. `projects`

Portfolio projects.

- `id` uuid primary key
- `user_id` uuid
- `domain` text (to scope public view)
- `title` text not null
- `description` text (short description)
- `long_description` text
- `image` text (URL)
- `tech` jsonb (array of tech strings)
- `demo_url` text
- `github_url` text
- `key_features` jsonb (array of feature strings)
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
- `role` text not null (role identifier)
- `title` text (display title)
- `summary` text
- `skills` jsonb (array of skill strings)
- `experience` jsonb (array of experience objects: company, position, duration, description)
- `education` jsonb (array of education objects: degree, school, year)
- `certifications` jsonb (array of cert objects: name, issuer, date, url)
- `project_ids` jsonb (array of project UUIDs)
- `resume_url` text
- `pdf_source` text default 'uploaded' ('uploaded' | 'generated')
- `location` text
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
- `file_path` text not null (storage path)
- `public_url` text (public or signed URL)
- `original_filename` text not null
- `file_size` int
- `created_at` timestamptz default now()

RLS:

- Enable RLS.
- Owners full CRUD.
- No public access; app resolves signed or public URL when needed.

### 5. `work_experiences`

Work history entries.

- `id` uuid primary key
- `user_id` uuid
- `domain` text
- `company` text not null
- `position` text not null
- `location` text
- `start_date` date not null
- `end_date` date nullable (null when current)
- `is_current` boolean default false
- `visible` boolean default true
- `description` jsonb (array of bullet point strings)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

Indexes & Constraints:

- Partial unique index to ensure only one `is_current = true` per `user_id`:
  - `create unique index uniq_current_work_per_user on work_experiences(user_id) where is_current;`

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

## API Routes (Next.js Backend)

Instead of Supabase Edge Functions, this project uses **Next.js API routes** under `app/api/*` for backend logic. This simplifies deployment and keeps everything in one codebase.

### AI Generation (via Groq)

- `POST /api/generate-features` — Extract key features from a project description.
- `POST /api/generate-about-card-description` — Generate an about card description from user story.
- `POST /api/generate-resume-summary` — Generate a professional summary for resumes.

These routes use the [Groq SDK](https://console.groq.com/) with the `llama-3.3-70b-versatile` model. Set `GROQ_API_KEY` in your environment.

### PDF Generation

- `POST /api/generate-resume-pdf` — Generate a professionally styled PDF from resume/profile data.

Uses [@react-pdf/renderer](https://react-pdf.org/) to generate A4-sized PDFs with:

- Header with name, title, contact info
- Professional summary section
- Work experience (from work_experiences table or inline resume data)
- Skills, education, certifications

Request body:

```json
{
  "resume": {
    /* Resume object */
  },
  "profile": {
    /* Profile object */
  },
  "workExperiences": [
    /* Optional WorkExperience[] */
  ]
}
```

Returns: PDF binary with `Content-Type: application/pdf`

### Email (via Resend)

- `POST /api/contact` — Send contact form emails.

Uses [Resend](https://resend.com/) for transactional email. Set `RESEND_API_KEY` and optionally `RESEND_FROM_EMAIL`.

### User Management (Supabase Admin)

- `POST /api/invite-user` — Invite a new user by email.
- `GET /api/get-all-users` — List all users with their domains.
- `POST /api/reset-password-for-user` — Send password reset email.

These routes use the Supabase Admin SDK with `SUPABASE_SERVICE_ROLE_KEY`. Keep this key secret—never expose to client.

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

# Index for current work (per user)
psql "$SUPABASE_DB_URL" -c "create unique index if not exists uniq_current_work_per_user on work_experiences(user_id) where is_current;"
```

If you want, I can replace `lib/supabase.ts` with env-based config and add SQL files to generate the full schema and RLS in one go.

## Postgres SQL: Full Provisioning

Run the following SQL in the Supabase SQL editor (or `psql`). It creates tables, constraints, RLS policies, and helpful indexes. Adjust types if you prefer `jsonb[]` vs `text[]` for arrays.

```sql
-- Enable UUID extension (if not already)
create extension if not exists "uuid-ossp";

-- =====================================
-- Tables
-- =====================================

-- 1) profiles
-- user_id is the auth user's id (foreign key to auth.users)
-- id is auto-generated UUID
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null,  -- One profile per auth user
  domain text unique,
  full_name text,
  tagline text,
  theme jsonb,
  avatar_url text,
  background_image_url text,
  favicon_url text,
  contact_numbers jsonb,
  active_resume_role text,
  home_page_data jsonb,
  about_page_data jsonb,
  social_links jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) projects
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  domain text,
  title text not null,
  description text,
  long_description text,
  image text,
  tech jsonb,
  demo_url text,
  github_url text,
  key_features jsonb,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) uploaded_resumes
create table if not exists public.uploaded_resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  file_path text not null,
  public_url text,
  original_filename text not null,
  file_size int,
  created_at timestamptz not null default now()
);

-- 4) resumes
create table if not exists public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  domain text,
  role text not null,
  title text,
  summary text,
  skills jsonb,
  experience jsonb,
  education jsonb,
  certifications jsonb,
  project_ids jsonb,
  resume_url text,
  pdf_source text default 'uploaded',
  location text,
  uploaded_resume_id uuid references public.uploaded_resumes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) work_experiences
create table if not exists public.work_experiences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  domain text,
  company text not null,
  position text not null,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  visible boolean not null default true,
  description jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================
-- Indexes & Constraints
-- =====================================
create unique index if not exists uniq_current_work_per_user
  on public.work_experiences(user_id) where is_current;

-- Unique index on profiles.user_id (one profile per auth user)
create unique index if not exists idx_profiles_user_id on public.profiles(user_id);

-- Optional performance indexes
create index if not exists idx_projects_user_published on public.projects(user_id, published);
create index if not exists idx_work_user_visible on public.work_experiences(user_id, visible);
create index if not exists idx_resumes_user on public.resumes(user_id);

-- =====================================
-- Row Level Security (RLS)
-- =====================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.resumes enable row level security;
alter table public.uploaded_resumes enable row level security;
alter table public.work_experiences enable row level security;

-- Owner policies (CRUD)
-- ALL tables now consistently use user_id = auth.uid()
-- PostgreSQL does not support "IF NOT EXISTS" for policies.
-- Use DROP IF EXISTS followed by CREATE to ensure idempotency.

-- PROFILES: use user_id
drop policy if exists "profiles_owner_read" on public.profiles;
create policy "profiles_owner_read" on public.profiles
  for select using (auth.uid() = user_id);
drop policy if exists "profiles_owner_write" on public.profiles;
create policy "profiles_owner_write" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PROJECTS: use user_id
drop policy if exists "projects_owner_read" on public.projects;
create policy "projects_owner_read" on public.projects
  for select using (auth.uid() = user_id);
drop policy if exists "projects_owner_write" on public.projects;
create policy "projects_owner_write" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RESUMES: use user_id
drop policy if exists "resumes_owner_read" on public.resumes;
create policy "resumes_owner_read" on public.resumes
  for select using (auth.uid() = user_id);
drop policy if exists "resumes_owner_write" on public.resumes;
create policy "resumes_owner_write" on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- UPLOADED_RESUMES: use user_id
drop policy if exists "uploaded_resumes_owner_read" on public.uploaded_resumes;
create policy "uploaded_resumes_owner_read" on public.uploaded_resumes
  for select using (auth.uid() = user_id);
drop policy if exists "uploaded_resumes_owner_write" on public.uploaded_resumes;
create policy "uploaded_resumes_owner_write" on public.uploaded_resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WORK_EXPERIENCES: use user_id
drop policy if exists "work_owner_read" on public.work_experiences;
create policy "work_owner_read" on public.work_experiences
  for select using (auth.uid() = user_id);
drop policy if exists "work_owner_write" on public.work_experiences;
create policy "work_owner_write" on public.work_experiences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read by domain (only for public pages)
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles
  for select using (domain is not null);

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select using (published = true);

drop policy if exists "work_public_read" on public.work_experiences;
create policy "work_public_read" on public.work_experiences
  for select using (visible = true);

-- Optional: keep resumes private; app resolves public/signed URL via storage
-- If you want public resume metadata by domain, you could add:
-- create policy if not exists "resumes_public_read" on public.resumes
--   for select using (true);

-- =====================================
-- Triggers (optional: keep updated_at fresh)
-- =====================================
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end; $$ language plpgsql;

do $$ begin
  perform 1 from pg_trigger where tgname = 'profiles_touch_updated_at';
  if not found then
    create trigger profiles_touch_updated_at before update on public.profiles
      for each row execute function public.touch_updated_at();
  end if;
end $$;

do $$ begin
  perform 1 from pg_trigger where tgname = 'projects_touch_updated_at';
  if not found then
    create trigger projects_touch_updated_at before update on public.projects
      for each row execute function public.touch_updated_at();
  end if;
end $$;

do $$ begin
  perform 1 from pg_trigger where tgname = 'resumes_touch_updated_at';
  if not found then
    create trigger resumes_touch_updated_at before update on public.resumes
      for each row execute function public.touch_updated_at();
  end if;
end $$;

do $$ begin
  perform 1 from pg_trigger where tgname = 'work_touch_updated_at';
  if not found then
    create trigger work_touch_updated_at before update on public.work_experiences
      for each row execute function public.touch_updated_at();
  end if;
end $$;
```

### Storage Buckets via CLI

```bash
supabase storage create-bucket profile-images --public
supabase storage create-bucket background-images --public
supabase storage create-bucket project-images --public
supabase storage create-bucket favicons --public
supabase storage create-bucket resumes --public
```

### psql Command Example

```bash
psql "$SUPABASE_DB_URL" -f ./docs/sql/provision.sql
```

If you’d like, I can also generate `docs/sql/provision.sql` with these commands so you can run it in one go.
