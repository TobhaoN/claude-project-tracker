-- Migration: add project_url and project_url_label columns to projects.
-- Run this once in your Supabase SQL editor.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_url TEXT,
  ADD COLUMN IF NOT EXISTS project_url_label TEXT;
