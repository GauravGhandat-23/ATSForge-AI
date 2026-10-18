-- ============================================================
-- ATSForge AI — Production PostgreSQL Schema for Vercel
-- Compatible with Vercel Postgres / Neon Serverless Postgres
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  google_id VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  target_role VARCHAR(255),
  target_company VARCHAR(255),
  ats_score INTEGER,
  template_id VARCHAR(64) DEFAULT 'ats-classic',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- 3. Resume Versions Table
CREATE TABLE IF NOT EXISTS resume_versions (
  id VARCHAR(64) PRIMARY KEY,
  resume_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label VARCHAR(255),
  target_role VARCHAR(255),
  ats_score INTEGER,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_user ON resume_versions(user_id, resume_id);

-- 4. ATS Match Scans Table
CREATE TABLE IF NOT EXISTS ats_scans (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id VARCHAR(64),
  job_title VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ats_scans_user_id ON ats_scans(user_id);

-- 5. Cover Letters Table
CREATE TABLE IF NOT EXISTS cover_letters (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id VARCHAR(64),
  job_title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  tone VARCHAR(64) DEFAULT 'Professional',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);

-- 6. Manual Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_url TEXT,
  location VARCHAR(255),
  application_date VARCHAR(64),
  status VARCHAR(64) NOT NULL DEFAULT 'Applied',
  notes TEXT,
  interview_date VARCHAR(64),
  salary VARCHAR(128),
  contact VARCHAR(255),
  follow_up_date VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- 7. Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary VARCHAR(128),
  url TEXT,
  description TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);

-- 8. Interview Preparation Table
CREATE TABLE IF NOT EXISTS interview_prep (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id VARCHAR(64),
  job_description TEXT,
  questions JSONB NOT NULL,
  practice_sessions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_prep_user_id ON interview_prep(user_id);

-- 9. Skills Gap Analysis Table
CREATE TABLE IF NOT EXISTS skills_gap (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id VARCHAR(64),
  job_description TEXT,
  gap_items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_gap_user_id ON skills_gap(user_id);
