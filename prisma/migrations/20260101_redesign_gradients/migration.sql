-- Redesign gradients table to use theme-aware patterns
BEGIN;

-- Drop old columns from gradients table
ALTER TABLE gradients DROP COLUMN IF EXISTS color_stops;
ALTER TABLE gradients DROP COLUMN IF EXISTS preview_css;

-- Add new columns for theme-aware gradients
ALTER TABLE gradients ADD COLUMN IF NOT EXISTS intensity text DEFAULT 'subtle';
ALTER TABLE gradients ADD COLUMN IF NOT EXISTS pattern text DEFAULT 'primary-accent';
ALTER TABLE gradients ADD COLUMN IF NOT EXISTS description text;

-- Make angle NOT NULL with default
ALTER TABLE gradients ALTER COLUMN angle SET DEFAULT 135;
ALTER TABLE gradients ALTER COLUMN angle SET NOT NULL;

-- Drop old column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS selected_gradient_use_theme;

-- Clear old gradient data
DELETE FROM gradients;

-- Seed new theme-aware gradient presets
INSERT INTO gradients (id, name, type, angle, intensity, pattern, description) VALUES
  ('grad_primary_subtle', 'Primary Flow', 'linear', 135, 'subtle', 'primary-accent', 'Subtle gradient using your primary and accent colors'),
  ('grad_secondary_subtle', 'Secondary Drift', 'linear', 120, 'subtle', 'secondary-primary', 'Gentle flow from secondary to primary'),
  ('grad_accent_subtle', 'Accent Wave', 'linear', 145, 'subtle', 'accent-secondary', 'Smooth accent to secondary transition'),
  ('grad_primary_medium', 'Primary Bold', 'linear', 135, 'medium', 'primary-accent', 'More visible gradient with primary colors'),
  ('grad_warm_subtle', 'Warm Glow', 'linear', 135, 'subtle', 'warm', 'Warm sunset-inspired gradient'),
  ('grad_cool_subtle', 'Cool Breeze', 'linear', 110, 'subtle', 'cool', 'Cool ocean-inspired gradient'),
  ('grad_warm_medium', 'Warm Embrace', 'linear', 135, 'medium', 'warm', 'Bold warm gradient'),
  ('grad_cool_medium', 'Cool Depth', 'linear', 120, 'medium', 'cool', 'Bold cool gradient')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  angle = EXCLUDED.angle,
  intensity = EXCLUDED.intensity,
  pattern = EXCLUDED.pattern,
  description = EXCLUDED.description;

COMMIT;
