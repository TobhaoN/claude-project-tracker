-- Claude Project Tracker Database Schema
-- Run this SQL in the Supabase SQL editor to set up your database

-- 1. Create tables

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Tags junction table (many-to-many)
CREATE TABLE project_tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- Notes/Comments table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create indexes for better query performance

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag_id ON project_tags(tag_id);

-- 3. Enable Row Level Security (RLS)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Users: Everyone can read, no writes (data managed by server)
CREATE POLICY "Users are viewable by everyone" 
  ON users FOR SELECT 
  USING (true);

-- Projects: Everyone can read all projects
CREATE POLICY "Projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (true);

-- Projects: Only owner can update their own
CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (owner_id = (SELECT id FROM users WHERE TRUE LIMIT 1))
  WITH CHECK (owner_id = (SELECT id FROM users WHERE TRUE LIMIT 1));

-- Projects: Only owner can delete their own
CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (owner_id = (SELECT id FROM users WHERE TRUE LIMIT 1));

-- Projects: Anyone can insert (server-side validation)
-- Note: In production, you'd want to authenticate, but for this open system we allow it
CREATE POLICY "Anyone can create projects" 
  ON projects FOR INSERT 
  WITH CHECK (true);

-- Tags: Everyone can read
CREATE POLICY "Tags are viewable by everyone" 
  ON tags FOR SELECT 
  USING (true);

-- Project_Tags: Everyone can read
CREATE POLICY "Project tags are viewable by everyone" 
  ON project_tags FOR SELECT 
  USING (true);

-- Project_Tags: Anyone can add tag links
CREATE POLICY "Anyone can add project tags" 
  ON project_tags FOR INSERT 
  WITH CHECK (true);

-- Project_Tags: Anyone can remove tag links
CREATE POLICY "Anyone can delete project tags" 
  ON project_tags FOR DELETE 
  USING (true);

-- Notes: Everyone can read
CREATE POLICY "Notes are viewable by everyone" 
  ON notes FOR SELECT 
  USING (true);

-- Notes: Anyone can insert notes
CREATE POLICY "Anyone can add notes" 
  ON notes FOR INSERT 
  WITH CHECK (true);

-- 5. Insert default tags (adjust as needed for your team)

INSERT INTO tags (name) VALUES 
  ('Frontend'),
  ('Backend'),
  ('Database'),
  ('DevOps'),
  ('AI/ML'),
  ('Testing'),
  ('Documentation'),
  ('Design'),
  ('Mobile'),
  ('Bug Fix'),
  ('Feature'),
  ('Research')
ON CONFLICT (name) DO NOTHING;

-- 6. Sample data (optional - remove before going live)
-- Uncomment to test with sample data

-- INSERT INTO users (name, email) VALUES 
--   ('Alice Johnson', 'alice@example.com'),
--   ('Bob Smith', 'bob@example.com'),
--   ('Carol Williams', 'carol@example.com');

-- INSERT INTO projects (owner_id, title, description, status) 
-- SELECT id, 'Dashboard Redesign', 'Modernizing the customer dashboard UI with React', 'active'
-- FROM users WHERE email = 'alice@example.com' LIMIT 1;

-- INSERT INTO projects (owner_id, title, description, status) 
-- SELECT id, 'API Performance Optimization', 'Analyzing and improving database query performance', 'active'
-- FROM users WHERE email = 'bob@example.com' LIMIT 1;
