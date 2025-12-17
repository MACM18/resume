# Deploy & First-time Setup ✅

This file contains the minimal, reproducible commands and environment variables you need to set up the app for the first time (local dev and production). Keep this near your README for quick reference.

---

## Required environment variables

- DATABASE_URL — Postgres connection string (used by Prisma)
- NEXTAUTH_SECRET — Secret for NextAuth sessions (generate securely, e.g., `openssl rand -hex 32`)
- RESEND_API_KEY — Resend API key for sending emails
- RESEND_FROM_EMAIL — Sender email used by Resend (e.g., `noreply@yourdomain.com`)
- STORAGE_ENDPOINT (optional) — S3/MinIO endpoint for file storage
- STORAGE_PUBLIC_URL (optional) — Public URL for served files (if different)
- STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY (optional) — S3/MinIO credentials
- STORAGE_BUCKET (optional) — Bucket name (default: `portfolio`)
- STORAGE_REGION (optional) — S3 region (default: `us-east-1`)
- GROQ_API_KEY (optional) — Sanity/GROQ API key (used by some AI features)
- NEXT_PUBLIC_SITE_URL (optional) — Site URL used in meta tags

> Tip: Store secrets in your environment/secret manager (e.g., GitHub Actions Secrets, Vercel/Render envs, or Azure Key Vault).

---

## Generate secrets examples

- Generate `NEXTAUTH_SECRET`:

```bash
# hex
openssl rand -hex 32
# or base64
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- Confirm `RESEND_API_KEY` from your Resend account and set `RESEND_FROM_EMAIL` to a sender address you control.

---

## Local setup (first time)

1. Install packages:

```bash
npm install
```

2. Generate Prisma client (postinstall runs this automatically, but you can run manually):

```bash
npm run db:generate
```

3. Run the initial Prisma migrations / create DB schema (local dev):

```bash
# Creates migration and applies locally
npx prisma migrate dev -n init
# or use the provided npm script
npm run db:migrate
```

4. Seed database (if needed):

```bash
npm run db:seed
```

5. Start dev server:

```bash
npm run dev
```

Open http://localhost:3000

---

## New schema changes (example: password reset tokens)

When you add or change Prisma models, run a migration locally:

```bash
# create + apply migration locally
npx prisma migrate dev -n add_password_reset_tokens
# publish client (same as `npm run db:generate`)
npx prisma generate
```

In CI / Production you should run:

```bash
# Apply migrations on production database (no prompts)
npx prisma migrate deploy
# ensure the client is generated
npx prisma generate
```

> Use `prisma migrate deploy` in your deployment pipeline (e.g., in Docker startup or CI job).

---

## Quick verification / testing commands

- Check DB schema:

```bash
npx prisma db pull   # inspect live DB
npx prisma studio    # visual DB UI
```

- Send test invite/reset flow (super-admin required):

```bash
# Invite (curl)
curl -X POST http://localhost:3000/api/invite-user \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}' \
  -b '<your-nextauth-cookie-here>'

# Reset an existing user (super-admin)
curl -X POST http://localhost:3000/api/reset-password-for-user \
  -H 'Content-Type: application/json' \
  -d '{"email":"existing@example.com"}' \
  -b '<your-nextauth-cookie-here>'
```

- Inspect `password_reset_tokens` table (once migration applied):

```sql
select id, user_id, expires_at, used_at, created_at from password_reset_tokens order by created_at desc;
```

---

## Production tips

- Don't run `prisma migrate dev` in production; run `npx prisma migrate deploy` from your CI/CD pipeline.
- Ensure your host (Vercel, Fly, DigitalOcean, etc.) has all the env vars configured securely.
- Verify your outgoing email domain and Sender identity in Resend to avoid deliverability issues.
- Use `NEXTAUTH_SECRET` and proper cookie/session policies for security.

---

## Commands summary (copy/paste)

```bash
# install
npm install

# local migrations & generate
npx prisma migrate dev -n add_password_reset_tokens
npx prisma generate

# seed
npm run db:seed

# build and start (production)
npm run build
npm start

# production migrate (CI)
npx prisma migrate deploy
npx prisma generate
```

---

If you want, I can add a deploy script or GitHub Actions workflow that applies migrations during your deploys and fail-safe checks for missing env vars. Want me to scaffold that next? 🔧
