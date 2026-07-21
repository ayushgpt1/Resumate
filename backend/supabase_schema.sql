-- ============================================================
-- Rsumate Database Schema for Supabase (Updated with Multi-Tenant)
-- Run this in Supabase Dashboard → SQL Editor (all at once)
-- ============================================================

-- 1. Create open_roles table with user_id for multi-tenant isolation
CREATE TABLE IF NOT EXISTS open_roles (
    id BIGSERIAL PRIMARY KEY,
    role_name TEXT NOT NULL,
    user_id TEXT DEFAULT '',
    created_date DATE DEFAULT CURRENT_DATE
);

-- 2. Create candidates table with user_id for multi-tenant isolation
CREATE TABLE IF NOT EXISTS candidates (
    id BIGSERIAL PRIMARY KEY,
    name TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    experience TEXT DEFAULT '',
    skills JSONB DEFAULT '[]'::jsonb,
    cultural_fit TEXT DEFAULT '',
    communication TEXT DEFAULT '',
    ranking_score NUMERIC DEFAULT 0,
    explanation TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    resume_link TEXT DEFAULT '',
    user_id TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create role_candidates junction table with user_id
CREATE TABLE IF NOT EXISTS role_candidates (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT REFERENCES open_roles(id) ON DELETE CASCADE,
    candidate_id BIGINT REFERENCES candidates(id) ON DELETE CASCADE,
    ranking_score NUMERIC DEFAULT 0,
    experience TEXT DEFAULT '',
    skills JSONB DEFAULT '[]'::jsonb,
    cultural_fit TEXT DEFAULT '',
    communication TEXT DEFAULT '',
    explanation TEXT DEFAULT '',
    user_id TEXT DEFAULT '',
    UNIQUE(role_id, candidate_id)
);

-- 4. Enable Row Level Security
ALTER TABLE open_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_candidates ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies if they exist
DROP POLICY IF EXISTS "Allow anon all open_roles" ON open_roles;
DROP POLICY IF EXISTS "Allow anon all candidates" ON candidates;
DROP POLICY IF EXISTS "Allow anon all role_candidates" ON role_candidates;

-- 6. Allow public/anonymous access (for development - all operations)
CREATE POLICY "Allow anon all open_roles" ON open_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all candidates" ON candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all role_candidates" ON role_candidates FOR ALL USING (true) WITH CHECK (true);

-- 7. Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_open_roles_user_id ON open_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_role_candidates_user_id ON role_candidates(user_id);

-- ============================================================
-- Storage Bucket RLS Policies (for the "Resume" bucket)
-- Run these separately in Supabase Dashboard → Storage → Policies
-- or use the SQL Editor below.
-- ============================================================

-- 8. Storage: Allow public access to the "Resume" bucket
-- NOTE: The bucket itself must be created manually in Supabase Dashboard → Storage
-- with name "Resume" and set to "Public" mode.

-- 9. Policy: Allow anyone to view/read files in the Resume bucket
CREATE POLICY "Give public access to Resume bucket" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'Resume');

-- 10. Policy: Allow anyone to upload files to the Resume bucket
CREATE POLICY "Allow public uploads to Resume bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'Resume');

-- 11. Policy: Allow anyone to delete files from the Resume bucket
CREATE POLICY "Allow public deletes from Resume bucket" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'Resume');

-- 12. Policy: Allow anyone to update files in the Resume bucket
CREATE POLICY "Allow public updates to Resume bucket" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'Resume')
  WITH CHECK (bucket_id = 'Resume');
