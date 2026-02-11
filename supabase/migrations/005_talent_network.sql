-- Talent Network: profiles table
CREATE TABLE talent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  linkedin_url text,
  location text,
  departments text[] NOT NULL,
  resume_path text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_talent_email ON talent_profiles(email);

-- RLS: allow public INSERT, no public SELECT
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON talent_profiles
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Storage: create private resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;
