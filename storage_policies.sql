-- Storage Bucket RLS Policies for Supabase
-- Run this SQL in your Supabase SQL editor to enable image uploads

-- ============================================
-- 1. PROFILE IMAGES BUCKET
-- ============================================
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to profile images
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- ============================================
-- 2. BACKGROUND IMAGES BUCKET
-- ============================================
CREATE POLICY "Users can upload their own background images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'background-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own background images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'background-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own background images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'background-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view background images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'background-images');

-- ============================================
-- 3. PROJECT IMAGES BUCKET
-- ============================================
CREATE POLICY "Users can upload their own project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- ============================================
-- 4. FAVICONS BUCKET
-- ============================================
CREATE POLICY "Users can upload their own favicons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'favicons' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own favicons"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'favicons' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own favicons"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'favicons' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view favicons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'favicons');

-- ============================================
-- 5. RESUMES BUCKET
-- ============================================
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- ============================================
-- NOTES:
-- ============================================
-- 1. Make sure each bucket exists before running these policies.
--    Create buckets in Supabase Dashboard > Storage > New bucket
--    
-- 2. Set each bucket to "Public" in the dashboard for public read access,
--    or rely on the SELECT policies above.
--
-- 3. If you get "policy already exists" errors, you may need to drop
--    existing policies first:
--    DROP POLICY IF EXISTS "policy_name" ON storage.objects;
