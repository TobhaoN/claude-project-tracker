-- Migration: project images (gallery) feature.
-- Run this once in your Supabase SQL editor.
--
-- Step 1 (DASHBOARD): also create a Storage bucket named "project-images"
--   Supabase Dashboard -> Storage -> New bucket -> Name: project-images -> Public bucket: ON
--
-- Step 2 (SQL): run this whole file in the SQL Editor.

CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id
  ON project_images(project_id);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project images are viewable by everyone"
  ON project_images FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add project images"
  ON project_images FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update project images"
  ON project_images FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete project images"
  ON project_images FOR DELETE
  USING (true);

-- Storage bucket policies (run AFTER you create the "project-images" bucket).
-- These allow public read + open uploads/deletes (matches the rest of this app).

CREATE POLICY "Public can read project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Anyone can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Anyone can delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images');
