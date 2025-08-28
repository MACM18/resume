-- Create uploaded_resumes table to track PDF uploads separately from resume entries
CREATE TABLE uploaded_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- Storage path like "userId/role-timestamp.pdf"
  public_url TEXT, -- Cached public URL (can be regenerated from file_path)
  original_filename TEXT NOT NULL, -- Original file name for display
  file_size INTEGER, -- File size in bytes (optional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries by user
CREATE INDEX idx_uploaded_resumes_user_id ON uploaded_resumes(user_id);

-- Add uploaded_resume_id foreign key to existing resumes table
ALTER TABLE resumes ADD COLUMN uploaded_resume_id UUID REFERENCES uploaded_resumes(id) ON DELETE SET NULL;

-- Add index for the foreign key
CREATE INDEX idx_resumes_uploaded_resume_id ON resumes(uploaded_resume_id);

-- Enable RLS (Row Level Security)
ALTER TABLE uploaded_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own uploaded resumes
CREATE POLICY "Users can view own uploaded resumes" ON uploaded_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploaded resumes" ON uploaded_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploaded resumes" ON uploaded_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploaded resumes" ON uploaded_resumes
  FOR DELETE USING (auth.uid() = user_id);
