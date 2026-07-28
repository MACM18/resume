-- Read-only audit for migrated records. Run against the active PostgreSQL DB.
SELECT 'profiles' AS source, id, avatar_url, background_image_url
FROM profiles
WHERE avatar_url ILIKE '%supabase%'
   OR background_image_url ILIKE '%supabase%';

SELECT 'resumes' AS source, id, resume_url
FROM resumes
WHERE resume_url ILIKE '%supabase%';

SELECT 'uploaded_resumes' AS source, id, public_url
FROM uploaded_resumes
WHERE public_url ILIKE '%supabase%';

-- After replacing the values with the active public storage URL, rerun the
-- queries above and confirm that zero rows are returned.
