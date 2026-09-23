# Deployment and single-owner migration

This app now publishes one portfolio. The owner is stored in `site_settings`, selected once from the existing `macm.dev` domain claim. The legacy `domains` rows remain in the database for rollback but are no longer used by the application.

## Runtime configuration

Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://macm.dev`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` in the deployment environment. Configure the existing S3-compatible storage variables (`STORAGE_MAIN_DOMAIN`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`, `STORAGE_FOLDER`, and `STORAGE_REGION`) as appropriate for the current deployment. `GROQ_API_KEY` is needed only for the optional AI writing tools. Keep secrets out of the image and repository.

Use `pnpm@10.4.1` and the committed `pnpm-lock.yaml`. The Docker build uses `pnpm install --frozen-lockfile`.

## Existing macm.dev production rollout

1. **Back up the database.** Record the current image tag for rollback. Check the existing claim and its content owner:

   ```sql
   SELECT d.domain, p.id AS profile_id, p.user_id, u.email,
          (SELECT count(*) FROM projects WHERE user_id = p.user_id) AS projects,
          (SELECT count(*) FROM resumes WHERE user_id = p.user_id) AS resumes
   FROM domains d
   JOIN profiles p ON p.id = d.profile_id
   JOIN users u ON u.id = p.user_id
   WHERE lower(d.domain) IN ('macm.dev', 'www.macm.dev');
   ```

   Confirm that this is the intended owner. Check `pnpm exec prisma migrate status` against the production database. If earlier `db push` operations left migration history inconsistent, reconcile that history before releasing; the new container stops on any Prisma migration failure.

2. **Deploy to the macm.dev Dokploy application.** The entrypoint runs `prisma migrate deploy` before starting Next.js. Migration `20260923_single_site_owner` creates `site_settings` and assigns the owner from the existing claim. It leaves all user, profile, project, resume, gallery, media, and domain rows in place. It refuses to guess an owner if profiles exist but no `macm.dev` claim does.

3. **Verify the deployed owner and routes:**

   ```sql
   SELECT s.owner_user_id, u.email, p.full_name
   FROM site_settings s
   JOIN users u ON u.id = s.owner_user_id
   JOIN profiles p ON p.user_id = u.id
   WHERE s.id = 1;
   ```

   The owner ID must match the preflight query. Check `/`, `/projects`, `/resume`, `/gallery`, and `/admin`; sign in as the owner and save a harmless dashboard edit. `POST /api/auth/signup` should return 403. Public pages should show the same content on any host routed to this application.

4. **Rollback if needed.** Restore the previous image tag. The migration is additive, and the older image can still read the retained `domains` rows and content. Do not seed or delete data as part of rollback.

The second Dokploy webhook is opt-in through the GitHub Actions variable `DEPLOY_SECOND_APP=true`. Leave it unset until the second application's purpose and database have been checked. A separate person's database without a `macm.dev` claim cannot use this single-owner release as written.

## Fresh local database

The repository's historical Prisma migration directory is not a full baseline for an empty database. For local development, create a fresh schema with `pnpm db:push`, then seed a single owner:

```bash
pnpm install --frozen-lockfile
pnpm db:push
SEED_OWNER_PASSWORD='use-a-unique-long-password' pnpm db:seed
pnpm dev
```

Never run `pnpm db:seed` against production. For future production schema changes, use reviewed Prisma migrations and `pnpm migrate:deploy`; do not run `prisma db push` on production.
