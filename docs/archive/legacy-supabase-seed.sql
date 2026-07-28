-- Migration Script: Supabase to New Postgres Schema
-- This script migrates data from the old Supabase database to the new Prisma schema
-- 
-- IMPORTANT: Run this after running `npx prisma db push` to create the tables
--
-- Password note: Users are created with bcrypt-hashed password "changeme123"
-- Users should change their password after first login

-- ============================================================================
-- 1. CREATE USERS
-- ============================================================================
-- The old Supabase user IDs need to be mapped to new user IDs
-- We'll use deterministic CUIDs based on the original UUIDs for easy reference

-- User 1: Chathura (macm.dev) - OLD ID: 8ee0f05a-8fc4-4e26-9286-c70cc863de08
-- User 2: Taniya (taniya.dev) - OLD ID: 08e00d1b-eabe-4bbc-9493-28c475036c17

INSERT INTO "users" ("id", "email", "password_hash", "email_verified", "created_at", "updated_at") VALUES
-- Password: changeme123 (bcrypt hash with 12 rounds)
('cluser_chathura_001', 'chathura@macm.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G3zqRz.QLVqWMi', '2025-12-09 09:10:10.585854+00', '2025-12-09 09:10:10.585854+00', NOW()),
('cluser_taniya_002', 'taniya@taniya.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G3zqRz.QLVqWMi', '2025-12-09 13:10:13.323075+00', '2025-12-09 13:10:13.323075+00', NOW());

-- ============================================================================
-- 2. CREATE PROFILES
-- ============================================================================

INSERT INTO "profiles" (
  "id", "user_id", "domain", "full_name", "tagline", "theme", 
  "avatar_url", "background_image_url", "favicon_url", "contact_numbers",
  "active_resume_role", "home_page_data", "about_page_data", "created_at", "updated_at"
) VALUES
-- Chathura's profile (macm.dev)
(
  'clprofile_chathura_001',
  'cluser_chathura_001',
  'macm.dev',
  'Chathura Madhushanka',
  'Full Stack Developer - DevOps and AI',
  '{"--card":"222 47% 11%","--ring":"186 100% 69%","--input":"222 40% 15%","--muted":"222 40% 15%","--accent":"270 95% 75%","--border":"222 40% 20%","--popover":"222 47% 11%","--primary":"93 54% 71%","--glass-bg":"253 78% 18%","--secondary":"217 100% 50%","--background":"0 0% 38%","--foreground":"210 40% 98%","--destructive":"0 84.2% 60.2%","--glass-border":"222 40% 25%","--card-foreground":"210 40% 98%","--muted-foreground":"215 20.2% 65.1%","--accent-foreground":"222 47% 7%","--popover-foreground":"210 40% 98%","--primary-foreground":"222 47% 7%","--background-secondary":"222 47% 9%","--secondary-foreground":"222 47% 7%","--destructive-foreground":"210 40% 98%"}',
  NULL, -- avatar_url - will need to re-upload to new S3
  NULL, -- background_image_url - will need to re-upload to new S3
  NULL, -- favicon_url
  '[{"id":"contact-1765293336840","label":"Mobile","number":"+94 78 123 0 275","isActive":true,"isPrimary":true},{"id":"contact-1765293373459","label":"Mobile - secondary","number":"+94 77 020 1218","isActive":true,"isPrimary":false}]',
  'Full stack developer',
  '{"name":"Chathura Madhushanka","tagline":"Full Stack Developer - DevOps and AI","socialLinks":[{"href":"https://github.com/MACM18","icon":"Fa.FaGithub","label":"FAGithub","platform":"FAGithub"},{"href":"http://linkedin.com/in/chathura-m","icon":"Fa.FaLinkedinIn","label":"FALinkedin In","platform":"FALinkedin In"},{"href":"https://x.com/chathur27358499?s=21","icon":"Bs.BsTwitterX","label":"BSTwitter X","platform":"BSTwitter X"}],"achievements":[],"callToAction":{"email":"chathura@macm.dev","title":"Let''s Connect & Collaborate","description":"I''m always excited to discuss new opportunities, share ideas, or explore potential collaborations. Feel free to reach out!"},"technicalExpertise":[{"name":"Full stack development","skills":["Next.js","Wordpress"]},{"name":"Frontedn development ","skills":["React","Javascript","Typescript","vue","qwik",""]},{"name":"Backend and Database","skills":["Laravel","Express","MySQL","MongoDB","Postgres","Supabase"]},{"name":"Deployment","skills":["Git","Github","CI/CD","Github Actions","Linux","VPS managment"]},{"name":"Clould platfrom","skills":["GCP and Azure - beginner"]}],"experienceHighlights":[{"title":"Years experiance","metric":"2+","subtitle":"Development","description":"I have been working in the field as well as academic projects. Individual projects "}],"about_card_description":""}',
  '{"story":["story pending"],"title":"It''s me","skills":[],"subtitle":"Started as a dev and now moving with devops, AI. Continuing to widen my area of expertise.","callToAction":{"email":"chathura@macm.dev","title":"Ready to Work Together?","description":"I''m always open to discussing new opportunities and interesting projects. Let''s connect and see how we can create something amazing together."},"contactNumbers":[{"id":"contact-1765293336840","label":"Mobile","number":"+94 78 123 0 275","isActive":true,"isPrimary":true},{"id":"contact-1765293373459","label":"Mobile - secondary","number":"+94 77 020 1218","isActive":true,"isPrimary":false}]}',
  '2025-12-09 09:10:10.585854+00',
  NOW()
),
-- Taniya's profile (taniya.dev)
(
  'clprofile_taniya_002',
  'cluser_taniya_002',
  'taniya.dev',
  'Taniya Aththanayaka',
  'Welcome to my portfolio',
  '{"accent":"280 80% 50%","primary":"221 83% 53%","accent-glow":"280 80% 60%","primary-glow":"221 83% 63%","primary-muted":"221 83% 23%","primary-foreground":"0 0% 100%"}',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"name":"Taniya","tagline":"Welcome to my portfolio","socialLinks":[],"achievements":[],"callToAction":{"email":"machathuramadushanka@outlook.com","title":"Let''s Connect","description":"I''m always open to discussing new opportunities."},"technicalExpertise":[],"experienceHighlights":[]}',
  '{"story":["Tell your story here..."],"title":"About Me","skills":[],"subtitle":"My Journey","callToAction":{"email":"machathuramadushanka@outlook.com","title":"Get in Touch","description":"Let''s work together!"}}',
  '2025-12-09 13:10:13.323075+00',
  NOW()
);

-- ============================================================================
-- 3. CREATE UPLOADED RESUMES
-- ============================================================================

INSERT INTO "uploaded_resumes" (
  "id", "user_id", "file_path", "public_url", "original_filename", "file_size", "created_at"
) VALUES
(
  'clupload_resume_001',
  'cluser_chathura_001',
  'cluser_chathura_001/Full-stack-developer-1765330381481.pdf',
  NULL, -- Will need to re-upload to new S3 storage
  'Chathura Madhushanka-Resume.pdf',
  54485,
  '2025-12-10 01:33:11.132735+00'
);

-- ============================================================================
-- 4. CREATE RESUMES
-- ============================================================================

INSERT INTO "resumes" (
  "id", "user_id", "role", "title", "summary", "skills", "experience", 
  "education", "certifications", "project_ids", "resume_url", "pdf_source",
  "location", "uploaded_resume_id", "created_at", "updated_at"
) VALUES
(
  'clresume_001',
  'cluser_chathura_001',
  'Full stack developer',
  '',
  'As a versatile Full Stack Developer with a strong foundation in development, I am expanding my expertise into DevOps and AI, driven by a passion for continuous learning and growth. With a solid understanding of software development principles, I am poised to leverage my skills in innovative projects that integrate DevOps and AI. I am excited to collaborate with like-minded professionals and explore new opportunities that combine technology and creativity. With a strong desire to deliver exceptional results, I am ready to bring my skills and enthusiasm to a dynamic team and contribute to the development of cutting-edge solutions.',
  ARRAY['Next.js','Laravel','AI assisted Development','React','Wordpress','SQL'],
  '[]'::jsonb,
  '[{"year":"2025","degree":"Bachelor of Information Communication Technology (Hons.)","school":"University of Jaffna"}]'::jsonb,
  '[]'::jsonb,
  ARRAY[]::text[],
  NULL, -- Will need to re-generate or re-upload
  'uploaded',
  'No 89, Welikala, Pokunuwita, Sri Lanka',
  'clupload_resume_001',
  '2025-12-10 01:35:18.238815+00',
  NOW()
);

-- ============================================================================
-- 5. CREATE WORK EXPERIENCES
-- ============================================================================

INSERT INTO "work_experiences" (
  "id", "user_id", "company", "position", "location", 
  "start_date", "end_date", "is_current", "visible", "description",
  "created_at", "updated_at"
) VALUES
-- Current position
(
  'clwork_001',
  'cluser_chathura_001',
  'Altitude1 Pvt. Ltd',
  'Web Application Developer',
  'Colombo',
  '2025-04-01',
  NULL,
  true,
  true,
  ARRAY[]::text[],
  '2025-12-10 01:31:05.762839+00',
  NOW()
),
-- Associate web developer
(
  'clwork_002',
  'cluser_chathura_001',
  'Altitude1 Pvt. Ltd',
  'Associate web developer',
  'Colombo',
  '2024-09-01',
  '2024-11-01',
  false,
  true,
  ARRAY[]::text[],
  '2025-12-10 01:30:04.344765+00',
  NOW()
),
-- Wordpress Developer
(
  'clwork_003',
  'cluser_chathura_001',
  'Altitude1 Pvt. Ltd',
  'Wordpress Developerr',
  'Colombo',
  '2024-03-01',
  '2024-09-01',
  false,
  true,
  ARRAY[]::text[],
  '2025-12-10 01:29:15.217994+00',
  NOW()
);

-- ============================================================================
-- NOTES FOR POST-MIGRATION
-- ============================================================================
-- 
-- 1. PASSWORDS: All users have been created with the password "changeme123"
--    Users should change their passwords immediately after first login.
--    To generate a new bcrypt hash, use: 
--    await bcrypt.hash('yourpassword', 12)
--
-- 2. STORAGE FILES: Image and PDF URLs were from Supabase storage.
--    You'll need to:
--    - Download the files from the old Supabase storage
--    - Upload them to your new S3-compatible storage
--    - Update the avatar_url, background_image_url, resume_url fields
--
-- 3. OLD USER ID MAPPING:
--    - Chathura: 8ee0f05a-8fc4-4e26-9286-c70cc863de08 → cluser_chathura_001
--    - Taniya: 08e00d1b-eabe-4bbc-9493-28c475036c17 → cluser_taniya_002
--
-- ============================================================================
