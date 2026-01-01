-- Redesign gradients to use visual pattern types
BEGIN;

-- Drop old columns
ALTER TABLE gradients DROP COLUMN IF EXISTS type;
ALTER TABLE gradients DROP COLUMN IF EXISTS angle;
ALTER TABLE gradients DROP COLUMN IF EXISTS pattern;

-- Add new columns for pattern-based gradients
ALTER TABLE gradients ADD COLUMN IF NOT EXISTS pattern_type text DEFAULT 'diagonal';
UPDATE gradients SET pattern_type = 'diagonal' WHERE pattern_type IS NULL;
ALTER TABLE gradients ALTER COLUMN pattern_type SET NOT NULL;

-- Ensure intensity has proper default
UPDATE gradients SET intensity = 'subtle' WHERE intensity IS NULL;
ALTER TABLE gradients ALTER COLUMN intensity SET NOT NULL;

-- Clear old gradient data
DELETE FROM gradients;

-- Seed new pattern-based gradient presets
INSERT INTO gradients (id, name, pattern_type, intensity, description) VALUES
  ('grad_diagonal_subtle', 'Diagonal Flow', 'diagonal', 'subtle', 'Classic diagonal gradient from primary to accent'),
  ('grad_diagonal_medium', 'Diagonal Bold', 'diagonal', 'medium', 'More visible diagonal gradient'),
  ('grad_radial_subtle', 'Radial Glow', 'radial', 'subtle', 'Soft radial gradient emanating from corner'),
  ('grad_radial_medium', 'Radial Burst', 'radial', 'medium', 'Prominent radial effect'),
  ('grad_mesh_subtle', 'Mesh Pattern', 'mesh', 'subtle', 'Multiple gradients creating a mesh effect'),
  ('grad_mesh_vibrant', 'Mesh Bold', 'mesh', 'vibrant', 'Strong mesh pattern for impact'),
  ('grad_spiral_subtle', 'Spiral Swirl', 'spiral', 'subtle', 'Conic gradient creating a spiral effect'),
  ('grad_wave_subtle', 'Wave Flow', 'wave', 'subtle', 'Smooth wave-like gradient transition'),
  ('grad_wave_medium', 'Wave Motion', 'wave', 'medium', 'Dynamic wave pattern'),
  ('grad_dots_subtle', 'Dot Matrix', 'dots', 'subtle', 'Subtle dotted pattern overlay')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  pattern_type = EXCLUDED.pattern_type,
  intensity = EXCLUDED.intensity,
  description = EXCLUDED.description;

COMMIT;
