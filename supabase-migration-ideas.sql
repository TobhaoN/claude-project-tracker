-- Migration: Project Ideas feature.
-- Run this once in your Supabase SQL editor.

CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  brands TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  use_case TEXT NOT NULL,
  value_prop TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'approved', 'rejected', 'converted')),
  converted_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ideas are viewable by everyone"
  ON ideas FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit ideas"
  ON ideas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update ideas"
  ON ideas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete ideas"
  ON ideas FOR DELETE
  USING (true);
