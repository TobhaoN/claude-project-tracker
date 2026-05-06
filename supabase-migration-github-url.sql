-- Migration: add github_url column to projects.
-- Run this once in your Supabase SQL editor if your projects table
-- was created before this column existed.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS github_url TEXT;
