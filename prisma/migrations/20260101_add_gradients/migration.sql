-- Add gradients table and profile selected gradient fields
BEGIN;

-- Create gradients table
CREATE TABLE IF NOT EXISTS gradients (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'linear',
  angle integer,
  color_stops jsonb NOT NULL,
  preview_css text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add selected gradient columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_gradient_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_gradient_use_theme boolean DEFAULT false;

-- Add foreign key (Postgres versions that don't support ADD CONSTRAINT IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_selected_gradient_id_fkey'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_selected_gradient_id_fkey FOREIGN KEY (selected_gradient_id) REFERENCES gradients(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Seed: insert default gradient presets
INSERT INTO gradients (id, name, type, angle, color_stops, preview_css)
VALUES
  ('grad_soft_sunrise', 'Soft Sunrise', 'linear', 135, '[{"color":"#FFB199","alpha":0.06,"stop":0},{"color":"#FFD29F","alpha":0.04,"stop":100}]', 'linear-gradient(135deg, rgba(255,177,153,0.06) 0%, rgba(255,210,159,0.04) 100%)'),
  ('grad_ocean_mist', 'Ocean Mist', 'linear', 120, '[{"color":"#38BDF8","alpha":0.06,"stop":0},{"color":"#60A5FA","alpha":0.04,"stop":100}]', 'linear-gradient(120deg, rgba(56,189,248,0.06) 0%, rgba(96,165,250,0.04) 100%)'),
  ('grad_muted_indigo', 'Muted Indigo', 'linear', 145, '[{"color":"#6366F1","alpha":0.06,"stop":0},{"color":"#4F46E5","alpha":0.04,"stop":100}]', 'linear-gradient(145deg, rgba(99,102,241,0.06) 0%, rgba(79,70,229,0.04) 100%)'),
  ('grad_warm_stone', 'Warm Stone', 'linear', 135, '[{"color":"#F1E9D2","alpha":0.06,"stop":0},{"color":"#E6E7E9","alpha":0.03,"stop":100}]', 'linear-gradient(135deg, rgba(241,233,210,0.06) 0%, rgba(230,231,233,0.03) 100%)'),
  ('grad_soft_teal', 'Soft Teal Glow', 'linear', 110, '[{"color":"#2DD4BF","alpha":0.06,"stop":0},{"color":"#34D399","alpha":0.04,"stop":100}]', 'linear-gradient(110deg, rgba(45,212,191,0.06) 0%, rgba(52,211,153,0.04) 100%)')
ON CONFLICT DO NOTHING;

COMMIT;