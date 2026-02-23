/*
  # Create Lessons System

  ## Overview
  This migration creates a comprehensive lessons management system with video content 
  from YouTube and file attachments for each lesson.

  ## New Tables
  
  ### `lessons`
  Core table for storing lesson information:
  - `id` (uuid, primary key) - Unique lesson identifier
  - `title` (text) - Lesson title
  - `description` (text) - Detailed lesson description
  - `youtube_url` (text) - YouTube video URL
  - `youtube_video_id` (text) - Extracted YouTube video ID for embedding
  - `order_index` (integer) - Sort order for displaying lessons
  - `duration_minutes` (integer) - Approximate lesson duration
  - `difficulty_level` (text) - Difficulty: 'beginner', 'intermediate', 'advanced'
  - `is_published` (boolean) - Whether lesson is visible to students
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `lesson_files`
  Table for storing file attachments for lessons:
  - `id` (uuid, primary key) - Unique file identifier
  - `lesson_id` (uuid, foreign key) - Reference to lessons table
  - `file_name` (text) - Original file name
  - `file_url` (text) - Storage URL for the file
  - `file_size` (bigint) - File size in bytes
  - `file_type` (text) - MIME type of the file
  - `description` (text) - Optional file description
  - `created_at` (timestamptz) - Upload timestamp

  ## Security
  
  ### Row Level Security (RLS)
  Both tables have RLS enabled with the following policies:
  
  #### Public Read Access
  - Anyone can view published lessons
  - Anyone can view files attached to published lessons
  
  #### Admin Full Access
  - Users with role='admin' in profiles table can:
    - Create, read, update, and delete lessons
    - Upload and manage lesson files

  ## Indexes
  - Index on `lessons.order_index` for efficient sorting
  - Index on `lessons.is_published` for filtering published content
  - Index on `lesson_files.lesson_id` for efficient file lookup
*/

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  youtube_url text NOT NULL,
  youtube_video_id text NOT NULL,
  order_index integer DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lesson_files table
CREATE TABLE IF NOT EXISTS lesson_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lesson_files_lesson_id ON lesson_files(lesson_id);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_files ENABLE ROW LEVEL SECURITY;

-- Lessons policies

-- Public can view published lessons
CREATE POLICY "Anyone can view published lessons"
  ON lessons
  FOR SELECT
  USING (is_published = true);

-- Admin can view all lessons
CREATE POLICY "Admin can view all lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert lessons
CREATE POLICY "Admin can insert lessons"
  ON lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update lessons
CREATE POLICY "Admin can update lessons"
  ON lessons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete lessons
CREATE POLICY "Admin can delete lessons"
  ON lessons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Lesson files policies

-- Public can view files for published lessons
CREATE POLICY "Anyone can view files for published lessons"
  ON lesson_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = lesson_files.lesson_id
      AND lessons.is_published = true
    )
  );

-- Admin can view all lesson files
CREATE POLICY "Admin can view all lesson files"
  ON lesson_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert lesson files
CREATE POLICY "Admin can insert lesson files"
  ON lesson_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update lesson files
CREATE POLICY "Admin can update lesson files"
  ON lesson_files
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete lesson files
CREATE POLICY "Admin can delete lesson files"
  ON lesson_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create storage bucket for lesson files
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-files', 'lesson-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lesson-files bucket

-- Anyone can read files from public bucket
CREATE POLICY "Anyone can view lesson files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'lesson-files');

-- Admin can upload lesson files
CREATE POLICY "Admin can upload lesson files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update lesson files
CREATE POLICY "Admin can update lesson files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lesson-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete lesson files
CREATE POLICY "Admin can delete lesson files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lesson-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
