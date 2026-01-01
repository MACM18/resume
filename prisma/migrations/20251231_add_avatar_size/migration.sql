-- Add avatar_size column to profiles
BEGIN;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_size integer;
-- Set a sensible default for existing rows
UPDATE profiles SET avatar_size = 320 WHERE avatar_size IS NULL;
COMMIT;