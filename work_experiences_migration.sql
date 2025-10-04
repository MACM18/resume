-- Create work_experiences table for user-managed work history
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS work_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL when current
  is_current BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  description TEXT[] NOT NULL DEFAULT '{}', -- bullet points
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_work_experiences_user_id ON work_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experiences_visible ON work_experiences(visible);
CREATE INDEX IF NOT EXISTS idx_work_experiences_current ON work_experiences(is_current);
CREATE INDEX IF NOT EXISTS idx_work_experiences_dates ON work_experiences(user_id, start_date DESC NULLS LAST, end_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_work_experiences_sort
  ON work_experiences(user_id, is_current DESC, end_date DESC NULLS FIRST, start_date DESC);

-- Enable Row Level Security
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD only their own experiences
CREATE POLICY "Users can view own work experiences" ON work_experiences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work experiences" ON work_experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work experiences" ON work_experiences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own work experiences" ON work_experiences
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure only one current role per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_work_experiences_one_current_per_user
  ON work_experiences(user_id)
  WHERE is_current = true;

-- Allow public (anon) to view visible experiences
DO $$
BEGIN
  CREATE POLICY "Public can view visible work experiences" ON work_experiences
    FOR SELECT USING (visible = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
