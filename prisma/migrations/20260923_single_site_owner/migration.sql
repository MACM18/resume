CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
  "owner_user_id" TEXT NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE RESTRICT,
  CONSTRAINT "site_settings_singleton" CHECK ("id" = 1)
);

DO $$
DECLARE selected_owner TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "site_settings" WHERE "id" = 1) THEN
    SELECT p."user_id" INTO selected_owner
      FROM "domains" d JOIN "profiles" p ON p."id" = d."profile_id"
      WHERE lower(d."domain") IN ('macm.dev', 'www.macm.dev')
      ORDER BY CASE WHEN lower(d."domain") = 'macm.dev' THEN 0 ELSE 1 END
      LIMIT 1;

    IF selected_owner IS NULL AND EXISTS (SELECT 1 FROM "profiles") THEN
      RAISE EXCEPTION 'No macm.dev profile claim found. Keep the old app running and assign the owner explicitly before deploying.';
    END IF;

    IF selected_owner IS NOT NULL THEN
      INSERT INTO "site_settings" ("id", "owner_user_id") VALUES (1, selected_owner);
    END IF;
  END IF;
END $$;
