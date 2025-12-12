# Migration Guide: Supabase to Postgres + NextAuth + S3

This document describes the migration from Supabase to a self-hosted stack with PostgreSQL, NextAuth.js, and S3-compatible storage.

## Architecture Changes

### Before (Supabase)

- **Auth**: Supabase Auth (Email/Password)
- **Database**: Supabase Postgres with RLS policies
- **Storage**: Supabase Storage buckets

### After (New Stack)

- **Auth**: NextAuth.js with Credentials provider (JWT sessions)
- **Database**: PostgreSQL via Prisma ORM
- **Storage**: S3-compatible storage (AWS S3, MinIO, Cloudflare R2, etc.)

## Database Schema

The Prisma schema is defined in `prisma/schema.prisma`. Main models:

- `User` - Authentication and user data
- `Profile` - User profiles with domain, theme, and page data
- `Project` - Portfolio projects
- `Resume` - Resume/CV data
- `UploadedResume` - Uploaded PDF resumes
- `WorkExperience` - Work history

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb portfolio

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# S3 Storage
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_PUBLIC_URL="http://localhost:9000"
STORAGE_ACCESS_KEY_ID="your-access-key"
STORAGE_SECRET_ACCESS_KEY="your-secret-key"
STORAGE_BUCKET="portfolio"
STORAGE_REGION="us-east-1"
```

### 3. S3 Storage Setup

Create the storage bucket with the following folder structure:

- `profile-images/` - User avatar images
- `background-images/` - Background images
- `project-images/` - Project screenshots
- `favicons/` - Site favicons
- `resumes/` - Uploaded PDF resumes

For MinIO (local development):

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

## Key Files Changed

### New Files

- `prisma/schema.prisma` - Database schema
- `lib/db.ts` - Prisma client singleton
- `lib/auth.ts` - NextAuth configuration
- `lib/storage.ts` - S3 storage abstraction
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/auth/signup/route.ts` - User registration
- `app/api/auth/update-password/route.ts` - Password update
- `app/api/profile/*` - Profile API routes
- `app/api/projects/*` - Projects API routes
- `app/api/resumes/*` - Resumes API routes
- `app/api/work-experiences/*` - Work experiences API routes

### Updated Files

- `components/providers/AuthProvider.tsx` - Now uses NextAuth SessionProvider
- `components/providers/ThemeProvider.tsx` - Uses API instead of Supabase
- `lib/profile.ts` - Uses fetch() to API routes
- `lib/projects.ts` - Uses fetch() to API routes
- `lib/resumes.ts` - Uses fetch() to API routes
- `lib/work-experiences.ts` - Uses fetch() to API routes
- `app/login/page.tsx` - Uses NextAuth signIn
- `app/signup/page.tsx` - Uses signup API
- `next.config.ts` - Updated for S3 storage URLs

### Removed Files

- `lib/supabase.ts`
- `lib/supabase-admin.ts`
- `scripts/create-favicons-bucket.js`

### Removed Dependencies

- `@supabase/supabase-js`
- `@supabase/auth-ui-react`
- `@supabase/auth-ui-shared`

### Added Dependencies

- `prisma` / `@prisma/client` - Database ORM
- `next-auth` / `@auth/prisma-adapter` - Authentication
- `bcryptjs` / `@types/bcryptjs` - Password hashing
- `@aws-sdk/client-s3` / `@aws-sdk/s3-request-presigner` - S3 storage

## Authentication Changes

### Old (Supabase)

```tsx
import { useSupabase } from "@/components/providers/AuthProvider";
const { session, supabase } = useSupabase();
```

### New (NextAuth)

```tsx
import { useAuth } from "@/components/providers/AuthProvider";
const { session, status } = useAuth();
// session.user.id and session.user.email available
```

## Data Fetching Changes

### Old (Direct Supabase calls)

```tsx
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("domain", domain);
```

### New (API routes)

```tsx
const response = await fetch(`/api/profile/by-domain?domain=${domain}`);
const data = await response.json();
```

## Data Migration

To migrate data from Supabase to the new PostgreSQL database:

1. Export data from Supabase using their export tools or SQL queries
2. Transform the data to match the new Prisma schema
3. Import using Prisma's seed script or direct SQL inserts

Key field mappings:

- `user_id` → `userId`
- `full_name` → `fullName`
- `created_at` → `createdAt`
- `home_page_data` → `homePageData` (JSON)
- `about_page_data` → `aboutPageData` (JSON)

## Testing

```bash
# Run development server
npm run dev

# Run build
npm run build

# Start production server
npm start
```

## Notes

- Super admin is determined by `profile.domain === "macm.dev"`
- Passwords are hashed using bcrypt with 12 rounds
- JWT sessions are used (no database sessions)
- All public URLs for storage use the `STORAGE_PUBLIC_URL` environment variable
