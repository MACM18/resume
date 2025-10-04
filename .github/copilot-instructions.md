# Copilot instructions for this repo

Use these project-specific conventions to be productive immediately. Keep changes aligned with existing patterns and referenced files. These instructions complement `AI_RULES.md` (broader tech stack and UI conventions).

## Architecture and runtime

- Next.js App Router with TypeScript. Entry layout is `app/layout.tsx` which sets favicon per-domain (via `getProfileDataServer(host)`) and provides global providers: React Query, Supabase Auth, Theme, Tooltip, toasters, and UI chrome (Navigation, PageTransition, buttons).
- Domain-driven theming: `components/providers/ThemeProvider.tsx` fetches `{ theme, background_image_url }` from `profiles` by `domain` (hostname) and injects CSS variables; layout uses `--background-image-url` and `--has-background-image` for layered backgrounds.
- Images: `next.config.ts` allows `raw.githubusercontent.com` and Supabase storage domain. New external image hosts must be added to `images.remotePatterns`.

## Data layer and external services

- Supabase client: `lib/supabase.ts` (anon key, browser-safe). All client/server calls use this client; server helpers live in `lib/*.server.ts` (e.g., `lib/profile.server.ts`). No service-role usage in app code.
- Storage buckets used: `profile-images`, `background-images`, `project-images`, `favicons`, `resumes`.
- Core tables: `profiles` (domain, theme, avatar/background/favicon URLs, contact_numbers, active_resume_role, page data), `projects`, `resumes`, `uploaded_resumes`.
- Edge Functions: Example invocation via `supabase.functions.invoke("generate-features", { body: { long_description } })` in `components/admin/ProjectForm.tsx`.

## State, fetching, and mutations

- Use React Query across the app. Typical keys: ["theme", hostname], ["currentUserProfile"], ["profileImages", userId], ["projects"], ["user-projects"], ["uploaded-resumes"].
- For domain-scoped reads, prefer helpers that accept `domain`: `lib/profile.ts#getProfileData`, `lib/projects.ts#getProjects(domain)/getProjectById(id, domain)/getFeaturedProjects(domain)`, `lib/resumes.ts#getActiveResume(domain)`.
- For current user reads/mutations, gate with Supabase session: `getCurrentUserProfile`, `getProjectsForCurrentUser`, `getResumesForCurrentUser`, etc. On mutations, invalidate relevant keys as seen in `ProjectForm`, `ProfileImageManager`, `ResumeManager`.

## Forms and UI conventions

- Forms: `react-hook-form` + `zod` resolver + shadcn form primitives in `components/ui/form.tsx` (Form, FormField, FormItem, FormControl, FormLabel, FormMessage). See `components/admin/ProjectForm.tsx` for a full example including validation and mutation.
- Styling: Tailwind CSS. Use `cn` from `lib/utils.ts` for conditional class merging. Prefer `components/ui/*` primitives (shadcn) and `lucide-react` icons. Toasters come from `components/ui/sonner`.

## File uploads and media

- Always store under the authenticated user’s folder: `${userId}/...`. Then derive a public URL via `supabase.storage.from(<bucket>).getPublicUrl(filePath)`.
- Patterns and buckets:
  - Profile images: `lib/profile.ts#uploadProfileImage/getProfileImages/deleteProfileImage`; UI in `ProfileImageManager` (enforces max 10 images).
  - Background images + favicons: `lib/profile.ts#uploadBackgroundImage/uploadFavicon` and corresponding delete helpers.
  - Project images: `lib/projects.ts#uploadProjectImage/deleteProjectImage`.
  - Resumes (PDF): `lib/resumes.ts#uploadResumePdf` (uses `getPublicUrl` or signed URL fallback) with records in `uploaded_resumes` (UI enforces max 20 uploads in `ResumeManager`).

## Auth usage

- Access Supabase and session via the `useSupabase()` hook from `components/providers/AuthProvider.tsx`. Wrap client components that need auth within the app’s default provider tree.

## Developer workflow

- Scripts: `npm run dev` (Next dev), `npm run build`, `npm run start`, `npm run lint`.
- When adding new external image hosts, update `next.config.ts` remotePatterns.
- Admin bucket setup: a service-role-only script exists at `scripts/create-favicons-bucket.js` (run with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY envs) to create the public `favicons` bucket.

## Types and data shapes

- Reuse types from `types/portfolio.ts` (Project, Resume, UploadedResume, Profile, Theme, HomePageData, AboutPageData). Keep DB/select fields consistent with these types; examples in `lib/profile.ts`, `lib/projects.ts`, `lib/resumes.ts`.

## Gotchas and patterns to follow

- Domain scoping: Public pages should resolve data by hostname (profiles.domain) rather than user id; use the provided helpers.
- Publication flags: Public project queries filter `published: true` (and `featured` when needed); keep this behavior consistent.
- `getPublicUrl` contract: it returns `{ data: { publicUrl } }`. For non-public buckets, use a signed URL fallback (see `lib/resumes.ts#getResumePublicUrl`).
